import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BRIGHTNESS, BUTTON_SIZE, CONTRAST, FONT_SIZE, SENSITIVITY, useAccessibility } from "../accessibility/settings";
import { MinusIcon, PlusIcon } from "./Icons";
import Scrollbar from "./Scrollbar";
import "./AccessibilityModal.css";

type Props = {
    open: boolean;
    onClose: () => void;
};

// Settings live in AccessibilityProvider so they apply app-wide and persist.
// Currently applied: FONT SIZE (page text + these labels), CONTRAST, BUTTON SIZE,
// BRIGHTNESS and NARRATOR MODE. The rest are stored but not yet applied.
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

    const changeSensitivity = (delta: number) =>
        update("sensitivity", Math.min(SENSITIVITY.max, Math.max(SENSITIVITY.min, sensitivity + delta)));

    /*
     * LESS / MORE at the end of their range. Not the `disabled` attribute: a
     * disabled button drops keyboard focus, so a remote / keyboard user who
     * presses MORE up to the limit would be thrown out of the pop-up.
     * aria-disabled keeps focus where it is; screen readers and Narrator Mode
     * still say "unavailable", and pressing it just does nothing.
     */
    const limit = (atLimit: boolean, onPress: () => void) => ({
        "aria-disabled": atLimit,
        onClick: () => {
            if (!atLimit) onPress();
        },
    });

    // Native <dialog> + showModal() gives us focus trapping, Esc-to-close
    // and an inert background for free.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Rendered straight into <body> (a portal) so the pop-up is identical on
    // every page: inside the sidebar it was picking up the sidebar's Button
    // Size zoom, which made it bigger (and taller than the screen) on Landing.
    return createPortal(
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
                            {...limit(fontSize <= FONT_SIZE.min, () => changeFontSize(-FONT_SIZE.step))}
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
                            {...limit(fontSize >= FONT_SIZE.max, () => changeFontSize(FONT_SIZE.step))}
                        >
                            MORE <PlusIcon className="a11y-step__icon" />
                        </button>
                    </div>

                    <div className="a11y-row">
                        <span className="a11y-row__label">
                            <label htmlFor="a11y-contrast">CONTRAST</label>
                            {/* Current value. Hidden from screen readers, which already
                                hear it from the slider itself. */}
                            <span aria-hidden="true">
                                : <span className="a11y-row__value">{contrast}</span>
                            </span>
                        </span>
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
                            {...limit(buttonSize <= BUTTON_SIZE.min, () => changeButtonSize(-BUTTON_SIZE.step))}
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
                            {...limit(buttonSize >= BUTTON_SIZE.max, () => changeButtonSize(BUTTON_SIZE.step))}
                        >
                            MORE <PlusIcon className="a11y-step__icon" />
                        </button>
                    </div>

                    <div className="a11y-row">
                        <span className="a11y-row__label">
                            <label htmlFor="a11y-brightness">BRIGHTNESS</label>
                            {/* Current value. Hidden from screen readers, which already
                                hear it from the slider itself. */}
                            <span aria-hidden="true">
                                : <span className="a11y-row__value">{brightness}</span>
                            </span>
                        </span>
                        <input
                            id="a11y-brightness"
                            type="range"
                            className="a11y-slider"
                            min={BRIGHTNESS.min}
                            max={BRIGHTNESS.max}
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
                            {...limit(sensitivity <= SENSITIVITY.min, () => changeSensitivity(-SENSITIVITY.step))}
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
                            {...limit(sensitivity >= SENSITIVITY.max, () => changeSensitivity(SENSITIVITY.step))}
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
        </dialog>,
        document.body,
    );
}
