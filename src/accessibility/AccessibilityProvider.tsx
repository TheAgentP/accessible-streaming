import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    AccessibilityContext,
    BRIGHTNESS,
    BUTTON_SIZE,
    CONTRAST,
    FONT_SIZE,
    SENSITIVITY,
    DEFAULT_SETTINGS,
    brightnessAmount,
    contrastAmount,
    type AccessibilityContextValue,
    type AccessibilitySettings,
} from "./settings";
import { useNarrator } from "./useNarrator";

const STORAGE_KEY = "accessibility-settings";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Keep a saved value inside its range (or fall back to the default if it's junk).
function clampSetting(value: unknown, range: { min: number; max: number }, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? clamp(n, range.min, range.max) : fallback;
}

// Restore the viewer's saved settings so they survive reloads.
function loadSettings(): AccessibilitySettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const saved = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AccessibilitySettings;
        saved.buttonSize = clampSetting(saved.buttonSize, BUTTON_SIZE, DEFAULT_SETTINGS.buttonSize);
        saved.fontSize = clampSetting(saved.fontSize, FONT_SIZE, DEFAULT_SETTINGS.fontSize);
        saved.contrast = clampSetting(saved.contrast, CONTRAST, DEFAULT_SETTINGS.contrast);
        saved.brightness = clampSetting(saved.brightness, BRIGHTNESS, DEFAULT_SETTINGS.brightness);
        saved.sensitivity = clampSetting(saved.sensitivity, SENSITIVITY, DEFAULT_SETTINGS.sensitivity);
        return saved;
    } catch {
        return DEFAULT_SETTINGS; // storage blocked or corrupted: use defaults
    }
}

/** Holds the accessibility settings for the whole app and applies them to the page. */
export default function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState(loadSettings);

    // Button size → CSS variable that scales every page button (see index.css).
    useEffect(() => {
        const scale = settings.buttonSize / DEFAULT_SETTINGS.buttonSize;
        document.documentElement.style.setProperty("--button-scale", String(scale));
    }, [settings.buttonSize]);

    // Font size → CSS variable that scales the page's reading text (see index.css).
    useEffect(() => {
        const scale = settings.fontSize / DEFAULT_SETTINGS.fontSize;
        document.documentElement.style.setProperty("--font-scale", String(scale));
    }, [settings.fontSize]);

    // Contrast + brightness → one CSS filter applied to the page and the
    // accessibility pop-up (see index.css). "none" when both are at normal.
    useEffect(() => {
        const parts: string[] = [];
        const contrast = contrastAmount(settings.contrast);
        const brightness = brightnessAmount(settings.brightness);
        if (contrast !== 1) parts.push(`contrast(${contrast.toFixed(3)})`);
        if (brightness !== 1) parts.push(`brightness(${brightness.toFixed(3)})`);
        document.documentElement.style.setProperty("--page-filter", parts.join(" ") || "none");
    }, [settings.contrast, settings.brightness]);

    // Narrator mode: speak what the viewer points at or focuses (see useNarrator).
    useNarrator(settings.narrator);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // storage unavailable (private mode etc.): settings just won't persist
        }
    }, [settings]);

    const value = useMemo<AccessibilityContextValue>(
        () => ({
            settings,
            update: (key, val) => setSettings((s) => ({ ...s, [key]: val })),
            reset: () => setSettings(DEFAULT_SETTINGS),
        }),
        [settings],
    );

    return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
