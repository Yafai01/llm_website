import { useState } from "react";
import { Calculator, Compass } from "lucide-react";
import {
  WORD_LIBRARY,
  add,
  distance,
  getWord,
  nearestWords,
  subtract,
  type Vec2,
  type WordVector,
} from "../lib/embeddings";
import { Card, CardTitle, SectionHeader, SimulationNotice } from "./ui";

// Chart geometry: x = gender (masculine left, feminine right), y = royalty (common bottom, royal top).
const toX = (v: Vec2) => 10 + v.gender * 0.8;
const toY = (v: Vec2) => 90 - v.royalty * 0.8;

const CATEGORY_FILL: Record<WordVector["category"], string> = {
  Royalty: "#4f46e5", // indigo-600
  People: "#0284c7", // sky-600
  Tech: "#64748b", // slate-500
};

type Stage = "start" | "subtract" | "add" | "result";

const KING = getWord("King");
const MAN = getWord("Man");
const WOMAN = getWord("Woman");
const AFTER_SUBTRACT = subtract(KING, MAN);
const AFTER_ADD = add(AFTER_SUBTRACT, WOMAN);
const ANSWER = nearestWords(AFTER_ADD, ["King", "Man", "Woman"], 1)[0];

const STAGES: { id: Stage; label: string; point: Vec2; text: string }[] = [
  { id: "start", label: "1. King", point: KING, text: "Start at the vector for 'King': high royalty, masculine." },
  {
    id: "subtract",
    label: "2. − Man",
    point: AFTER_SUBTRACT,
    text: "Subtracting 'Man' removes the 'ordinary masculine person' part, leaving roughly 'royalty'.",
  },
  {
    id: "add",
    label: "3. + Woman",
    point: AFTER_ADD,
    text: "Adding 'Woman' moves the point across to the feminine side while keeping the royalty.",
  },
  {
    id: "result",
    label: "4. Nearest",
    point: AFTER_ADD,
    text: `The closest word to the result (excluding the inputs) is '${ANSWER.word}'.`,
  },
];

const fmt = (v: Vec2) => `[${v.royalty}, ${v.gender}]`;

