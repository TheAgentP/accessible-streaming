import { useParams } from "react-router-dom";
import { GENRES } from "../constants";

// Placeholder: one genre's movies (opened from a tile on the Genres page).
export default function Genre() {
    const { genreId } = useParams();
    const genre = GENRES.find((g) => g.id === genreId);
    return <h1>{genre ? genre.name : "Genre not found"}</h1>;
}
