import { useCallback, useEffect, useRef, useState } from "react";

const synth: SpeechSynthesis | undefined =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;

/**
 * Text-to-speech with the browser's built-in voices (Web Speech API).
 * `speak` reads the given chunks in order, replacing anything already being
 * read; `stop` cancels. `speaking` is true until the last chunk finishes.
 */
export function useSpeech() {
    const [speaking, setSpeaking] = useState(false);
    // Bumped on every speak/stop, so callbacks from a cancelled reading are ignored.
    const runRef = useRef(0);
    // Holding the utterances stops Chrome from garbage-collecting them mid-read
    // (which silently drops their `end` event).
    const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

    const stop = useCallback(() => {
        runRef.current++;
        queueRef.current = [];
        synth?.cancel();
        setSpeaking(false);
    }, []);

    const speak = useCallback((chunks: string[]) => {
        if (!synth) return;
        synth.cancel();
        const run = ++runRef.current;

        // One utterance per chunk: Chrome cuts off single utterances after ~15 seconds.
        const texts = chunks.map((t) => t.trim()).filter(Boolean);
        if (texts.length === 0) return setSpeaking(false);

        const utterances = texts.map((text, i) => {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = document.documentElement.lang || "en-US";
            const done = () => {
                if (runRef.current === run && i === texts.length - 1) {
                    queueRef.current = [];
                    setSpeaking(false);
                }
            };
            u.onend = done;
            u.onerror = () => {
                if (runRef.current === run) {
                    queueRef.current = [];
                    setSpeaking(false);
                }
            };
            return u;
        });

        queueRef.current = utterances;
        setSpeaking(true);
        utterances.forEach((u) => synth.speak(u));
    }, []);

    // Stop reading when the component using it goes away (e.g. navigating off the page).
    useEffect(() => () => {
        runRef.current++;
        synth?.cancel();
    }, []);

    return { supported: !!synth, speaking, speak, stop };
}
