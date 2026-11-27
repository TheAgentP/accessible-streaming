import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "./Icons";
import "./Scrollbar.css";

type Props = {
    /** The scrollable element this scrollbar controls. Hide its native scrollbar with the `.hide-native-scrollbar` class. */
    targetRef: RefObject<HTMLElement | null>;
};

const STEP = 60; // px scrolled per arrow click
const MIN_THUMB = 32; // px

// Custom scrollbar matching the design: up arrow, draggable thumb with grip
// lines, down arrow. Mouse/touch only; keyboard users scroll the target itself
// (it's focusable), so these controls are kept out of the tab order.
export default function Scrollbar({ targetRef }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ startY: number; startScroll: number } | null>(null);

    // Position the thumb by writing styles directly (no re-render per scroll).
    useEffect(() => {
        const el = targetRef.current;
        const track = trackRef.current;
        const thumb = thumbRef.current;
        const root = rootRef.current;
        if (!el || !track || !thumb || !root) return;

        const update = () => {
            const { scrollHeight, clientHeight, scrollTop } = el;
            const scrollable = scrollHeight - clientHeight;
            // Only show the scrollbar when the content actually overflows
            // (1px tolerance for sub-pixel rounding).
            if (scrollable <= 1) {
                root.style.display = "none";
                return;
            }
            root.style.display = "";
            const trackH = track.clientHeight;
            const size = Math.max(MIN_THUMB, (trackH * clientHeight) / scrollHeight);
            const offset = ((trackH - size) * scrollTop) / scrollable;
            thumb.style.height = `${size}px`;
            thumb.style.transform = `translateY(${offset}px)`;
        };

        update();
        el.addEventListener("scroll", update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        ro.observe(track);
        Array.from(el.children).forEach((child) => ro.observe(child));
        // Content swapped (e.g. a different movie's description): watch the new
        // children too, and resize the thumb for the new content height.
        const mo = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((n) => n instanceof Element && ro.observe(n));
                m.removedNodes.forEach((n) => n instanceof Element && ro.unobserve(n));
            }
            update();
        });
        mo.observe(el, { childList: true });
        return () => {
            el.removeEventListener("scroll", update);
            ro.disconnect();
            mo.disconnect();
        };
    }, [targetRef]);

    const scrollBy = (dy: number) => targetRef.current?.scrollBy({ top: dy, behavior: "smooth" });

    // Clicking the empty track jumps a page toward the click.
    const onTrackPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        const el = targetRef.current;
        const thumb = thumbRef.current;
        if (!el || !thumb || e.target !== e.currentTarget) return;
        const above = e.clientY < thumb.getBoundingClientRect().top;
        scrollBy(above ? -el.clientHeight : el.clientHeight);
    };

    const onThumbPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        const el = targetRef.current;
        if (!el) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startY: e.clientY, startScroll: el.scrollTop };
    };

    const onThumbPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        const el = targetRef.current;
        const track = trackRef.current;
        if (!drag.current || !el || !track) return;
        const trackRange = track.clientHeight - e.currentTarget.offsetHeight;
        const scrollRange = el.scrollHeight - el.clientHeight;
        if (trackRange <= 0) return;
        el.scrollTop =
            drag.current.startScroll + ((e.clientY - drag.current.startY) * scrollRange) / trackRange;
    };

    const endDrag = () => {
        drag.current = null;
    };

    return (
        <div ref={rootRef} className="scrollbar" aria-hidden="true">
            <button
                type="button"
                className="scrollbar__arrow"
                tabIndex={-1}
                onClick={() => scrollBy(-STEP)}
            >
                <ArrowUpIcon />
            </button>
            <div ref={trackRef} className="scrollbar__track" onPointerDown={onTrackPointerDown}>
                <div
                    ref={thumbRef}
                    className="scrollbar__thumb"
                    onPointerDown={onThumbPointerDown}
                    onPointerMove={onThumbPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                >
                    <span className="scrollbar__grip" />
                </div>
            </div>
            <button
                type="button"
                className="scrollbar__arrow"
                tabIndex={-1}
                onClick={() => scrollBy(STEP)}
            >
                <ArrowDownIcon />
            </button>
        </div>
    );
}
