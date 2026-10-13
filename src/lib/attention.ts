/**
 * Hand-authored attention weights for teaching. They imitate the kind of
 * pattern a trained attention head can show, but they were written by hand,
 * not extracted from a model. Each row sums to 1, as softmax output would.
 */

export interface AttentionPreset {
  id: number;
  label: string;
  sentence: string[];
  /** weights[from][to]: share of `from`'s attention spent on `to`. */
  weights: Record<number, number[]>;
  ambiguousWordIndex: number;
  insight: string;
}

export const ATTENTION_PRESETS: AttentionPreset[] = [
  {
    id: 1,
    label: "River bank",
    sentence: ["The", "bank", "of", "the", "winding", "river", "had", "green", "moss."],
    ambiguousWordIndex: 1,
    weights: {
      1: [0.03, 0.2, 0.05, 0.03, 0.1, 0.45, 0.04, 0.05, 0.05],
      5: [0.03, 0.5, 0.05, 0.03, 0.15, 0.1, 0.04, 0.05, 0.05],
    },
    insight:
      "'bank' puts most of its attention on 'river', so the information mixed into 'bank' is about geography, not money.",
  },
  {
    id: 2,
    label: "Financial bank",
    sentence: ["The", "bank", "was", "closed", "to", "protect", "assets", "and", "money."],
    ambiguousWordIndex: 1,
    weights: {
      1: [0.03, 0.15, 0.03, 0.15, 0.02, 0.08, 0.14, 0.05, 0.35],
      8: [0.03, 0.4, 0.03, 0.1, 0.02, 0.12, 0.15, 0.03, 0.12],
    },
    insight:
      "Here 'bank' attends mostly to 'money', 'closed' and 'assets', pulling its meaning towards the financial institution.",
  },
  {
    id: 3,
    label: "Dog's bark",
    sentence: ["The", "dog", "let", "out", "a", "harsh", "bark", "at", "the", "mailman."],
    ambiguousWordIndex: 6,
    weights: {
      6: [0.02, 0.45, 0.04, 0.04, 0.01, 0.1, 0.17, 0.02, 0.02, 0.13],
      1: [0.03, 0.15, 0.04, 0.04, 0.02, 0.04, 0.45, 0.03, 0.03, 0.17],
    },
    insight:
      "'bark' attends strongly to 'dog', which points to the sound a dog makes rather than the outside of a tree.",
  },
  {
    id: 4,
    label: "Tree bark",
    sentence: ["We", "scraped", "rough", "bark", "off", "the", "old", "pine", "tree."],
    ambiguousWordIndex: 3,
    weights: {
      3: [0.02, 0.08, 0.15, 0.18, 0.03, 0.02, 0.05, 0.05, 0.42],
      8: [0.02, 0.06, 0.05, 0.5, 0.02, 0.02, 0.1, 0.1, 0.13],
    },
    insight:
      "'bark' links to 'tree', 'rough' and 'pine', so it is read as the outer layer of a tree.",
  },
];
