import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AccessibilityModal from "../components/AccessibilityModal";
import { ArrowDownIcon, ArrowUpIcon, SpeakerIcon, StopIcon } from "../components/Icons";
import { useSpeech } from "../accessibility/useSpeech";
import { useAccessibility } from "../accessibility/settings";
import {
    GENRES,
    MOVIES,
    TAGS,
    genreName,
    movieHeading,
    tagName,
    type GenreId,
    type Movie,
    type TagId,
} from "../constants";
import "./Discovery.css";

/*
 * What's being shown comes from the address, so it always matches the
 * "Showing: X" heading and can be linked to:
 *   /discover?tag=trending   → a FOR YOU / TRENDING / NEW filter
 *   /discover?genre=action   → a genre (from a tile on the Genres page)
 *   /discover                → FOR YOU
 */
type Filter = { kind: "tag"; id: TagId } | { kind: "genre"; id: GenreId };

const DEFAULT_FILTER: Filter = { kind: "tag", id: "for-you" };

function readFilter(params: URLSearchParams): Filter {
    const genre = GENRES.find((g) => g.id === params.get("genre"));
    if (genre) return { kind: "genre", id: genre.id };
    const tag = TAGS.find((t) => t.id === params.get("tag"));
    if (tag) return { kind: "tag", id: tag.id };
    return DEFAULT_FILTER;
}

const filterName = (f: Filter) => (f.kind === "tag" ? tagName(f.id) : genreName(f.id));

const moviesFor = (f: Filter): Movie[] =>
    MOVIES.filter((m) => (f.kind === "tag" ? m.tags.includes(f.id) : m.genres.includes(f.id)));

/**
 * True when the row's buttons don't all fit on one line at their natural
 * width (e.g. at a large Button Size). The row then switches to an even
 * 3 + 2 layout (see Discovery.css) instead of leaving one button alone on
 * the second line. Re-checked when the row resizes, Button Size changes or
 * the web font finishes loading.
 */
function useNeedsTwoRows(rowRef: RefObject<HTMLElement | null>, buttonSize: number) {
    const [twoRows, setTwoRows] = useState(false);

    useLayoutEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        const measure = () => {
            // Lay the buttons out on one line at their natural width, measure,
            // and put the layout back, all before the browser paints.
            row.classList.add("discovery__filters--measure");
            const overflows = row.scrollWidth > row.clientWidth + 1;
            row.classList.remove("discovery__filters--measure");
            setTwoRows(overflows);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(row);
        let cancelled = false;
        document.fonts?.ready.then(() => !cancelled && measure());
        return () => {
            cancelled = true;
            ro.disconnect();
        };
    }, [rowRef, buttonSize]);

    return twoRows;
}

export default function Discovery() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const filter = readFilter(params);
    const filterKey = `${filter.kind}:${filter.id}`;
    const movies = moviesFor(filter);
    const [a11yOpen, setA11yOpen] = useState(false);
    const filtersRef = useRef<HTMLElement>(null);
    const twoRows = useNeedsTwoRows(filtersRef, useAccessibility().settings.buttonSize);

    // BACK: from a genre, return to the Genres page to pick another;
    // otherwise go to the landing page.
    const handleBack = () => navigate(filter.kind === "genre" ? "/genres" : "/");

    return (
        <div className="discovery">
            <header className="discovery__header">
                <nav
                    ref={filtersRef}
                    className={`discovery__filters${twoRows ? " discovery__filters--two-rows" : ""}`}
                    aria-label="Discovery filters"
                >
                    <button
                        type="button"
                        className="btn btn--light"
                        aria-label={filter.kind === "genre" ? "Back to genres" : "Back to home"}
                        onClick={handleBack}
                    >
                        BACK
                    </button>
                    {TAGS.map((tag) => {
                        const active = filter.kind === "tag" && filter.id === tag.id;
                        return (
                            <Link
                                key={tag.id}
                                to={`/discover?tag=${tag.id}`}
                                className="btn btn--light discovery__filter"
                                aria-current={active ? "page" : undefined}
                            >
                                {tag.name.toUpperCase()}
                            </Link>
                        );
                    })}
                    <Link to="/genres" className="btn btn--light discovery__filter">
                        GENRES
                    </Link>
                </nav>

                <div className="discovery__status">
                    {/* aria-live: switching filters announces "Showing: Trending" */}
                    <h1 className="discovery__showing" aria-live="polite">
                        Showing: {filterName(filter)}
                    </h1>
                    <button
                        type="button"
                        className="btn btn--light discovery__a11y"
                        aria-haspopup="dialog"
                        onClick={() => setA11yOpen(true)}
                    >
                        ACCESSIBILITY
                    </button>
                </div>
            </header>

            {/* Keyed by filter: a new filter starts at its first movie, and any
                reading-aloud of the previous list stops. */}
            <MovieBrowser key={filterKey} movies={movies} />

            <AccessibilityModal open={a11yOpen} onClose={() => setA11yOpen(false)} />
        </div>
    );
}

