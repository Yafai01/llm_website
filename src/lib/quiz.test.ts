import { describe, expect, it } from "vitest";
import { QUIZ_QUESTIONS, scoreQuiz, type QuizQuestion } from "./quiz";

const q = (correctIdx: number, id = 0): QuizQuestion => ({
  id,
  question: "?",
  options: ["a", "b", "c", "d"],
  correctIdx,
  explanation: "",
});

const tenQuestions = Array.from({ length: 10 }, (_, i) => q(i % 4, i));
const answersWithCorrect = (n: number) =>
  tenQuestions.map((question, i) => (i < n ? question.correctIdx : (question.correctIdx + 1) % 4));

describe("scoreQuiz", () => {
  it("counts correct answers", () => {
    const r = scoreQuiz(tenQuestions, answersWithCorrect(7));
    expect(r).toMatchObject({ correct: 7, answered: 10, total: 10, percent: 70, passed: true });
  });

  it("treats unanswered questions as incorrect", () => {
    const answers: Array<number | null> = Array(10).fill(null);
    answers[0] = tenQuestions[0].correctIdx;
    const r = scoreQuiz(tenQuestions, answers);
    expect(r).toMatchObject({ correct: 1, answered: 1, percent: 10, passed: false, tier: "review" });
  });

  it("assigns tiers at the documented thresholds", () => {
    expect(scoreQuiz(tenQuestions, answersWithCorrect(10)).tier).toBe("perfect");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(9)).tier).toBe("strong");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(8)).tier).toBe("strong");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(7)).tier).toBe("pass");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(6)).tier).toBe("pass");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(5)).tier).toBe("review");
    expect(scoreQuiz(tenQuestions, answersWithCorrect(0)).tier).toBe("review");
  });

  it("uses the pass ratio rather than a fixed count", () => {
    const five = tenQuestions.slice(0, 5);
    const firstN = (n: number) => five.map((x, i) => (i < n ? x.correctIdx : null));
    expect(scoreQuiz(five, firstN(3)).passed).toBe(true);
    expect(scoreQuiz(five, firstN(2)).passed).toBe(false);
  });

  it("handles an empty quiz", () => {
    expect(scoreQuiz([], [])).toMatchObject({ correct: 0, total: 0, percent: 0, passed: false });
  });
});

describe("QUIZ_QUESTIONS", () => {
  it("has well-formed questions with valid answer indexes and unique ids", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThan(0);
    const ids = new Set(QUIZ_QUESTIONS.map((x) => x.id));
    expect(ids.size).toBe(QUIZ_QUESTIONS.length);
    for (const question of QUIZ_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.correctIdx).toBeGreaterThanOrEqual(0);
      expect(question.correctIdx).toBeLessThan(question.options.length);
    }
  });
});
