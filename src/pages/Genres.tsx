import { useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccessibilityModal from "../components/AccessibilityModal";
import Scrollbar from "../components/Scrollbar";
import { GENRES } from "../constants";
import "./Genres.css";

/** Length of a genre's longest word, used to fit its label to the tile (see Genres.css). */
const longestWord = (name: string) => Math.max(...name.split(/\s+/).map((w) => w.length));

export default function Genres() {
    const navigate = useNavigate();
    const gridRef = useRef<HTMLUListElement>(null);
    const [a11yOpen, setA11yOpen] = useState(false);

    // BACK always returns to the landing page.
    const handleBack = () => navigate("/");

    return (
        <div className="genres">
            <header className="genres__header">
                <button
                    type="button"
                    className="btn btn--light genres__back"
                    aria-label="Back to home"
                    onClick={handleBack}
                >
                    BACK
                </button>
                <h1 className="genres__title">GENRES</h1>
                <button
                    type="button"
                    className="btn btn--light genres__a11y"
                    aria-haspopup="dialog"
                    onClick={() => setA11yOpen(true)}
                >
                    ACCESSIBILITY
                </button>
            </header>

            <main className="genres__body">
                <ul
                    ref={gridRef}
                    className="genres__grid hide-native-scrollbar"
                    aria-label="Genres"
                >
                    {GENRES.map((genre) => (
                        <li key={genre.id}>
                            <Link
                                to={`/discover?genre=${genre.id}`} /* Discovery, filtered to this genre */
                                className="genres__tile"
                                style={{ "--chars": longestWord(genre.name) } as CSSProperties}
                            >
                                <span className="genres__tile-label">{genre.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Scrollbar targetRef={gridRef} />
            </main>

            <AccessibilityModal open={a11yOpen} onClose={() => setA11yOpen(false)} />
        </div>
    );
}
