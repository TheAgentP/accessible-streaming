// Hardcoded placeholder content until real data is wired up.

/** Genres used to tag movies (and, later, to build the Genres page). */
export const GENRES = [
    { id: "action", name: "Action" },
    { id: "adventure", name: "Adventure" },
    { id: "animation", name: "Animation" },
    { id: "biography", name: "Biography" },
    { id: "comedy", name: "Comedy" },
    { id: "drama", name: "Drama" },
    { id: "family", name: "Family" },
    { id: "horror", name: "Horror" },
    { id: "mystery", name: "Mystery" },
    { id: "romance", name: "Romance" },
    // Spelled out (not "Sci-Fi") so text-to-speech reads it naturally
    { id: "science-fiction", name: "Science Fiction" },
    { id: "thriller", name: "Thriller" },
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
    {
        id: "her",
        title: "Her",
        year: 2013,
        genres: ["drama", "romance", "science-fiction"],
        description: [
            "In near-future Los Angeles, lonely letter writer Theodore Twombly, still getting over his divorce, buys a new operating system with an artificial intelligence that names itself Samantha.",
            "As Samantha learns and grows, the two fall in love, and Theodore has to work out what a relationship can be when one partner has no body. Directed by Spike Jonze, starring Joaquin Phoenix and the voice of Scarlett Johansson.",
        ],
        image: "/posters/her.jpg",
    },
    {
        id: "the-matrix",
        title: "The Matrix",
        year: 1999,
        genres: ["action", "science-fiction"],
        description: [
            "By day, Thomas Anderson writes software; by night, he is the hacker Neo. When the mysterious Morpheus finds him, Neo learns the truth: the world he knows is a computer simulation, built by machines to keep humanity asleep.",
            "Freed from the Matrix, Neo joins Morpheus and Trinity in the fight against the machines, and starts to suspect he may be \"the One\" who can end the war.",
        ],
        image: "/posters/matrix.jpg",
    },
    {
        id: "the-matrix-reloaded",
        title: "The Matrix Reloaded",
        year: 2003,
        genres: ["action", "science-fiction"],
        description: [
            "Six months after the first film, the machines are drilling towards Zion, the last human city. Neo, Morpheus and Trinity have only days to stop them.",
            "Neo's search for a way to end the war leads him deep into the Matrix, where an upgraded Agent Smith is copying himself, and towards the Architect, the program that designed it all.",
        ],
        image: "/posters/matrix-reloaded.avif",
    },
    {
        id: "saw",
        title: "Saw",
        year: 2004,
        genres: ["horror", "mystery", "thriller"],
        description: [
            "Two men wake up chained to pipes at opposite ends of a filthy bathroom, with a dead body lying between them. Neither knows how he got there.",
            "They are the latest victims of the Jigsaw Killer, who traps people in deadly \"games\" to test how much they value their lives. As the clock runs down, they must work out what connects them before it's too late.",
        ],
        image: "/posters/saw.jpg",
    },
    {
        id: "wall-e",
        title: "WALL-E",
        year: 2008,
        genres: ["animation", "adventure", "family", "science-fiction"],
        description: [
            "Hundreds of years after humans left a trash-covered Earth, one small robot is still at work cleaning it up: WALL-E, who collects treasures and dreams of holding someone's hand.",
            "When a sleek probe robot called EVE arrives looking for signs of life, WALL-E falls for her, and follows her across the galaxy on an adventure that could decide humanity's future.",
        ],
        image: "/posters/walle.jpg",
    },
    {
        id: "the-spongebob-movie-search-for-squarepants",
        title: "The SpongeBob Movie: Search for SquarePants",
        year: 2025,
        genres: ["animation", "adventure", "comedy", "family"],
        description: [
            "Desperate to prove he's a big guy, SpongeBob sets out to show Mr. Krabs how brave he is by following the Flying Dutchman, a mysterious ghost pirate.",
            "The chase leads to a swashbuckling comedy adventure in the deepest depths of the sea.",
        ],
        image: "/posters/the-spongebob-movie-search-for-squarepants.jpg",
    },
];

/** "Despicable Me, 2010" — how a movie is shown and read aloud. */
export const movieHeading = (movie: Movie) => `${movie.title}, ${movie.year}`;

/** Look up a genre's display name from its id. */
export const genreName = (id: GenreId) => GENRES.find((g) => g.id === id)?.name ?? id;
