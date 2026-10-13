/**
 * Next-token sampling math used by the playground.
 *
 * These are the same operations a real decoder applies to a model's output
 * logits: temperature scaling, softmax, top-k and top-p (nucleus) filtering,
 * renormalisation and a weighted random draw. Only the logits fed into them
 * in the UI are hand-picked for illustration.
 */

export interface Candidate {
  token: string;
  logit: number;
}

export interface ScoredCandidate extends Candidate {
  /** Softmax probability after temperature, before any filtering. */
  probability: number;
  /** Whether the candidate survives top-k and top-p filtering. */
  kept: boolean;
  /** Probability after filtering and renormalisation (0 if removed). */
  finalProbability: number;
}

export interface SamplingSettings {
  temperature: number;
  /** Keep only the k most likely tokens. 0 or >= vocabulary size disables it. */
  topK: number;
  /** Keep the smallest set of tokens whose cumulative probability reaches p. 1 disables it. */
  topP: number;
}

/** Smallest temperature we divide by; T -> 0 approaches greedy decoding. */
export const MIN_TEMPERATURE = 0.05;

/**
 * Numerically stable softmax of `logits / temperature`.
 */
export function softmax(logits: number[], temperature = 1): number[] {
  if (logits.length === 0) return [];
  const t = Math.max(MIN_TEMPERATURE, temperature);
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Returns a keep-mask for the top-k entries of `probs` (ties broken by index).
 */
export function topKMask(probs: number[], k: number): boolean[] {
  if (k <= 0 || k >= probs.length) return probs.map(() => true);
  const order = rankIndices(probs);
  const mask = probs.map(() => false);
  for (let i = 0; i < k; i++) mask[order[i]] = true;
  return mask;
}

/**
 * Returns a keep-mask for nucleus (top-p) sampling: the smallest set of the
 * most likely tokens whose cumulative probability is >= p. The most likely
 * token is always kept.
 */
export function topPMask(probs: number[], p: number): boolean[] {
  if (p >= 1) return probs.map(() => true);
  const order = rankIndices(probs);
  const mask = probs.map(() => false);
  let cumulative = 0;
  for (const idx of order) {
    mask[idx] = true;
    cumulative += probs[idx];
    // Small tolerance so floating-point rounding does not pull in an extra token.
    if (cumulative >= p - 1e-9) break;
  }
  return mask;
}

/**
 * Applies temperature, softmax, top-k, then top-p (the order used by common
 * inference libraries) and renormalises the surviving probabilities.
 * Output is sorted by probability, highest first.
 */
export function scoreCandidates(
  candidates: Candidate[],
  settings: SamplingSettings,
): ScoredCandidate[] {
  const probs = softmax(
    candidates.map((c) => c.logit),
    settings.temperature,
  );
  const kMask = topKMask(probs, settings.topK);

  // Top-p operates on the distribution that remains after top-k.
  const afterK = renormalise(probs.map((p, i) => (kMask[i] ? p : 0)));
  const pMask = topPMask(afterK, settings.topP);
  const kept = probs.map((_, i) => kMask[i] && pMask[i]);
  const final = renormalise(probs.map((p, i) => (kept[i] ? p : 0)));

  return candidates
    .map((c, i) => ({
      ...c,
      probability: probs[i],
      kept: kept[i],
      finalProbability: final[i],
    }))
    .sort((a, b) => b.probability - a.probability);
}

/**
 * Draws an index from a probability vector. `random` must return a value in
 * [0, 1) and is injectable so the draw can be tested deterministically.
 */
export function sampleIndex(probs: number[], random: () => number = Math.random): number {
  const total = probs.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error("Cannot sample from an all-zero distribution");
  const r = random() * total;
  let cumulative = 0;
  let lastNonZero = -1;
  for (let i = 0; i < probs.length; i++) {
    if (probs[i] <= 0) continue;
    lastNonZero = i;
    cumulative += probs[i];
    if (r < cumulative) return i;
  }
  // Floating point rounding can leave r a hair above the final cumulative sum.
  return lastNonZero;
}

/** Converts a probability to a logit (natural log), for authoring examples. */
export function logitFromProbability(p: number): number {
  return Math.log(p);
}

function renormalise(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum > 0 ? values.map((v) => v / sum) : values.map(() => 0);
}

function rankIndices(values: number[]): number[] {
  return values
    .map((v, i) => [v, i] as const)
    .sort((a, b) => b[0] - a[0] || a[1] - b[1])
    .map(([, i]) => i);
}
