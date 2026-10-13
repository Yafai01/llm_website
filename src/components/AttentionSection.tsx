import { useState } from "react";
import { Info, Network } from "lucide-react";
import { ATTENTION_PRESETS } from "../lib/attention";
import { Card, CardTitle, SectionHeader, SimulationNotice } from "./ui";

const pct = (w: number) => `${Math.round(w * 100)}%`;

export default function AttentionSection() {
  const [presetId, setPresetId] = useState(ATTENTION_PRESETS[0].id);
  const preset = ATTENTION_PRESETS.find((p) => p.id === presetId) ?? ATTENTION_PRESETS[0];
  const [activeIdx, setActiveIdx] = useState(preset.ambiguousWordIndex);

  const row = preset.weights[activeIdx] ?? preset.weights[preset.ambiguousWordIndex];
  const activeWord = preset.sentence[activeIdx];

  // Strongest link to a *different* word, used to describe non-target rows.
  const strongest = row
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => i !== activeIdx)
    .sort((a, b) => b.w - a.w)[0];

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chapter 3 · Context" title="Self-attention: reading words in context">
        <p>
          An embedding gives &ldquo;bank&rdquo; the same vector in every sentence. The Transformer (introduced in
          2017) fixes this with <strong className="font-semibold text-slate-800">self-attention</strong>: every token
          scores how relevant every other token is, turns the scores into weights with softmax, and mixes in a
          weighted blend of their information. All positions are processed in parallel.
        </p>
      </SectionHeader>

      <SimulationNotice>
        These attention weights were written by hand to show the kind of pattern a trained attention head can learn.
        Real models have dozens of heads per layer across many layers, and individual heads are often much harder to
        interpret.
      </SimulationNotice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-slate-600">Choose a sentence</legend>
            <div className="flex flex-col gap-2">
              {ATTENTION_PRESETS.map((p) => {
                const isSelected = p.id === presetId;
                return (
                  <button
                    type="button"
                    key={p.id}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setPresetId(p.id);
                      setActiveIdx(p.ambiguousWordIndex);
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Card className="bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Query, key and value</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Each token produces a <em>query</em> (what am I looking for?), a <em>key</em> (what do I contain?) and a{" "}
              <em>value</em> (what do I pass on?). The weight from token A to token B is the softmax of A&rsquo;s
              query dotted with B&rsquo;s key, scaled by √d.
            </p>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardTitle icon={<Network size={16} className="text-indigo-600" aria-hidden="true" />}>
              Where does &ldquo;{activeWord}&rdquo; look?
            </CardTitle>

            <p className="mb-2 text-xs text-slate-500" id="attention-words-label">
              Highlighted words have attention data. Select one to see its weights.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="attention-words-label">
              {preset.sentence.map((word, idx) => {
                const hasRow = Boolean(preset.weights[idx]);
                const isActive = idx === activeIdx;
                const weight = row[idx];
                const strength = isActive ? "" : weight >= 0.3 ? "bg-indigo-100 border-indigo-300" : weight >= 0.1 ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200";
                const base = `flex min-w-12 flex-col items-center rounded-lg border px-2.5 py-1.5 text-sm`;
                const content = (
                  <>
                    <span className={isActive ? "font-semibold" : ""}>{word}</span>
                    <span className={`font-mono text-[11px] ${isActive ? "text-indigo-100" : "text-slate-500"}`}>
                      {pct(weight)}
                    </span>
                  </>
                );
                return hasRow ? (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    aria-pressed={isActive}
                    className={`${base} ${
                      isActive ? "border-indigo-600 bg-indigo-600 text-white" : `${strength} text-slate-800 underline decoration-indigo-300 decoration-2 underline-offset-4 hover:border-indigo-400`
                    }`}
                  >
                    {content}
                  </button>
                ) : (
                  <span key={idx} className={`${base} ${strength} text-slate-700`}>
                    {content}
                  </span>
                );
              })}
            </div>

            <div className="mt-6 space-y-1.5" aria-label={`Attention weights from ${activeWord}`}>
              {preset.sentence.map((word, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0 truncate text-right text-slate-600">{word}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
                      style={{ width: `${row[idx] * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 font-mono text-slate-700">{pct(row[idx])}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 p-4" aria-live="polite">
              <Info size={16} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-slate-600">
                {activeIdx === preset.ambiguousWordIndex
                  ? preset.insight
                  : `'${activeWord}' gives its largest share of attention (${pct(strongest.w)}) to '${
                      preset.sentence[strongest.i]
                    }'. Attention is not symmetric: each word has its own row of weights.`}
              </p>
            </div>
          </Card>

          <p className="text-sm leading-relaxed text-slate-600">
            <strong className="font-medium text-slate-800">Takeaway:</strong> after attention, the vector for an
            ambiguous word has absorbed information from its context, so later layers can treat &ldquo;river
            bank&rdquo; and &ldquo;savings bank&rdquo; differently. Weights in each row always add up to 100%.
          </p>
        </div>
      </div>
    </div>
  );
}
