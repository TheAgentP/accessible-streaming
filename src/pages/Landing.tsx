import { useRef, useState, type FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Scrollbar from "../components/Scrollbar";
import { MicIcon, SpeakerIcon, StopIcon } from "../components/Icons";
import { useSpeech } from "../accessibility/useSpeech";
import { FEATURED_MOVIE as FEATURED } from "../constants";
import "./Landing.css";

export default function Landing() {
    const [query, setQuery] = useState("");
    const descRef = useRef<HTMLDivElement>(null);
    const tts = useSpeech();

    // Reads the movie title, then each paragraph of the description.
    // Pressing the button again while it's reading stops it.
    const handleTextToSpeech = () => {
        if (tts.speaking) tts.stop();
        else tts.speak([FEATURED.title, ...FEATURED.description]);
    };

    // --- Hardcoded handlers (placeholders) ---
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        console.log("Search:", query);
    };
    const handleVoiceSearch = () => console.log("Voice search");
    const handleBack = () => console.log("Back");
    const handleWatch = () => console.log("Watch:", FEATURED.id);
    const handleNext = () => console.log("Next");

    return (
        <div className="layout">
            <Sidebar />

            <main className="landing">
                <form className="search" role="search" onSubmit={handleSearch}>
                    <h1 className="search__title">
                        <label htmlFor="search-input">Search Movies</label>
                    </h1>
                    <div className="search__field">
                        <input
                            id="search-input"
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="button"
                            className="search__mic"
                            aria-label="Search by voice"
                            onClick={handleVoiceSearch}
                        >
                            <MicIcon className="search__mic-icon" />
                        </button>
                    </div>
                    <button type="submit" className="btn btn--outline search__submit">
                        SEARCH
                    </button>
                </form>

                <section className="featured" aria-labelledby="featured-title">
                    <div className="featured__poster">
                        <img
                            className="featured__poster-img"
                            src={FEATURED.image}
                            alt={`${FEATURED.title} movie image`}
                        />
                        <button type="button" className="btn btn--light featured__back" onClick={handleBack}>
                            BACK
                        </button>
                    </div>

                    <div className="featured__info">
                        <div className="featured__heading">
                            <h2 id="featured-title" className="featured__title">
                                {FEATURED.title}
                            </h2>
                            <button
                                type="button"
                                className="btn btn--light featured__tts"
                                aria-label="Read description aloud"
                                aria-pressed={tts.speaking}
                                title={tts.supported ? undefined : "Text-to-speech isn't supported in this browser"}
                                disabled={!tts.supported}
                                onClick={handleTextToSpeech}
                            >
                                {tts.speaking ? (
                                    <StopIcon className="featured__tts-icon" />
                                ) : (
                                    <SpeakerIcon className="featured__tts-icon" />
                                )}
                            </button>
                        </div>

                        <div className="featured__desc-wrap">
                            <div
                                ref={descRef}
                                className="featured__desc hide-native-scrollbar"
                                tabIndex={0}
                                role="region"
                                aria-label="Description"
                            >
                                {FEATURED.description.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                            <Scrollbar targetRef={descRef} />
                        </div>

                        <div className="featured__actions">
                            <button type="button" className="btn btn--light" onClick={handleWatch}>
                                WATCH
                            </button>
                            <button type="button" className="btn btn--light" onClick={handleNext}>
                                NEXT
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
