/**
 * A small but genuine byte-level Byte-Pair Encoding (BPE) tokenizer.
 *
 * It works the same way as the GPT-2 family of tokenizers: text is split into
 * "pre-tokens" (words with their leading space, numbers, punctuation), each
 * pre-token is turned into UTF-8 bytes (ids 0-255), and learned merge rules
 * are applied in the order they were learned. The difference from production
 * tokenizers is scale: the merges here are learned in the browser from a short
 * built-in paragraph, so the vocabulary has a few hundred entries rather than
 * ~100k, and the ids do not match any real model.
 */

export interface BpeModel {
  /** Merge rules in the order they were learned; merge i creates id 256 + i. */
  merges: Array<[number, number]>;
  /** Lookup "a,b" -> merge rank. */
  ranks: Map<string, number>;
  /** Byte sequence for every id in the vocabulary. */
  vocab: Uint8Array[];
}

export interface BpeToken {
  id: number;
  bytes: Uint8Array;
  /** Decoded text; partial UTF-8 sequences render as U+FFFD. */
  text: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: false });

/** GPT-2 style pre-tokenizer: keeps a single leading space attached to words. */
const PRETOKENIZE = / ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

export function pretokenize(text: string): string[] {
  return text.match(PRETOKENIZE) ?? [];
}

const pairKey = (a: number, b: number) => `${a},${b}`;

function mergePair(ids: number[], a: number, b: number, newId: number): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < ids.length) {
    if (i < ids.length - 1 && ids[i] === a && ids[i + 1] === b) {
      out.push(newId);
      i += 2;
    } else {
      out.push(ids[i]);
      i += 1;
    }
  }
  return out;
}

/**
 * Learns up to `numMerges` merge rules from `corpus`. Training stops early if
 * no pair occurs at least twice. Ties are broken deterministically.
 */
export function trainBpe(corpus: string, numMerges: number): BpeModel {
  const wordCounts = new Map<string, number>();
  for (const w of pretokenize(corpus)) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);

  const words: Array<{ ids: number[]; count: number }> = [...wordCounts].map(([w, count]) => ({
    ids: Array.from(encoder.encode(w)),
    count,
  }));

  const vocab: Uint8Array[] = Array.from({ length: 256 }, (_, i) => Uint8Array.of(i));
  const merges: Array<[number, number]> = [];
  const ranks = new Map<string, number>();

  for (let m = 0; m < numMerges; m++) {
    const pairCounts = new Map<string, number>();
    for (const { ids, count } of words) {
      for (let i = 0; i < ids.length - 1; i++) {
        const key = pairKey(ids[i], ids[i + 1]);
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + count);
      }
    }

    let bestKey: string | null = null;
    let bestCount = 1;
    for (const [key, count] of pairCounts) {
      if (count > bestCount || (count === bestCount && bestKey !== null && key < bestKey)) {
        bestKey = key;
        bestCount = count;
      }
    }
    if (bestKey === null) break;

    const [a, b] = bestKey.split(",").map(Number);
    const newId = 256 + merges.length;
    merges.push([a, b]);
    ranks.set(bestKey, merges.length - 1);
    const merged = new Uint8Array(vocab[a].length + vocab[b].length);
    merged.set(vocab[a]);
    merged.set(vocab[b], vocab[a].length);
    vocab.push(merged);

    for (const w of words) w.ids = mergePair(w.ids, a, b, newId);
  }

  return { merges, ranks, vocab };
}

/** Applies the learned merges to a single pre-token's bytes. */
function encodePiece(piece: string, model: BpeModel): number[] {
  let ids = Array.from(encoder.encode(piece));
  while (ids.length > 1) {
    let bestRank = Infinity;
    let bestPair: [number, number] | null = null;
    for (let i = 0; i < ids.length - 1; i++) {
      const rank = model.ranks.get(pairKey(ids[i], ids[i + 1]));
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestPair = [ids[i], ids[i + 1]];
      }
    }
    if (!bestPair) break;
    ids = mergePair(ids, bestPair[0], bestPair[1], 256 + bestRank);
  }
  return ids;
}

export function encode(text: string, model: BpeModel): BpeToken[] {
  const tokens: BpeToken[] = [];
  for (const piece of pretokenize(text)) {
    for (const id of encodePiece(piece, model)) {
      const bytes = model.vocab[id];
      tokens.push({ id, bytes, text: decoder.decode(bytes) });
    }
  }
  return tokens;
}

export function decode(ids: number[], model: BpeModel): string {
  const parts = ids.map((id) => model.vocab[id]);
  const total = parts.reduce((n, p) => n + p.length, 0);
  const all = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    all.set(p, offset);
    offset += p.length;
  }
  return decoder.decode(all);
}

export function formatBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}

/**
 * Training text for the demo tokenizer. Common English words and suffixes
 * appear often enough to be merged into single tokens; rare words are not,
 * so they visibly break into pieces.
 */
export const DEMO_CORPUS = `
The model reads the text one token at a time. A token is a piece of a word, a whole word,
or a single character. The tokenizer splits the text into tokens and then the model turns
each token into a number. The numbers are the input to the network, and the network predicts
the next token. Then the next token is added to the text and the model predicts again.
Tokenization is the first step. Training a tokenizer means finding the pairs of characters
that appear together most often and merging them into new tokens. The merging continues
until the vocabulary is large enough. Common words such as the, and, is, to, of, in, that,
it, for, on, with, as, was, are, be, this, have, from, or, by, not, but, what, all, were,
when, we, there, can, an, your, which, their, said, if, do, will, each, about, how, up, out,
them, then, she, many, some, so, these, would, other, into, has, more, her, two, like, him,
see, time, could, no, make, than, first, been, its, who, now, people, my, made, over, did,
down, only, way, find, use, may, water, long, little, very, after, words, called, just,
where, most, know, get, through, back, much, before, go, good, new, write, our, used, me,
man, too, any, day, same, right, look, think, also, around, another, came, come, work,
three, word, must, because, does, part, even, place, well, such, here, take, why, things,
help, put, years, different, away, again, off, went, old, number, great, tell, men, say,
small, every, found, still, between, name, should, home, big, give, air, line, set, own,
under, read, last, never, us, left, end, along, while, might, next, sound, below, saw,
something, thought, both, few, those, always, looked, show, large, often, together, asked,
house, world, going, want, school, important, until, form, food, keep, children, feet,
land, side, without, boy, once, animals, life, enough, took, sometimes, four, head, above,
kind, began, almost, live, page, got, earth, need, far, hand, high, year, mother, light,
parts, country, father, let, night, following, picture, being, study, second, eyes, soon,
times, story, boys, since, white, days, paper, hard, near, sentence, better, best, across,
during, today, others, however, sure, means, knew, try, told, young, miles, sun, ways,
thing, whole, hear, example, heard, several, change, answer, room, sea, against, top,
turned, learn, point, city, play, toward, five, using, himself, usually, money, seen,
reading, writing, talking, walking, working, playing, learning, thinking, making, taking,
helpful, useful, careful, playful, quickly, slowly, really, finally, happiness, kindness,
unable, unhappy, unkind, undo, unclear, simple, simply, model, models, language, languages,
`;

let defaultModel: BpeModel | null = null;

/** Number of merges learned for the demo tokenizer. */
export const DEMO_MERGES = 300;

/** Lazily trains (once) and returns the demo tokenizer. */
export function getDemoTokenizer(): BpeModel {
  if (!defaultModel) defaultModel = trainBpe(DEMO_CORPUS, DEMO_MERGES);
  return defaultModel;
}
