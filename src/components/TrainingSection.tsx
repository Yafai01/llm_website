import { useRef, useState, type KeyboardEvent } from "react";
import { CheckCircle2, RotateCcw, Scale, XCircle } from "lucide-react";
import { Card, CardTitle, SectionHeader, SimulationNotice, buttonPrimary, buttonSecondary } from "./ui";

type Choice = "A" | "B";

interface PreferenceScenario {
  prompt: string;
  responseA: string;
  responseB: string;
  preferred: Choice;
  reason: string;
}

const SCENARIOS: PreferenceScenario[] = [
  {
    prompt: "Write a message apologising for arriving late to a project meeting.",
    responseA: "Late. Stuck. Sorry.",
    responseB:
      "Hi all, apologies, I'm running about 10 minutes late because of a train delay. Please start without me and I'll catch up on notes.",
    preferred: "B",
    reason: "B is polite, explains the delay and tells the team what to do. A is curt and unhelpful.",
  },
  {
    prompt: "How do I make a simple baking-soda volcano for a school project?",
    responseA: "I can't help with anything involving eruptions or explosions.",
    responseB:
      "Put a small bottle inside a clay or paper cone. Add warm water, a squirt of dish soap, red food colouring and two spoons of baking soda, then pour in vinegar to make it foam over.",
    preferred: "B",
    reason:
      "B is safe and genuinely helpful. A is an over-refusal: alignment aims to make models decline harmful requests, not harmless ones.",
  },
  {
    prompt: "Draft a polite reminder to a client whose invoice is overdue.",
    responseA:
      "Hello, I hope you're well. This is a friendly reminder that invoice #204 is now past due. Could you let me know when we can expect payment? Happy to resend it if needed.",
    responseB: "PAY INVOICE 204 NOW OR WE WILL TAKE ACTION.",
    preferred: "A",
    reason: "A is professional and keeps the relationship intact. B is hostile.",
  },
];

const STAGES = [
  {
    id: "pretrain",
    label: "Pre-training",
    title: "Pre-training: predicting the next token on a huge text corpus",
    body: (
      <>
        <p>
          The model reads an enormous amount of text (web pages, books, code) and is trained on one task: predict the
          next token. Getting good at this forces it to pick up grammar, facts and patterns of reasoning.
        </p>
        <p>
          This is by far the most expensive stage, typically running on large GPU or TPU clusters for weeks to months.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Result:</strong> a <em>base model</em> that continues text
          but does not reliably follow instructions. Asked &ldquo;Do you have a pen?&rdquo;, it may simply carry on
          the story instead of answering.
        </p>
      </>
    ),
  },
  {
    id: "sft",
    label: "Fine-tuning (SFT)",
    title: "Supervised fine-tuning: learning to follow instructions",
    body: (
      <>
        <p>
          The base model is trained further on a much smaller, curated set of example conversations, each pairing a
          request with a high-quality answer written or checked by people.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
{`User:      Translate "hello everyone" into French.
Assistant: Bonjour à tous !`}
        </pre>
        <p>
          <strong className="font-medium text-slate-800">Result:</strong> the model learns the assistant format and
          answers requests directly.
        </p>
      </>
    ),
  },
  {
    id: "rlhf",
    label: "Preferences (RLHF)",
    title: "Learning from human preferences",
    body: (
      <>
        <p>
          People compare pairs of model answers to the same prompt and pick the better one. These comparisons train a{" "}
          <strong className="font-medium text-slate-800">reward model</strong> that scores answers the way the
          raters would.
        </p>
        <p>
          The assistant is then optimised to produce answers the reward model scores highly (reinforcement learning
          from human feedback, RLHF). Newer methods such as DPO learn from the same comparisons directly.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Result:</strong> answers that are more helpful, honest and
          harmless, including declining genuinely harmful requests.
        </p>
      </>
    ),
  },
] as const;

type StageId = (typeof STAGES)[number]["id"];

