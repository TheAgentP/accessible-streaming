// Hardcoded placeholder content until real data is wired up.

/** Genres used to tag movies (and, later, to build the Genres page). */
export const GENRES = [
    { id: "animation", name: "Animation" },
    { id: "adventure", name: "Adventure" },
    { id: "biography", name: "Biography" },
    { id: "comedy", name: "Comedy" },
    { id: "drama", name: "Drama" },
    { id: "family", name: "Family" },
] as const;

export type Genre = (typeof GENRES)[number];
export type GenreId = Genre["id"];

export type Movie = {
    id: string;
    title: string;
    year: number;
    genres: GenreId[];
    /** One string per paragraph */
    description: string[];
    /** Path to the movie image, served from the `public/` folder */
    image: string;
};

/** Movies in the order the landing page's NEXT / BACK buttons step through them. */
export const MOVIES: Movie[] = [
    {
        id: "despicable-me",
        title: "Despicable Me",
        year: 2010,
        genres: ["animation", "comedy", "family"],
        description: [
            "Supervillain Gru, helped by his army of yellow Minions, plans the heist of the century: shrinking and stealing the Moon. But a younger rival, Vector, steals the shrink ray first.",
            "To break into Vector's fortress, Gru adopts three orphaned sisters, Margo, Edith and Agnes, as part of his scheme. He never planned on the girls changing him, and soon he has to choose between being the world's greatest villain and being their dad.",
        ],
        image: "/posters/despicable-me.jpg",
    },
    {
        id: "bee-movie",
        title: "Bee Movie",
        year: 2007,
        genres: ["animation", "comedy", "family"],
        description: [
            "Fresh out of college, honeybee Barry B. Benson isn't ready to spend the rest of his life making honey. On his first trip outside the hive he breaks the bees' biggest rule and talks to a human, florist Vanessa.",
            "When Barry discovers that people have been taking and selling bees' honey for years, he takes the entire human race to court.",
        ],
        image: "/posters/bee-movie.jpg",
    },
    {
        id: "at-eternitys-gate",
        title: "At Eternity's Gate",
        year: 2018,
        genres: ["biography", "drama"],
        description: [
            "Willem Dafoe stars as Vincent van Gogh in the last years of his life, painting in Arles and Auvers-sur-Oise in the south of France.",
            "Director Julian Schnabel follows the painter's struggles with poverty, illness and loneliness, and his friendship with Paul Gauguin, while showing the world the way van Gogh saw it.",
        ],
        image: "/posters/at-eternitys-gate.png",
    },
    {
        id: "niu-lai",
        title: "Niu Lai",
        year: 2026,
        genres: ["animation", "adventure", "family"],
        description: [
            "A weak newborn calf, always sheltered by his herd, must face the hardships of a long migration and grow into an adult.",
            "Made over more than five years by a tiny family team, the low-budget Chinese animated film was mocked for its crude 3D animation before becoming a surprise box-office hit.",
        ],
        image: "/posters/niu-lai.jpeg",
    },
];

/** "Despicable Me, 2010" — how a movie is shown and read aloud. */
export const movieHeading = (movie: Movie) => `${movie.title}, ${movie.year}`;

/** Look up a genre's display name from its id. */
export const genreName = (id: GenreId) => GENRES.find((g) => g.id === id)?.name ?? id;
