export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export type ResultTier = "perfect" | "strong" | "pass" | "review";

export interface QuizResult {
  correct: number;
  answered: number;
  total: number;
  /** Whole-number percentage of all questions answered correctly. */
  percent: number;
  passed: boolean;
  tier: ResultTier;
}

/** Share of questions that must be correct to pass. */
export const PASS_RATIO = 0.6;

/**
 * Scores a set of answers. `answers[i]` is the option index chosen for
 * `questions[i]`, or null/undefined if unanswered. Unanswered questions count
 * as incorrect.
 */
export function scoreQuiz(
  questions: QuizQuestion[],
  answers: ReadonlyArray<number | null | undefined>,
): QuizResult {
  const total = questions.length;
  let correct = 0;
  let answered = 0;
  questions.forEach((q, i) => {
    const a = answers[i];
    if (a === null || a === undefined) return;
    answered += 1;
    if (a === q.correctIdx) correct += 1;
  });

  const ratio = total === 0 ? 0 : correct / total;
  const percent = Math.round(ratio * 100);
  const passed = total > 0 && ratio >= PASS_RATIO;

  let tier: ResultTier = "review";
  if (total > 0 && correct === total) tier = "perfect";
  else if (ratio >= 0.8) tier = "strong";
  else if (passed) tier = "pass";

  return { correct, answered, total, percent, passed, tier };
}

export const TIER_MESSAGES: Record<ResultTier, string> = {
  perfect: "Perfect score. You have a solid picture of how a modern LLM turns text into predictions.",
  strong: "Strong result. Review the explanations for the questions you missed.",
  pass: "You passed. Revisiting a chapter or two will fill in the gaps.",
  review: "Below the 60% pass mark. Work back through the chapters and try again.",
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is a 'token' in the context of large language models?",
    options: [
      "A unit of cryptocurrency used to pay for AI services.",
      "A fragment of text (a word, part of a word, or a character) mapped to a numerical ID.",
      "A hardware slot on a graphics card that runs predictions.",
      "A security certificate proving the user is not a bot.",
    ],
    correctIdx: 1,
    explanation:
      "Tokens are the units an LLM reads and writes. A tokenizer splits text into sub-word pieces and maps each piece to an ID in a fixed vocabulary.",
  },
  {
    id: 2,
    question: "How do embeddings represent similarity between words?",
    options: [
      "They sort words alphabetically.",
      "They store words in text files organised by topic.",
      "They map tokens to vectors in a high-dimensional space where related tokens end up close together.",
      "They run a web search every time a word is predicted.",
    ],
    correctIdx: 2,
    explanation:
      "Each token ID indexes a learned vector. Training pushes tokens used in similar contexts towards similar vectors, so distance and direction carry meaning.",
  },
  {
    id: 3,
    question: "What is the key idea behind self-attention in Transformers?",
    options: [
      "It directs the GPU's cooling to the busiest calculations.",
      "It processes the words of a sentence strictly one at a time.",
      "It looks up dictionary translations while the model runs.",
      "Every token computes how relevant every other token is and mixes in their information, all in parallel.",
    ],
    correctIdx: 3,
    explanation:
      "Self-attention lets an ambiguous word such as 'bank' draw on context words like 'river' or 'money', and it does so for all positions at once.",
  },
  {
    id: 4,
    question: "What does the temperature setting change during generation?",
    options: [
      "The clock speed of the processor.",
      "How peaked or flat the next-token probability distribution is: lower is more predictable, higher is more varied.",
      "The volume of synthesised speech.",
      "The colour theme of the chat window.",
    ],
    correctIdx: 1,
    explanation:
      "Logits are divided by the temperature before softmax. T < 1 sharpens the distribution towards the top token; T > 1 flattens it so less likely tokens are picked more often.",
  },
  {
    id: 5,
    question: "Why are positional encodings added to token embeddings?",
    options: [
      "To limit how many words a prompt may contain.",
      "To record where the server is physically located.",
      "To tell the model the order of the tokens, because attention on its own ignores order.",
      "To compress the output so it downloads faster.",
    ],
    correctIdx: 2,
    explanation:
      "Attention treats its inputs as a set. Positional information (added vectors or rotary encodings) is what lets the model tell 'dog bites man' from 'man bites dog'.",
  },
  {
    id: 6,
    question: "In self-attention, what role does the Query vector play?",
    options: [
      "It describes what the current token is looking for in the other tokens.",
      "It is a hard-coded safety filter.",
      "It holds the raw text produced by the tokenizer.",
      "It defines the spelling of the predicted token.",
    ],
    correctIdx: 0,
    explanation:
      "Each token's Query is compared with every token's Key (a dot product). The resulting scores, after softmax, decide how much of each token's Value is mixed in.",
  },
  {
    id: 7,
    question: "How is the similarity between two embedding vectors usually measured?",
    options: [
      "By comparing their spelling.",
      "With cosine similarity or a dot product.",
      "By timing how long each takes to compute.",
      "By converting them back to bytes.",
    ],
    correctIdx: 1,
    explanation:
      "Cosine similarity measures the angle between vectors: 1 means same direction, 0 means unrelated (orthogonal). The dot product is the same idea without normalising length.",
  },
  {
    id: 8,
    question: "What do the feed-forward (MLP) blocks in each Transformer layer do?",
    options: [
      "Convert sentences to HTML.",
      "Encrypt the model weights.",
      "Transform each token's vector independently; much of the knowledge learned in training is thought to be stored there.",
      "Route network packets to speed up downloads.",
    ],
    correctIdx: 2,
    explanation:
      "Attention moves information between positions; the MLP then processes each position on its own. Interpretability research suggests many learned facts live in these weights.",
  },
  {
    id: 9,
    question: "What does alignment training (such as SFT and RLHF) add to a pre-trained model?",
    options: [
      "The ability to read files on your computer.",
      "Behaviour as a helpful, honest and harmless assistant rather than a raw text continuer.",
      "A way to convert decimals to binary.",
      "A TypeScript compiler.",
    ],
    correctIdx: 1,
    explanation:
      "A base model only continues text. Supervised fine-tuning on example conversations, then optimisation against human preference data, teaches it to follow instructions and decline harmful requests.",
  },
  {
    id: 10,
    question: "What does the softmax step at the end of the model do?",
    options: [
      "Formats the text to fit the browser window.",
      "Resets the temperature to its default.",
      "Removes negative numbers to shrink the output.",
      "Turns raw scores (logits) into probabilities that are all positive and sum to 1.",
    ],
    correctIdx: 3,
    explanation:
      "The final layer outputs one logit per vocabulary entry. Softmax exponentiates and normalises them into a probability distribution that the sampler draws from.",
  },
];
