import { useEffect, useRef } from "react";
import { BUTTON_SIZE, CONTRAST, FONT_SIZE, useAccessibility } from "../accessibility/settings";
import { MinusIcon, PlusIcon } from "./Icons";
import Scrollbar from "./Scrollbar";
import "./AccessibilityModal.css";

type Props = {
    open: boolean;
    onClose: () => void;
};

// Settings live in AccessibilityProvider so they apply app-wide and persist.
// Currently applied: FONT SIZE (page text + these labels), CONTRAST, BUTTON SIZE and NARRATOR MODE. The rest are stored but not yet applied.
export default function AccessibilityModal({ open, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const { settings, update, reset } = useAccessibility();
    const { fontSize, buttonSize, contrast, brightness, narrator, sensitivity } = settings;

    const changeFontSize = (delta: number) =>
        update("fontSize", Math.min(FONT_SIZE.max, Math.max(FONT_SIZE.min, fontSize + delta)));

    const changeButtonSize = (delta: number) =>
        update(
            "buttonSize",
            Math.min(BUTTON_SIZE.max, Math.max(BUTTON_SIZE.min, buttonSize + delta)),
        );

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
                            disabled={fontSize <= FONT_SIZE.min}
                            onClick={() => changeFontSize(-FONT_SIZE.step)}
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
                            disabled={fontSize >= FONT_SIZE.max}
                            onClick={() => changeFontSize(FONT_SIZE.step)}
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
                            min={CONTRAST.min}
                            max={CONTRAST.max}
                            value={contrast}
                            onChange={(e) => update("contrast", Number(e.target.value))}
                        />
                    </div>

                    <div className="a11y-row">
                        <button
                            type="button"
                            className="a11y-step"
                            aria-label="Decrease button size"
                            disabled={buttonSize <= BUTTON_SIZE.min}
                            onClick={() => changeButtonSize(-BUTTON_SIZE.step)}
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
                            disabled={buttonSize >= BUTTON_SIZE.max}
                            onClick={() => changeButtonSize(BUTTON_SIZE.step)}
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
                            onChange={(e) => update("brightness", Number(e.target.value))}
                        />
                    </div>

                    <div className="a11y-row">
                        <span className="a11y-row__label a11y-row__label--start">
                            <span id="a11y-narrator-label">NARRATOR MODE</span>
                            {/* Always shows the current state. Hidden from screen readers,
                                which already hear it from the switch's on/off state. */}
                            <span aria-hidden="true">: {narrator ? "ON" : "OFF"}</span>
                        </span>
                        {/* On/off switch: the knob slides along the track and says what
                            pressing it will do. Screen readers hear "Narrator mode,
                            switch, off/on". */}
                        <button
                            type="button"
                            role="switch"
                            className="a11y-switch"
                            aria-labelledby="a11y-narrator-label"
                            aria-checked={narrator}
                            onClick={() => update("narrator", !narrator)}
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
                            onClick={() => update("sensitivity", sensitivity - 1)}
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
                            onClick={() => update("sensitivity", sensitivity + 1)}
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
                            onClick={reset}
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
