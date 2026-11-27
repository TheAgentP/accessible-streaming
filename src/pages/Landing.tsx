import { useEffect, useRef, useState, type FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Scrollbar from "../components/Scrollbar";
import { MicIcon, SpeakerIcon, StopIcon } from "../components/Icons";
import { useSpeech } from "../accessibility/useSpeech";
import { MOVIES, movieHeading } from "../constants";
import "./Landing.css";

export default function Landing() {
    const [query, setQuery] = useState("");
    const descRef = useRef<HTMLDivElement>(null);
    const tts = useSpeech();

    // Which movie the featured card shows. NEXT / BACK step through MOVIES,
    // wrapping around at either end.
    const [movieIndex, setMovieIndex] = useState(0);
    const movie = MOVIES[movieIndex];
    const heading = movieHeading(movie);

    const showMovie = (step: number) => {
        tts.stop(); // don't keep reading the previous movie's description
        setMovieIndex((i) => (i + step + MOVIES.length) % MOVIES.length);
    };
    // BACK stays hidden until the viewer has pressed NEXT at least once
    // (there's nothing to go back to on the first movie shown).
    const [hasGoneNext, setHasGoneNext] = useState(false);

    const handleBack = () => showMovie(-1);
    const handleNext = () => {
        setHasGoneNext(true);
        showMovie(1);
    };

    // New movie: start its description from the top.
    useEffect(() => {
        descRef.current?.scrollTo({ top: 0 });
    }, [movieIndex]);

    // Reads the movie title and year, then each paragraph of the description.
    // Pressing the button again while it's reading stops it.
    const handleTextToSpeech = () => {
        if (tts.speaking) tts.stop();
        else tts.speak([heading, ...movie.description]);
    };

    // --- Hardcoded handlers (placeholders) ---
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        console.log("Search:", query);
    };
    const handleVoiceSearch = () => console.log("Voice search");
    const handleWatch = () => console.log("Watch:", movie.id);

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
                            src={movie.image}
                            alt={`${heading} movie image`}
                        />
                        {hasGoneNext && (
                            <button
                                type="button"
                                className="btn btn--light featured__back"
                                aria-label="Back to previous movie"
                                onClick={handleBack}
                            >
                                BACK
                            </button>
                        )}
                    </div>

                    <div className="featured__info">
                        <div className="featured__heading">
                            {/* aria-live: the new title is announced after NEXT / BACK
                                (by screen readers and Narrator Mode) */}
                            <h2 id="featured-title" className="featured__title" aria-live="polite">
                                {heading}
                            </h2>
                            <button
                                type="button"
                                className="btn btn--light featured__tts"
                                /* Names the action, so narrator / screen readers say
                                   "Read movie title, year, and description, button" or
                                   "Stop reading, button" */
                                aria-label={tts.speaking ? "Stop reading" : "Read movie title, year, and description"}
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
                                {movie.description.map((p, i) => (
                                    <p key={`${movie.id}-${i}`}>{p}</p>
                                ))}
                            </div>
                            <Scrollbar targetRef={descRef} />
                        </div>

                        <div className="featured__actions">
                            <button type="button" className="btn btn--light" onClick={handleWatch}>
                                WATCH
                            </button>
                            <button
                                type="button"
                                className="btn btn--light"
                                aria-label="Next movie"
                                onClick={handleNext}
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
