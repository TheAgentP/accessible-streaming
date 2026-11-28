import { MOVIES, type Movie } from "./constants";

/*
 * Fuzzy movie search by title. Every title gets a score from 0 to 1 for the
 * query; titles scoring at least MIN_SCORE are returned, best match first.
 *
 *   1.00  exact title ("matrix" → The Matrix; a leading "The/A/An" is ignored)
 *   0.95  title starts with the query ("matrix" → Matrix Reloaded)
 *   0.90  a word in the title starts with the query ("reloaded" → Matrix Reloaded)
 *   0.85  the query appears anywhere, ignoring spaces and punctuation
 *         ("walle" → WALL-E, "spongebob" → SpongeBob Movie)
 *   ≤0.80 typo-tolerant word matching: each query word is compared with the
 *         closest title word, allowing a few wrong / missing / extra letters
 *         ("matrx" → The Matrix, "despicible" → Despicable Me)
 */

const MIN_SCORE = 0.5;

/** Lowercase, accents and apostrophes removed, other punctuation turned into spaces. */
function normalize(s: string): string {
    return s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/['’]/g, "") // "Eternity's" → "eternitys"
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

const withoutArticle = (s: string) => s.replace(/^(the|a|an) /, "");

/** Edit distance: letters to add, remove or change to turn `a` into `b`. */
function levenshtein(a: string, b: string): number {
    const row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return row[b.length];
}

/** How well one query word matches one title word (0–1). */
function wordSimilarity(q: string, t: string): number {
    if (t === q) return 1;
    if (t.startsWith(q)) return 0.9; // still typing: "matr" → matrix
    if (q.length <= 2) return 0; // too short to guess at typos
    // Typos in a whole word ("matrx" → matrix), or in the start of a longer one ("despicab" → despicable).
    const whole = 1 - levenshtein(q, t) / Math.max(q.length, t.length);
    const prefix = 1 - levenshtein(q, t.slice(0, q.length)) / q.length;
    return Math.max(whole, prefix * 0.9);
}

/** Score 0–1 for how well `title` matches `query` (both raw text). */
export function matchScore(query: string, title: string): number {
    const q = normalize(query);
    const t = normalize(title);
    if (!q) return 0;

    if (q === t || withoutArticle(q) === withoutArticle(t)) return 1;
    if (t.startsWith(q) || withoutArticle(t).startsWith(withoutArticle(q))) return 0.95;
    if (` ${t}`.includes(` ${q}`)) return 0.9;
    // Anywhere, ignoring spaces: only for 3+ letters, so "he" doesn't match "tHE matrix".
    const compactQ = q.replace(/ /g, "");
    if (compactQ.length >= 3 && t.replace(/ /g, "").includes(compactQ)) return 0.85;

    // Typo-tolerant: average of each query word's best match among the title's words.
    const titleWords = t.split(" ");
    const queryWords = q.split(" ").filter((w) => !["the", "a", "an"].includes(w));
    if (queryWords.length === 0) return 0;
    const avg =
        queryWords.reduce((sum, qw) => sum + Math.max(...titleWords.map((tw) => wordSimilarity(qw, tw))), 0) /
        queryWords.length;
    return 0.8 * avg;
}

/** Movies matching `query` by title, best match first (ties: shorter title, then data order). */
export function searchMovies(query: string): Movie[] {
    return MOVIES.map((movie, order) => ({ movie, order, score: matchScore(query, movie.title) }))
        .filter((r) => r.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score || a.movie.title.length - b.movie.title.length || a.order - b.order)
        .map((r) => r.movie);
}
