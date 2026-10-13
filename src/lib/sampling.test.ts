import { describe, expect, it } from "vitest";
import { sampleIndex, scoreCandidates, softmax, topKMask, topPMask } from "./sampling";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("softmax", () => {
  it("returns a probability distribution", () => {
    const p = softmax([2, 1, 0.1]);
    expect(sum(p)).toBeCloseTo(1, 12);
    expect(p.every((x) => x > 0)).toBe(true);
    // Known values for softmax([2, 1, 0.1])
    expect(p[0]).toBeCloseTo(0.659, 3);
    expect(p[1]).toBeCloseTo(0.2424, 3);
    expect(p[2]).toBeCloseTo(0.0986, 3);
  });

  it("recovers the original distribution from log-probabilities at T = 1", () => {
    const probs = [0.7, 0.2, 0.1];
    const p = softmax(probs.map(Math.log), 1);
    p.forEach((x, i) => expect(x).toBeCloseTo(probs[i], 12));
  });

  it("matches p^(1/T) renormalised for other temperatures", () => {
    const probs = [0.7, 0.2, 0.1];
    for (const t of [0.2, 0.5, 1.5, 2]) {
      const expected = probs.map((x) => x ** (1 / t));
      const z = sum(expected);
      const p = softmax(probs.map(Math.log), t);
      p.forEach((x, i) => expect(x).toBeCloseTo(expected[i] / z, 10));
    }
  });

  it("sharpens at low temperature and flattens at high temperature", () => {
    const logits = [3, 2, 1];
    const base = softmax(logits, 1)[0];
    const cold = softmax(logits, 0.25);
    const hot = softmax(logits, 4);
    expect(cold[0]).toBeGreaterThan(base);
    expect(hot[0]).toBeLessThan(base);
    expect(cold[0]).toBeGreaterThan(0.98);
    expect(Math.max(...hot) - Math.min(...hot)).toBeLessThan(0.2);
  });

  it("is numerically stable for large logits and handles empty input", () => {
    const p = softmax([1000, 1001, 1002]);
    expect(p.every(Number.isFinite)).toBe(true);
    expect(sum(p)).toBeCloseTo(1, 12);
    expect(softmax([])).toEqual([]);
  });
});

describe("top-k", () => {
  it("keeps the k most likely tokens", () => {
    expect(topKMask([0.1, 0.5, 0.15, 0.25], 2)).toEqual([false, true, false, true]);
  });

  it("is disabled for k = 0 or k >= vocabulary size", () => {
    expect(topKMask([0.5, 0.5], 0)).toEqual([true, true]);
    expect(topKMask([0.5, 0.5], 5)).toEqual([true, true]);
  });
});

describe("top-p", () => {
  it("keeps the smallest set reaching the cumulative threshold", () => {
    // sorted: 0.5, 0.3, 0.15, 0.05
    expect(topPMask([0.05, 0.5, 0.15, 0.3], 0.8)).toEqual([false, true, false, true]);
    expect(topPMask([0.05, 0.5, 0.15, 0.3], 0.81)).toEqual([false, true, true, true]);
  });

  it("always keeps the top token even for tiny p", () => {
    expect(topPMask([0.2, 0.8], 0.01)).toEqual([false, true]);
  });

  it("keeps everything at p = 1", () => {
    expect(topPMask([0.2, 0.8], 1)).toEqual([true, true]);
  });
});

describe("scoreCandidates", () => {
  const candidates = [
    { token: "a", logit: Math.log(0.5) },
    { token: "b", logit: Math.log(0.3) },
    { token: "c", logit: Math.log(0.15) },
    { token: "d", logit: Math.log(0.05) },
  ];

  it("sorts by probability and renormalises kept tokens", () => {
    const scored = scoreCandidates(candidates, { temperature: 1, topK: 0, topP: 0.8 });
    expect(scored.map((s) => s.token)).toEqual(["a", "b", "c", "d"]);
    expect(scored.map((s) => s.kept)).toEqual([true, true, false, false]);
    expect(scored[0].finalProbability).toBeCloseTo(0.5 / 0.8, 10);
    expect(scored[1].finalProbability).toBeCloseTo(0.3 / 0.8, 10);
    expect(scored[2].finalProbability).toBe(0);
    expect(sum(scored.map((s) => s.finalProbability))).toBeCloseTo(1, 12);
  });

  it("applies top-k before top-p", () => {
    const scored = scoreCandidates(candidates, { temperature: 1, topK: 1, topP: 1 });
    expect(scored.filter((s) => s.kept).map((s) => s.token)).toEqual(["a"]);
    expect(scored[0].finalProbability).toBe(1);
  });

  it("keeps all tokens with filtering disabled", () => {
    const scored = scoreCandidates(candidates, { temperature: 1, topK: 0, topP: 1 });
    expect(scored.every((s) => s.kept)).toBe(true);
    scored.forEach((s) => expect(s.finalProbability).toBeCloseTo(s.probability, 12));
  });
});

describe("sampleIndex", () => {
  it("maps the random draw onto cumulative probability", () => {
    const probs = [0.2, 0.5, 0.3];
    expect(sampleIndex(probs, () => 0)).toBe(0);
    expect(sampleIndex(probs, () => 0.19)).toBe(0);
    expect(sampleIndex(probs, () => 0.2)).toBe(1);
    expect(sampleIndex(probs, () => 0.69)).toBe(1);
    expect(sampleIndex(probs, () => 0.7)).toBe(2);
    expect(sampleIndex(probs, () => 0.999999)).toBe(2);
  });

  it("never returns a zero-probability index", () => {
    const probs = [0, 0.6, 0, 0.4, 0];
    for (let i = 0; i < 100; i++) {
      const idx = sampleIndex(probs, () => i / 100);
      expect(probs[idx]).toBeGreaterThan(0);
    }
  });

  it("follows the distribution over many draws", () => {
    let seed = 42;
    // Mulberry32: small deterministic PRNG
    const rng = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const probs = [0.6, 0.3, 0.1];
    const counts = [0, 0, 0];
    const n = 20000;
    for (let i = 0; i < n; i++) counts[sampleIndex(probs, rng)]++;
    counts.forEach((c, i) => expect(Math.abs(c / n - probs[i])).toBeLessThan(0.02));
  });

  it("rejects an all-zero distribution", () => {
    expect(() => sampleIndex([0, 0])).toThrow();
  });
});
