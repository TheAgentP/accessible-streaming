import { useEffect, useRef } from "react";
import { isReadingAloud } from "./useSpeech";

/*
 * NARRATOR MODE: while on, the app speaks what the viewer points at or moves
 * to, using the browser's built-in voices (Web Speech API):
 *   - focus (keyboard / TV remote): always announced, interrupting what came before
 *   - hover (mouse): announced after a short pause, so sweeping the pointer
 *     across the screen doesn't babble; skipped while the speaker button is
 *     reading a description, so the description isn't cut off
 *   - values that change on screen (aria-live text such as "FONT SIZE: 44",
 *     slider positions) are announced too
 * It is off by default: viewers who already use a screen reader would
 * otherwise hear everything twice.
 */

const HOVER_DELAY_MS = 300;
const VALUE_DELAY_MS = 250;

const INTERACTIVE = 'a[href], button, input, select, textarea, [role="switch"], [tabindex]:not([tabindex="-1"])';

const synth: SpeechSynthesis | undefined =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;

function say(text: string) {
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = document.documentElement.lang || "en-US";
    synth.speak(u);
}

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

// ALL-CAPS labels ("SEARCH", "TURN ON") can be spelled out letter by letter
// by some voices, so read them as ordinary words.
const speakable = (s: string) => (/[a-z]/.test(s) ? s : s.toLowerCase());

/** Elements hidden from assistive tech (e.g. the decorative custom scrollbars) aren't narrated. */
const isHidden = (el: Element) => !!el.closest('[aria-hidden="true"]');

/** A simplified version of the browser's "accessible name" for an element. */
function accessibleName(el: Element): string {
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
        const text = labelledBy
            .split(/\s+/)
            .map((id) => clean(document.getElementById(id)?.textContent))
            .join(" ");
        if (clean(text)) return clean(text);
    }
    const ariaLabel = clean(el.getAttribute("aria-label"));
    if (ariaLabel) return ariaLabel;
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        const label = el.labels?.[0];
        if (label) return clean(label.textContent);
        return clean(el.getAttribute("placeholder"));
    }
    return clean(el.textContent);
}

/** "<name>, <role>, <state>" — e.g. "Narrator mode, switch, on". */
function describe(el: Element): string {
    const parts = [speakable(accessibleName(el))];
    const role = el.getAttribute("role");

    if (role === "switch") {
        parts.push("switch", el.getAttribute("aria-checked") === "true" ? "on" : "off");
    } else if (el instanceof HTMLInputElement) {
        if (el.type === "range") parts.push("slider", el.value);
        else if (el.type === "checkbox") parts.push("checkbox", el.checked ? "checked" : "not checked");
        else parts.push(el.type === "search" ? "search box" : "text field", el.value);
    } else if (el instanceof HTMLAnchorElement) {
        parts.push("link");
    } else if (el instanceof HTMLButtonElement || role === "button") {
        parts.push("button");
        const pressed = el.getAttribute("aria-pressed");
        if (pressed === "true") parts.push("on");
        if (pressed === "false") parts.push("off");
    } else if (role === "region") {
        parts.push("section");
    }

    if ((el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") {
        parts.push("unavailable");
    }
    return parts.filter(Boolean).join(", ");
}

export function useNarrator(enabled: boolean) {
    // Announce "Narrator on/off" only when the viewer actually flips it,
    // not on page load (or React's development-mode double run of effects).
    const previous = useRef(enabled);

    useEffect(() => {
        if (!synth) return;
        const changed = previous.current !== enabled;
        previous.current = enabled;
        if (!enabled) {
            if (changed) say("Narrator off");
            return;
        }
        if (changed) say("Narrator on");

        let hoverTimer: number | undefined;
        let valueTimer: number | undefined;
        let clickTimer: number | undefined;
        let lastHovered: Element | null = null;

        const onFocusIn = (e: FocusEvent) => {
            const el = e.target as Element;
            if (!(el instanceof Element) || isHidden(el)) return;
            window.clearTimeout(hoverTimer);
            lastHovered = el;
            say(describe(el));
        };

        const onPointerOver = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
            if (el === lastHovered) return;
            lastHovered = el;
            window.clearTimeout(hoverTimer);
            if (!el || isHidden(el)) return;
            hoverTimer = window.setTimeout(() => {
                if (!isReadingAloud()) say(describe(el));
            }, HOVER_DELAY_MS);
        };

        // Slider moved: read its new value.
        const onInput = (e: Event) => {
            const el = e.target;
            if (!(el instanceof HTMLInputElement) || el.type !== "range") return;
            window.clearTimeout(valueTimer);
            valueTimer = window.setTimeout(() => say(el.value), VALUE_DELAY_MS);
        };

        // aria-live text changed (e.g. "FONT SIZE: 44" after pressing MORE): read it.
        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                const node = m.target instanceof Element ? m.target : m.target.parentElement;
                const live = node?.closest('[aria-live]:not([aria-live="off"])');
                if (live && !isHidden(live)) {
                    window.clearTimeout(valueTimer);
                    valueTimer = window.setTimeout(
                        () => say(speakable(clean(live.textContent))),
                        VALUE_DELAY_MS,
                    );
                    return;
                }
            }
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });

        // The switch/toggle state flipped on the focused element: re-read it.
        const onClick = (e: MouseEvent) => {
            const el = (e.target as Element | null)?.closest?.('[role="switch"], [aria-pressed]');
            if (!el || isHidden(el)) return;
            // Wait for React to apply the new state before reading it.
            window.clearTimeout(clickTimer);
            clickTimer = window.setTimeout(() => {
                if (!isReadingAloud()) say(describe(el));
            }, 50);
        };

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("input", onInput);
        document.addEventListener("click", onClick);
        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("input", onInput);
            document.removeEventListener("click", onClick);
            observer.disconnect();
            window.clearTimeout(hoverTimer);
            window.clearTimeout(valueTimer);
            window.clearTimeout(clickTimer);
        };
    }, [enabled]);
}
