// Hardcoded placeholder content until real data is wired up.

export type FeaturedMovie = {
    id: string;
    title: string;
    /** One string per paragraph */
    description: string[];
    /** Path to the movie image, served from the `public/` folder */
    image: string;
};

export const FEATURED_MOVIE: FeaturedMovie = {
    id: "1",
    title: "Despicable Me, 2010",
    description: [
        "Supervillain Gru plans the heist of the century: stealing the Moon. To get the shrink ray he needs, he adopts three orphaned sisters, as part of his scheme.",
    ],
    image: "/posters/despicable-me.jpg", // file: public/posters/despicable-me.jpg
};
