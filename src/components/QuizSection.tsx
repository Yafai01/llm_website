import { useState } from "react";
import { CheckCircle2, Printer, RotateCcw, XCircle } from "lucide-react";
import { PASS_RATIO, QUIZ_QUESTIONS, TIER_MESSAGES, scoreQuiz } from "../lib/quiz";
import { SectionHeader, buttonPrimary, buttonSecondary } from "./ui";

export default function QuizSection() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() => QUIZ_QUESTIONS.map(() => null));
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState("");

  const question = QUIZ_QUESTIONS[idx];
  const submitted = answers[idx] !== null;
  const result = scoreQuiz(QUIZ_QUESTIONS, answers);
  const isLast = idx === QUIZ_QUESTIONS.length - 1;

  const submit = () => {
    if (selected === null || submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === idx ? selected : a)));
  };

  const next = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setIdx(0);
    setAnswers(QUIZ_QUESTIONS.map(() => null));
    setSelected(null);
    setFinished(false);
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <SectionHeader eyebrow="Check your understanding" title="Quiz">
          <p>
            {QUIZ_QUESTIONS.length} multiple-choice questions covering every chapter. You need{" "}
            {Math.round(PASS_RATIO * 100)}% to pass. Each answer comes with a short explanation.
          </p>
        </SectionHeader>
      </div>

      {!finished ? (
        <div className="no-print grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <form
            className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              if (submitted) next();
              else submit();
            }}
          >
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Question {idx + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <span>
                Score: {result.correct} / {result.answered}
              </span>
            </div>
            <div
              className="mb-5 h-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={0}
              aria-valuemax={QUIZ_QUESTIONS.length}
              aria-valuenow={result.answered}
            >
              <div
                className="h-full bg-indigo-600 transition-[width] duration-300"
                style={{ width: `${(result.answered / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <fieldset>
              <legend className="text-base font-semibold text-slate-900">{question.question}</legend>
              <div className="mt-4 space-y-2">
                {question.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === question.correctIdx;
                  const isChosen = (submitted ? answers[idx] : selected) === oIdx;
                  let style = "border-slate-300 bg-white hover:bg-slate-50";
                  if (submitted) {
                    if (isCorrect) style = "border-emerald-500 bg-emerald-50";
                    else if (isChosen) style = "border-red-400 bg-red-50";
                    else style = "border-slate-200 bg-white text-slate-500";
                  } else if (isChosen) {
                    style = "border-indigo-600 bg-indigo-50";
                  }
                  return (
                    <label
                      key={oIdx}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-600 ${style} ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        value={oIdx}
                        checked={isChosen}
                        disabled={submitted}
                        onChange={() => setSelected(oIdx)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
                      />
                      <span className="flex-1 leading-relaxed">{opt}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-600" aria-label="Correct answer" />
                      )}
                      {submitted && isChosen && !isCorrect && (
                        <XCircle size={18} className="shrink-0 text-red-600" aria-label="Your answer" />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              {submitted ? (
                <button type="submit" className={buttonPrimary}>
                  {isLast ? "See results" : "Next question"}
                </button>
              ) : (
                <button type="submit" className={buttonPrimary} disabled={selected === null}>
                  Check answer
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-5" aria-live="polite">
            {submitted ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    answers[idx] === question.correctIdx ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {answers[idx] === question.correctIdx ? (
                    <>
                      <CheckCircle2 size={18} aria-hidden="true" /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={18} aria-hidden="true" /> Not quite
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{question.explanation}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Choose an answer and select <strong className="font-medium text-slate-700">Check answer</strong> to see
                the explanation.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="no-print rounded-xl border border-slate-200 bg-white p-6 text-center" aria-live="polite">
            <p className="text-sm text-slate-500">Your score</p>
            <p className="mt-1 text-4xl font-semibold text-slate-900">
              {result.correct} / {result.total}
            </p>
            <p className="mt-1 text-sm text-slate-500">{result.percent}%</p>
            <p
              className={`mx-auto mt-4 max-w-md rounded-lg px-4 py-3 text-sm ${
                result.passed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              {TIER_MESSAGES[result.tier]}
            </p>
          </div>

          {result.passed && (
            <div className="no-print rounded-xl border border-slate-200 bg-white p-5">
              <label htmlFor="record-name" className="text-xs font-medium text-slate-600">
                Name for your completion record (optional)
              </label>
              <input
                id="record-name"
                type="text"
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          {result.passed && (
            <section
              aria-label="Completion record"
              className="print-full rounded-xl border border-slate-300 bg-white p-8 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Completion record</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">LLM Simply Explained</h3>
              {name.trim() && <p className="mt-4 text-2xl font-semibold text-slate-900">{name.trim()}</p>}
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                completed the {QUIZ_QUESTIONS.length}-question self-assessment on tokenization, embeddings,
                self-attention, sampling and alignment, scoring {result.correct} out of {result.total}{" "}
                ({result.percent}%).
              </p>
              <p className="mt-4 text-xs text-slate-500">
                {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="mt-4 text-[11px] text-slate-400">
                Self-assessment record generated in the browser. Not an accredited certificate.
              </p>
            </section>
          )}

          <div className="no-print flex flex-wrap justify-center gap-2">
            {result.passed && (
              <button type="button" onClick={() => window.print()} className={buttonSecondary}>
                <Printer size={16} aria-hidden="true" /> Print or save as PDF
              </button>
            )}
            <button type="button" onClick={restart} className={buttonPrimary}>
              <RotateCcw size={16} aria-hidden="true" /> Retake quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
