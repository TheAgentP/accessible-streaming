import { createContext, useContext } from "react";

export type AccessibilitySettings = {
    fontSize: number;
    buttonSize: number;
    contrast: number;
    brightness: number;
    narrator: boolean;
    sensitivity: number;
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
    fontSize: 42,
    buttonSize: 42,
    contrast: 50,
    brightness: 50,
    narrator: false, // off by default: screen-reader users would otherwise hear everything twice
    sensitivity: 42,
};

/**
 * Button size range. Page buttons are scaled by buttonSize / default,
 * so 42 = normal size, 34 ≈ 81%, 50 ≈ 119%. The range is limited so every
 * button still fits on a 16:9 screen.
 */
export const BUTTON_SIZE = { min: 34, max: 50, step: 2 } as const;

/**
 * Font size range. Reading text (headings, search box, movie title and
 * description) is scaled by fontSize / default, so 42 = normal size,
 * 34 ≈ 81%, 58 ≈ 138%. Button labels follow BUTTON SIZE instead.
 */
export const FONT_SIZE = { min: 34, max: 58, step: 2 } as const;

/** Contrast slider range. 50 = the design's normal contrast. */
export const CONTRAST = { min: 0, max: 100 } as const;

/**
 * Slider position → CSS contrast() amount. Below the middle it softens down
 * to 60% (never so low the app becomes unreadable); above it, it strengthens
 * up to 180%, which pushes the dark blues to near-black and the light blues
 * to near-white.
 */
export function contrastAmount(contrast: number): number {
    const mid = (CONTRAST.min + CONTRAST.max) / 2;
    return contrast <= mid
        ? 1 - ((mid - contrast) / (mid - CONTRAST.min)) * 0.4
        : 1 + ((contrast - mid) / (CONTRAST.max - mid)) * 0.8;
}

/** Brightness slider range. 50 = the design's normal brightness. */
export const BRIGHTNESS = { min: 0, max: 100 } as const;

/**
 * Slider position → CSS brightness() amount: 60% at the far left (dimmer,
 * e.g. for a dark room or light sensitivity) up to 140% at the far right.
 */
export function brightnessAmount(brightness: number): number {
    const mid = (BRIGHTNESS.min + BRIGHTNESS.max) / 2;
    return 1 + ((brightness - mid) / (BRIGHTNESS.max - mid)) * 0.4;
}

export type AccessibilityContextValue = {
    settings: AccessibilitySettings;
    update: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
    reset: () => void;
};

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
    const ctx = useContext(AccessibilityContext);
    if (!ctx) throw new Error("useAccessibility must be used inside <AccessibilityProvider>");
    return ctx;
}
