import { describe, expect, it } from "vitest";
import { DEMO_CORPUS, decode, encode, getDemoTokenizer, pretokenize, trainBpe } from "./bpe";

describe("pretokenize", () => {
  it("keeps the leading space attached to words", () => {
    expect(pretokenize("Hello world, 42 times!")).toEqual(["Hello", " world", ",", " 42", " times", "!"]);
  });
});

describe("trainBpe", () => {
  it("learns the most frequent pair first", () => {
    const model = trainBpe("aaab aaab aaab", 1);
    expect(model.merges[0]).toEqual(["a".charCodeAt(0), "a".charCodeAt(0)]);
    expect(new TextDecoder().decode(model.vocab[256])).toBe("aa");
  });

  it("stops when no pair repeats", () => {
    expect(trainBpe("abc", 10).merges).toHaveLength(0);
  });
});

describe("demo tokenizer", () => {
  const model = getDemoTokenizer();

  it("round-trips arbitrary text, including emoji and accents", () => {
    for (const text of ["Tokenization is simple!", "naïve café 🔥", "  spaces\n\nnewlines", ""]) {
      expect(decode(encode(text, model).map((t) => t.id), model)).toBe(text);
    }
  });

  it("encodes frequent words as single tokens and rare words as several", () => {
    expect(encode(" the", model)).toHaveLength(1);
    expect(encode(" Zyzzyva", model).length).toBeGreaterThan(1);
  });

  it("falls back to raw bytes for characters it never saw", () => {
    const tokens = encode("🔥", model);
    expect(tokens).toHaveLength(4); // 4 UTF-8 bytes, no merges
    expect(tokens.every((t) => t.id < 256)).toBe(true);
  });

  it("is deterministic across independently trained models", () => {
    const fresh = trainBpe(DEMO_CORPUS, model.merges.length);
    const text = "The model predicts the next token.";
    expect(encode(text, fresh).map((t) => t.id)).toEqual(encode(text, model).map((t) => t.id));
  });
});
