import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import MovieView from "./pages/MovieView";
import WatchView from "./pages/WatchView";
import Genres from "./pages/Genres";
import Discovery from "./pages/Discovery";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/movie/:id" element={<MovieView />} />
                <Route path="/watch/:id" element={<WatchView />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/discover" element={<Discovery />} />
            </Routes>
        </BrowserRouter>
    );
}