export default function TrainingSection() {
  const [stage, setStage] = useState<StageId>("pretrain");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [votes, setVotes] = useState<Array<Choice | null>>(() => SCENARIOS.map(() => null));
  const [idx, setIdx] = useState(0);

  const scenario = SCENARIOS[idx];
  const vote = votes[idx];
  const finished = votes.every((v) => v !== null) && idx === SCENARIOS.length - 1 && vote !== null;
  const agreed = votes.filter((v, i) => v === SCENARIOS[i].preferred).length;
  const answered = votes.filter((v) => v !== null).length;
  const activeStage = STAGES.find((s) => s.id === stage) ?? STAGES[0];

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % STAGES.length;
    if (e.key === "ArrowLeft") next = (i - 1 + STAGES.length) % STAGES.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = STAGES.length - 1;
    if (next >= 0) {
      e.preventDefault();
      setStage(STAGES[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  const castVote = (choice: Choice) => {
    if (vote) return;
    setVotes((prev) => prev.map((v, i) => (i === idx ? choice : v)));
  };

  const restart = () => {
    setVotes(SCENARIOS.map(() => null));
    setIdx(0);
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chapter 5 · Training" title="From text predictor to assistant">
        <p>
          A model that only predicts text is not yet a useful assistant. Chatbots are typically built in three stages,
          each adding a different kind of behaviour.
        </p>
      </SectionHeader>

      <div>
        <div role="tablist" aria-label="Training stages" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STAGES.map((s, i) => {
            const selected = s.id === stage;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={selected}
                aria-controls={`panel-${s.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setStage(s.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="block text-xs text-slate-500">Stage {i + 1}</span>
                {s.label}
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id={`panel-${activeStage.id}`}
          aria-labelledby={`tab-${activeStage.id}`}
          className="mt-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <h3 className="text-base font-semibold text-slate-900">{activeStage.title}</h3>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">{activeStage.body}</div>
        </div>
      </div>

      <Card>
        <CardTitle icon={<Scale size={16} className="text-indigo-600" aria-hidden="true" />}>
          Try it: be the human rater
        </CardTitle>

        <SimulationNotice>
          Both responses were written by hand to show what preference data looks like. Your votes are compared with a
          reference choice and are not used to train anything.
        </SimulationNotice>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Comparison {idx + 1} of {SCENARIOS.length}
          </span>
          <span>
            Agreement with reference: {agreed} / {answered}
          </span>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Prompt</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{scenario.prompt}</p>
        </div>

        <fieldset className="mt-3">
          <legend className="sr-only">Which response is better?</legend>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(["A", "B"] as const).map((choice) => {
              const text = choice === "A" ? scenario.responseA : scenario.responseB;
              const isPreferred = scenario.preferred === choice;
              const isVote = vote === choice;
              let style = "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50";
              if (vote) {
                style = isPreferred
                  ? "border-emerald-500 bg-emerald-50"
                  : isVote
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-white opacity-70";
              }
              return (
                <button
                  type="button"
                  key={choice}
                  onClick={() => castVote(choice)}
                  aria-disabled={vote !== null}
                  aria-pressed={isVote}
                  className={`flex flex-col rounded-lg border p-4 text-left text-sm transition-colors ${style} ${
                    vote ? "cursor-default" : ""
                  }`}
                >
                  <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                    Response {choice}
                    {vote && isPreferred && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={14} aria-hidden="true" /> Preferred
                      </span>
                    )}
                    {vote && isVote && !isPreferred && (
                      <span className="inline-flex items-center gap-1 text-red-700">
                        <XCircle size={14} aria-hidden="true" /> Your pick
                      </span>
                    )}
                  </span>
                  <span className="leading-relaxed text-slate-800">{text}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div aria-live="polite">
          {vote && (
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
              <strong className="font-medium text-slate-800">
                {vote === scenario.preferred ? "You agreed with the reference. " : "The reference prefers the other answer. "}
              </strong>
              {scenario.reason}
            </p>
          )}
          {finished && (
            <p className="mt-3 text-sm font-medium text-slate-800">
              Done: you agreed on {agreed} of {SCENARIOS.length}. Thousands of comparisons like these are what a reward
              model is trained on.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={restart} className={buttonSecondary} disabled={answered === 0}>
            <RotateCcw size={16} aria-hidden="true" /> Start over
          </button>
          {vote && idx < SCENARIOS.length - 1 && (
            <button type="button" onClick={() => setIdx(idx + 1)} className={buttonPrimary}>
              Next comparison
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
