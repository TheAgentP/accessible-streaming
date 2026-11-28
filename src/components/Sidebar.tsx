import { useState } from "react";
import { Link } from "react-router-dom";
import { CameraIcon, HouseIcon, MaskIcon } from "./Icons";
import AccessibilityModal from "./AccessibilityModal";
import "./Sidebar.css";

type Props = {
    /** Show a HOME button (pages other than the landing page, which is home). */
    showHome?: boolean;
};

export default function Sidebar({ showHome = false }: Props) {
    const [a11yOpen, setA11yOpen] = useState(false);

    return (
        <nav className="sidebar" aria-label="Main">
            <Link to="/" className="sidebar__btn sidebar__home" aria-label="Home">
                <CameraIcon className="sidebar__home-icon" />
            </Link>

            {showHome && (
                <Link to="/" className="sidebar__btn sidebar__btn--home">
                    <HouseIcon className="sidebar__house-icon" />
                    HOME
                </Link>
            )}

            <Link to="/genres" className="sidebar__btn sidebar__btn--genre">
                <MaskIcon className="sidebar__mask-icon" />
                GENRE
            </Link>

            <button
                type="button"
                className="sidebar__btn sidebar__btn--accessibility"
                aria-haspopup="dialog"
                onClick={() => setA11yOpen(true)}
            >
                ACCESSIBILITY
            </button>

            <Link to="/discover" className="sidebar__btn sidebar__btn--discovery">
                DISCOVERY
            </Link>

            <AccessibilityModal open={a11yOpen} onClose={() => setA11yOpen(false)} />
        </nav>
    );
}
