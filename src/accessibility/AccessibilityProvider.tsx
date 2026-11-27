import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    AccessibilityContext,
    BUTTON_SIZE,
    FONT_SIZE,
    DEFAULT_SETTINGS,
    type AccessibilityContextValue,
    type AccessibilitySettings,
} from "./settings";

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
