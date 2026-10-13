import { describe, expect, it } from "vitest";
import { ATTENTION_PRESETS } from "./attention";
import { add, getWord, nearestWords, subtract } from "./embeddings";

describe("attention presets", () => {
  it("has one weight per word and rows that sum to 1", () => {
    for (const preset of ATTENTION_PRESETS) {
      expect(preset.weights[preset.ambiguousWordIndex]).toBeDefined();
      for (const row of Object.values(preset.weights)) {
        expect(row).toHaveLength(preset.sentence.length);
        expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
      }
    }
  });
});

describe("toy embeddings", () => {
  it("King - Man + Woman lands nearest to Queen", () => {
    const result = add(subtract(getWord("King"), getWord("Man")), getWord("Woman"));
    expect(nearestWords(result, ["King", "Man", "Woman"], 1)[0].word).toBe("Queen");
  });
});
