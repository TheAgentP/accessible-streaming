import { useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon } from "./Icons";
import Scrollbar from "./Scrollbar";
import "./AccessibilityModal.css";

type Props = {
    open: boolean;
    onClose: () => void;
};

const DEFAULTS = {
    fontSize: 42,
    buttonSize: 42,
    contrast: 50,
    brightness: 50,
    narrator: false,
    sensitivity: 42,
};

// NOTE: settings are hardcoded / local-only for now. The values update on screen
// but are not yet applied to the rest of the app.
export default function AccessibilityModal({ open, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
    const [buttonSize, setButtonSize] = useState(DEFAULTS.buttonSize);
    const [contrast, setContrast] = useState(DEFAULTS.contrast);
    const [brightness, setBrightness] = useState(DEFAULTS.brightness);
    const [narrator, setNarrator] = useState(DEFAULTS.narrator);
    const [sensitivity, setSensitivity] = useState(DEFAULTS.sensitivity);

    const resetToDefault = () => {
        setFontSize(DEFAULTS.fontSize);
        setButtonSize(DEFAULTS.buttonSize);
        setContrast(DEFAULTS.contrast);
        setBrightness(DEFAULTS.brightness);
        setNarrator(DEFAULTS.narrator);
        setSensitivity(DEFAULTS.sensitivity);
    };

    // Native <dialog> + showModal() gives us focus trapping, Esc-to-close
    // and an inert background for free.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="a11y-modal"
            aria-labelledby="a11y-modal-title"
            onClose={onClose}
        >
            <div className="a11y-modal__header">
                <h2 id="a11y-modal-title" className="visually-hidden">
                    Accessibility settings
                </h2>
                <button type="button" className="a11y-modal__close" onClick={onClose}>
                    CLOSE
                </button>
            </div>

            <div className="a11y-modal__content">
                <div
                    ref={bodyRef}
                    className="a11y-modal__body hide-native-scrollbar"
                    role="region"
                    aria-label="Settings"
                    tabIndex={0}
                >
                    <div className="a11y-row">
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Decrease font size"
                            onClick={() => setFontSize((v) => v - 1)}
                        >
                            LESS <MinusIcon className="a11y-step__icon" />
                        </button>
                        <span className="a11y-row__label" aria-live="polite">
                            FONT SIZE: {fontSize}
                        </span>
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Increase font size"
                            onClick={() => setFontSize((v) => v + 1)}
                        >
                            MORE <PlusIcon className="a11y-step__icon" />
                        </button>
                    </div>

                    <div className="a11y-row">
                        <label htmlFor="a11y-contrast" className="a11y-row__label">
                            CONTRAST
                        </label>
                        <input
                            id="a11y-contrast"
                            type="range"
                            className="a11y-slider"
                            min={0}
                            max={100}
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                        />
                    </div>

                    <div className="a11y-row">
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Decrease button size"
                            onClick={() => setButtonSize((v) => v - 1)}
                        >
                            LESS <MinusIcon className="a11y-step__icon" />
                        </button>
                        <span className="a11y-row__label" aria-live="polite">
                            BUTTON SIZE: {buttonSize}
                        </span>
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Increase button size"
                            onClick={() => setButtonSize((v) => v + 1)}
                        >
                            MORE <PlusIcon className="a11y-step__icon" />
                        </button>
                    </div>

                    <div className="a11y-row">
                        <label htmlFor="a11y-brightness" className="a11y-row__label">
                            BRIGHTNESS
                        </label>
                        <input
                            id="a11y-brightness"
                            type="range"
                            className="a11y-slider"
                            min={0}
                            max={100}
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                        />
                    </div>

                    <div className="a11y-row">
                        <span id="a11y-narrator-label" className="a11y-row__label a11y-row__label--start">
                            NARRATOR MODE
                        </span>
                        {/* On/off switch: the knob slides along the track. Screen readers
                            hear "Narrator mode, switch, off/on". */}
                        <button
                            type="button"
                            role="switch"
                            className="a11y-switch"
                            aria-labelledby="a11y-narrator-label"
                            aria-checked={narrator}
                            onClick={() => setNarrator((v) => !v)}
                        >
                            <span className="a11y-switch__knob" aria-hidden="true">
                                {narrator ? "TURN OFF" : "TURN ON"}
                            </span>
                        </button>
                    </div>

                    <div className="a11y-row">
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Decrease sensitivity"
                            onClick={() => setSensitivity((v) => v - 1)}
                        >
                            LESS <MinusIcon className="a11y-step__icon" />
                        </button>
                        <span className="a11y-row__label" aria-live="polite">
                            SENSITIVITY: {sensitivity}
                        </span>
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Increase sensitivity"
                            onClick={() => setSensitivity((v) => v + 1)}
                        >
                            MORE <PlusIcon className="a11y-step__icon" />
                        </button>
                    </div>

                    <div className="a11y-row">
                        <span id="a11y-reset-label" className="a11y-row__label a11y-row__label--start">
                            RESET TO DEFAULT
                        </span>
                        <button
                            type="button"
                            className="a11y-toggle a11y-reset"
                            aria-labelledby="a11y-reset-label"
                            onClick={resetToDefault}
                        >
                            RESET
                        </button>
                    </div>
                </div>
                <Scrollbar targetRef={bodyRef} />
            </div>
        </dialog>
    );
}