export default function EmbeddingSection() {
  const [selected, setSelected] = useState<WordVector>(KING);
  const [stage, setStage] = useState<Stage | null>(null);

  const stageIdx = stage ? STAGES.findIndex((s) => s.id === stage) : -1;
  const neighbours = nearestWords(selected, [selected.word], 3);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chapter 2 · Meaning as numbers" title="Embeddings: words as points in space">
        <p>
          A token ID on its own means nothing: token 400 is not similar to token 401. So each ID is mapped to a
          learned list of numbers, a <strong className="font-semibold text-slate-800">vector</strong>. During training,
          tokens used in similar contexts drift towards similar vectors, so closeness in this space reflects
          closeness in meaning.
        </p>
      </SectionHeader>

      <SimulationNotice>
        The two axes and every coordinate below were chosen by hand so the idea fits on a flat chart. Real
        embeddings have hundreds to thousands of learned dimensions that rarely line up with a single human concept.
      </SimulationNotice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardTitle icon={<Compass size={16} className="text-indigo-600" aria-hidden="true" />}>
            A 2D toy embedding space
          </CardTitle>
          <div className="mx-auto aspect-square w-full max-w-[480px] rounded-lg border border-slate-100 bg-slate-50">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
              role="img"
              aria-label={`Scatter plot of ${WORD_LIBRARY.length} words. Horizontal axis: masculine to feminine. Vertical axis: common to royal.`}
            >
              <defs>
                <marker id="emb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0 1 L10 5 L0 9 z" fill="#dc2626" />
                </marker>
              </defs>
              <line x1="10" y1="90" x2="90" y2="90" stroke="#cbd5e1" strokeWidth="0.3" />
              <line x1="10" y1="10" x2="10" y2="90" stroke="#cbd5e1" strokeWidth="0.3" />
              <text x="10" y="96" fontSize="3" fill="#64748b">
                masculine
              </text>
              <text x="90" y="96" fontSize="3" fill="#64748b" textAnchor="end">
                feminine
              </text>
              <text x="3" y="12" fontSize="3" fill="#64748b" transform="rotate(-90 3 12)" textAnchor="end">
                royal
              </text>
              <text x="3" y="90" fontSize="3" fill="#64748b" transform="rotate(-90 3 90)">
                common
              </text>

              {WORD_LIBRARY.map((w) => {
                const isSelected = w.word === selected.word;
                const isAnswer = stage === "result" && w.word === ANSWER.word;
                return (
                  <g key={w.word} onClick={() => setSelected(w)} className="cursor-pointer">
                    <circle
                      cx={toX(w)}
                      cy={toY(w)}
                      r={isSelected || isAnswer ? 2.4 : 1.7}
                      fill={CATEGORY_FILL[w.category]}
                      stroke={isAnswer ? "#dc2626" : "white"}
                      strokeWidth={isAnswer ? 0.8 : 0.4}
                    />
                    <text
                      x={toX(w)}
                      y={toY(w) - 3.2}
                      textAnchor="middle"
                      fontSize={isSelected ? 3.8 : 3.2}
                      fontWeight={isSelected ? 700 : 500}
                      fill="#0f172a"
                    >
                      {w.word}
                    </text>
                  </g>
                );
              })}

              {stageIdx >= 1 && (
                <line
                  x1={toX(KING)}
                  y1={toY(KING)}
                  x2={toX(AFTER_SUBTRACT)}
                  y2={toY(AFTER_SUBTRACT)}
                  stroke="#dc2626"
                  strokeWidth="0.6"
                  strokeDasharray="1.5 1"
                  markerEnd="url(#emb-arrow)"
                />
              )}
              {stageIdx >= 2 && (
                <line
                  x1={toX(AFTER_SUBTRACT)}
                  y1={toY(AFTER_SUBTRACT)}
                  x2={toX(AFTER_ADD)}
                  y2={toY(AFTER_ADD)}
                  stroke="#dc2626"
                  strokeWidth="0.6"
                  strokeDasharray="1.5 1"
                  markerEnd="url(#emb-arrow)"
                />
              )}
              {stage && (
                <circle
                  cx={toX(STAGES[stageIdx].point)}
                  cy={toY(STAGES[stageIdx].point)}
                  r="1.4"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.7"
                />
              )}
            </svg>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-600" id="word-picker-label">
              Select a word
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="word-picker-label">
              {WORD_LIBRARY.map((w) => (
                <button
                  type="button"
                  key={w.word}
                  onClick={() => setSelected(w)}
                  aria-pressed={w.word === selected.word}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    w.word === selected.word
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {w.word}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardTitle>Coordinates of &ldquo;{selected.word}&rdquo;</CardTitle>
            <div className="space-y-3" aria-live="polite">
              {[
                ["Royalty (dimension 1)", selected.royalty],
                ["Masculine → feminine (dimension 2)", selected.gender],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>{label}</span>
                    <span className="font-mono font-semibold text-slate-900">{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">Closest words on this chart</p>
                <ol className="mt-1 space-y-0.5 text-sm text-slate-700">
                  {neighbours.map((n) => (
                    <li key={n.word} className="flex justify-between">
                      <span>{n.word}</span>
                      <span className="font-mono text-xs text-slate-500">distance {distance(selected, n).toFixed(1)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle icon={<Calculator size={16} className="text-indigo-600" aria-hidden="true" />}>
              Vector arithmetic: King − Man + Woman
            </CardTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Arithmetic steps">
              {STAGES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  aria-pressed={stage === s.id}
                  className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                    stage === s.id
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-3 min-h-16 text-sm leading-relaxed text-slate-600" aria-live="polite">
              {stage ? (
                <>
                  <p>{STAGES[stageIdx].text}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {stage === "start" && `King = ${fmt(KING)}`}
                    {stage === "subtract" && `${fmt(KING)} − ${fmt(MAN)} = ${fmt(AFTER_SUBTRACT)}`}
                    {stage === "add" && `${fmt(AFTER_SUBTRACT)} + ${fmt(WOMAN)} = ${fmt(AFTER_ADD)}`}
                    {stage === "result" &&
                      `${ANSWER.word} = ${fmt(ANSWER)}, distance ${distance(AFTER_ADD, ANSWER).toFixed(1)}`}
                  </p>
                </>
              ) : (
                <p>Step through the calculation to see the point move across the chart.</p>
              )}
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
              Real models compare vectors with cosine similarity (the angle between them) or the dot product. This
              famous analogy holds only approximately in learned embeddings.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
