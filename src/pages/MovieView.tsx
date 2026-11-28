import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MicIcon, SpeakerIcon, StopIcon } from "../components/Icons";
import { useSpeech } from "../accessibility/useSpeech";
import { movieHeading, type Movie } from "../constants";
import { searchMovies } from "../search";
import "./MovieView.css";

/*
 * MovieView - search results ("HomePage Movie View" mockup), at /search?q=matrix
 * Movies whose title fuzzily matches the query, best match first, shown one
 * at a time with PREVIOUS / WATCH / NEXT.
 */
export default function MovieView() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const query = params.get("q") ?? "";
    const results = searchMovies(query);

    // Announced to screen readers / Narrator Mode on every search. One
    // permanent live region whose text changes: a freshly inserted one is
    // often not announced.
    const summary = !query.trim()
        ? "Type a movie name and press SEARCH."
        : results.length === 0
          ? `No movies match "${query}".`
          : `${results.length} ${results.length === 1 ? "movie matches" : "movies match"} "${query}", best match first.`;

    return (
        <div className="layout">
            <Sidebar showHome />

            <main className="movie-view">
                {/* Not keyed: it stays mounted across searches so keyboard focus
                    (e.g. on SEARCH) isn't lost; it updates its own text instead. */}
                <SearchBar query={query} onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />

                <p className="visually-hidden" role="status" aria-live="polite">
                    {summary}
                </p>

                {/* Keyed by query: a new search starts at its best match with
                    PREVIOUS hidden again, and stops any reading-aloud. */}
                <ResultBrowser key={query} summary={summary} results={results} />
            </main>
        </div>
    );
}

function SearchBar({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
    const [text, setText] = useState(query);
    // When the search in the address changes (a new search, or Back / Forward),
    // show its text. Adjusting state during render, as React recommends for
    // syncing with a prop, rather than in an effect.
    const [shownQuery, setShownQuery] = useState(query);
    if (query !== shownQuery) {
        setShownQuery(query);
        setText(query);
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSearch(text.trim());
    };

    return (
        <form className="movie-view-search" role="search" onSubmit={handleSubmit}>
            <label htmlFor="movie-view-search-input" className="visually-hidden">
                Movie name
            </label>
            <div className="movie-view-search__field">
                <input
                    id="movie-view-search-input"
                    type="search"
                    placeholder="Movie Name"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    type="button"
                    className="movie-view-search__mic"
                    aria-label="Search by voice"
                    onClick={() => console.log("Voice search")}
                >
                    <MicIcon className="movie-view-search__mic-icon" />
                </button>
            </div>
            <button type="submit" className="btn btn--outline movie-view-search__submit">
                SEARCH
            </button>
        </form>
    );
}

function ResultBrowser({ summary, results }: { summary: string; results: Movie[] }) {
    const descRef = useRef<HTMLDivElement>(null);
    const tts = useSpeech();
    const [index, setIndex] = useState(0);
    // PREVIOUS stays hidden until NEXT has been pressed once.
    const [hasGoneNext, setHasGoneNext] = useState(false);
    const movie = results[index];

    // Step through the results, wrapping around at either end.
    const step = (delta: number) => {
        tts.stop();
        setIndex((i) => (i + delta + results.length) % results.length);
    };
    const handleNext = () => {
        setHasGoneNext(true);
        step(1);
    };

    useEffect(() => {
        descRef.current?.scrollTo({ top: 0 });
    }, [index]);

    if (!movie) {
        return (
            <section className="movie-view__card movie-view__card--empty" aria-label="Search results">
                {/* Visible message; the live region above announces it */}
                <p>{summary}</p>
            </section>
        );
    }

    const heading = movieHeading(movie);
    const several = results.length > 1;

    const handleTextToSpeech = () => {
        if (tts.speaking) tts.stop();
        else tts.speak([heading, ...movie.description]);
    };

    return (
        <section className="movie-view__card" aria-label="Search results">
            <img className="movie-view__image" src={movie.image} alt={`${heading} movie image`} />

            <div className="movie-view__side">
                {/* aria-live: the new title is announced after PREVIOUS / NEXT */}
                <h1 className="movie-view__title" aria-live="polite">
                    {heading}
                </h1>
                <button
                    type="button"
                    className="btn btn--light movie-view__tts"
                    aria-label={tts.speaking ? "Stop reading" : "Read movie title, year, and description"}
                    title={tts.supported ? undefined : "Text-to-speech isn't supported in this browser"}
                    disabled={!tts.supported}
                    onClick={handleTextToSpeech}
                >
                    {tts.speaking ? (
                        <StopIcon className="movie-view__tts-icon" />
                    ) : (
                        <SpeakerIcon className="movie-view__tts-icon" />
                    )}
                </button>
            </div>

            <div
                ref={descRef}
                className="movie-view__desc thin-scrollbar"
                tabIndex={0}
                role="region"
                aria-label="Description"
            >
                {movie.description.map((p, i) => (
                    <p key={`${movie.id}-${i}`}>{p}</p>
                ))}
            </div>

            <div className="movie-view__actions">
                {several && hasGoneNext && (
                    <button type="button" className="btn btn--light" aria-label="Previous result" onClick={() => step(-1)}>
                        PREVIOUS
                    </button>
                )}
                <button type="button" className="btn btn--light" onClick={() => console.log("Watch:", movie.id)}>
                    WATCH
                </button>
                {several && (
                    <button type="button" className="btn btn--light" aria-label="Next result" onClick={handleNext}>
                        NEXT
                    </button>
                )}
            </div>
        </section>
    );
}
