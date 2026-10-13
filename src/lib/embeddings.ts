/**
 * A hand-made two-dimensional "embedding space" for teaching. Real models
 * learn thousands of dimensions; these coordinates were chosen by hand so the
 * classic King - Man + Woman example works on a 2D chart.
 */

export interface WordVector {
  word: string;
  /** Dimension 1, 0-100: how strongly the word is associated with royalty. */
  royalty: number;
  /** Dimension 2, 0-100: masculine (0) to feminine (100) association. */
  gender: number;
  category: "Royalty" | "People" | "Tech";
}

export const WORD_LIBRARY: WordVector[] = [
  { word: "King", royalty: 85, gender: 15, category: "Royalty" },
  { word: "Queen", royalty: 85, gender: 85, category: "Royalty" },
  { word: "Prince", royalty: 65, gender: 20, category: "Royalty" },
  { word: "Princess", royalty: 65, gender: 80, category: "Royalty" },
  { word: "Man", royalty: 10, gender: 15, category: "People" },
  { word: "Woman", royalty: 10, gender: 85, category: "People" },
  { word: "Boy", royalty: 15, gender: 30, category: "People" },
  { word: "Girl", royalty: 15, gender: 70, category: "People" },
  { word: "Laptop", royalty: 2, gender: 38, category: "Tech" },
  { word: "Server", royalty: 4, gender: 62, category: "Tech" },
];

export type Vec2 = { royalty: number; gender: number };

export const add = (a: Vec2, b: Vec2): Vec2 => ({
  royalty: a.royalty + b.royalty,
  gender: a.gender + b.gender,
});

export const subtract = (a: Vec2, b: Vec2): Vec2 => ({
  royalty: a.royalty - b.royalty,
  gender: a.gender - b.gender,
});

export const distance = (a: Vec2, b: Vec2): number =>
  Math.hypot(a.royalty - b.royalty, a.gender - b.gender);

export function cosineSimilarity(a: Vec2, b: Vec2): number {
  const dot = a.royalty * b.royalty + a.gender * b.gender;
  const norm = Math.hypot(a.royalty, a.gender) * Math.hypot(b.royalty, b.gender);
  return norm === 0 ? 0 : dot / norm;
}

/** Nearest words to `point` by Euclidean distance, excluding `exclude`. */
export function nearestWords(point: Vec2, exclude: string[] = [], n = 3): WordVector[] {
  return WORD_LIBRARY.filter((w) => !exclude.includes(w.word))
    .map((w) => ({ w, d: distance(point, w) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(({ w }) => w);
}

export function getWord(word: string): WordVector {
  const found = WORD_LIBRARY.find((w) => w.word === word);
  if (!found) throw new Error(`Unknown word: ${word}`);
  return found;
}
