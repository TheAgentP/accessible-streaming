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
    narrator: false,
    sensitivity: 42,
};

/**
 * Button size range. Page buttons are scaled by buttonSize / default,
 * so 42 = normal size, 34 ≈ 81%, 50 ≈ 119%. The range is limited so every
 * button still fits on a 16:9 screen.
 */
export const BUTTON_SIZE = { min: 34, max: 50, step: 2 } as const;

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