/** One movie at a time from `movies`, with up/down arrows to step through them. */
function MovieBrowser({ movies }: { movies: Movie[] }) {
    const descRef = useRef<HTMLDivElement>(null);
    const tts = useSpeech();
    const [index, setIndex] = useState(0);
    const movie = movies[index];

    // Step through the list, wrapping around at either end (like the landing page).
    const step = (delta: number) => {
        tts.stop();
        setIndex((i) => (i + delta + movies.length) % movies.length);
    };

    // New movie: start its description from the top.
    useEffect(() => {
        descRef.current?.scrollTo({ top: 0 });
    }, [index]);

    if (!movie) {
        return (
            <main className="discovery__body discovery__body--empty">
                <p>No movies here yet.</p>
            </main>
        );
    }

    const heading = movieHeading(movie);
    const single = movies.length < 2;

    const handleTextToSpeech = () => {
        if (tts.speaking) tts.stop();
        else tts.speak([heading, ...movie.description]);
    };
    const handleWatch = () => console.log("Watch:", movie.id);

    return (
        <main className="discovery__body">
            <div className="discovery__media">
                <img className="discovery__image" src={movie.image} alt={`${heading} movie image`} />
                <div className="discovery__actions">
                    <button type="button" className="btn btn--light discovery__watch" onClick={handleWatch}>
                        WATCH
                    </button>
                    <button
                        type="button"
                        className="btn btn--light discovery__tts"
                        aria-label={tts.speaking ? "Stop reading" : "Read movie title, year, and description"}
                        title={tts.supported ? undefined : "Text-to-speech isn't supported in this browser"}
                        disabled={!tts.supported}
                        onClick={handleTextToSpeech}
                    >
                        {tts.speaking ? (
                            <StopIcon className="discovery__tts-icon" />
                        ) : (
                            <SpeakerIcon className="discovery__tts-icon" />
                        )}
                    </button>
                </div>
            </div>

            <section className="discovery__info" aria-labelledby="discovery-title">
                {/* aria-live: the new title is announced after the up/down arrows */}
                <h2 id="discovery-title" className="discovery__title" aria-live="polite">
                    {heading}
                </h2>
                <div
                    ref={descRef}
                    className="discovery__desc thin-scrollbar"
                    tabIndex={0}
                    role="region"
                    aria-label="Description"
                >
                    {movie.description.map((p, i) => (
                        <p key={`${movie.id}-${i}`}>{p}</p>
                    ))}
                </div>
            </section>

            <div className="discovery__arrows">
                <button
                    type="button"
                    className="discovery__arrow"
                    aria-label="Previous movie"
                    disabled={single}
                    onClick={() => step(-1)}
                >
                    <ArrowUpIcon className="discovery__arrow-icon" />
                </button>
                <button
                    type="button"
                    className="discovery__arrow"
                    aria-label="Next movie"
                    disabled={single}
                    onClick={() => step(1)}
                >
                    <ArrowDownIcon className="discovery__arrow-icon" />
                </button>
            </div>
        </main>
    );
}
