import { useMemo, useState } from "react";
import { Dices, RotateCcw, Sliders } from "lucide-react";
import { logitFromProbability, sampleIndex, scoreCandidates, type Candidate } from "../lib/sampling";
import { Card, CardTitle, SectionHeader, SimulationNotice, buttonPrimary, buttonSecondary } from "./ui";

interface PromptPreset {
  id: number;
  prompt: string;
  candidates: Candidate[];
}

/** Hand-picked next-token probabilities, stored as logits (natural log). */
const fromProbs = (entries: Array<[string, number]>): Candidate[] =>
  entries.map(([token, p]) => ({ token, logit: logitFromProbability(p) }));

const PRESETS: PromptPreset[] = [
  {
    id: 1,
    prompt: "Once upon a time, in a far away",
    candidates: fromProbs([
      ["kingdom", 0.45],
      ["land", 0.25],
      ["galaxy", 0.15],
      ["forest", 0.1],
      ["village", 0.04],
      ["sandwich", 0.006],
      ["refrigerator", 0.003],
      ["taxpayer", 0.001],
    ]),
  },
  {
    id: 2,
    prompt: "The quick brown fox jumps over the lazy",
    candidates: fromProbs([
      ["dog", 0.82],
      ["cat", 0.07],
      ["fox", 0.04],
      ["river", 0.03],
      ["log", 0.025],
      ["bacon", 0.01],
      ["spreadsheet", 0.005],
    ]),
  },
  {
    id: 3,
    prompt: "Artificial intelligence will change the",
    candidates: fromProbs([
      ["world", 0.38],
      ["way", 0.3],
      ["future", 0.15],
      ["economy", 0.1],
      ["classroom", 0.05],
      ["pineapple", 0.012],
      ["socks", 0.008],
    ]),
  },
];

const BULK_DRAWS = 100;

export default function PlaygroundSection() {
  const [presetId, setPresetId] = useState(1);
  const [temperature, setTemperature] = useState(1);
  const [topK, setTopK] = useState(0);
  const [topP, setTopP] = useState(1);
  const [lastDraw, setLastDraw] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const scored = useMemo(
    () => scoreCandidates(preset.candidates, { temperature, topK, topP }),
    [preset, temperature, topK, topP],
  );
  const totalDraws = Object.values(counts).reduce((a, b) => a + b, 0);
  const removed = scored.filter((s) => !s.kept).length;

  const resetDraws = () => {
    setLastDraw(null);
    setCounts({});
  };

  // Any change to the distribution invalidates the observed tallies.
  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    resetDraws();
  };

  const draw = (n: number) => {
    const probs = scored.map((s) => s.finalProbability);
    const next = { ...counts };
    let token = "";
    for (let i = 0; i < n; i++) {
      token = scored[sampleIndex(probs)].token;
      next[token] = (next[token] ?? 0) + 1;
    }
    setCounts(next);
    setLastDraw(token);
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chapter 4 · Output" title="Sampling: choosing the next token">
        <p>
          The model&rsquo;s last layer outputs one score (a{" "}
          <strong className="font-semibold text-slate-800">logit</strong>) for every token in its vocabulary. Softmax turns those scores into probabilities, optional filters
          remove unlikely tokens, and the next token is drawn at random in proportion to what is left.
        </p>
      </SectionHeader>

      <SimulationNotice>
        The candidate words and their starting probabilities are hand-picked; no model is running and a real
        vocabulary has tens of thousands of entries. The maths applied to them is real: temperature-scaled softmax,
        top-k, top-p, renormalisation and a weighted random draw, the same steps used by inference libraries.
      </SimulationNotice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="space-y-6 lg:col-span-5">
          <CardTitle icon={<Sliders size={16} className="text-indigo-600" aria-hidden="true" />}>Settings</CardTitle>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-slate-600">Prompt</legend>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  aria-pressed={p.id === presetId}
                  onClick={() => update(setPresetId)(p.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    p.id === presetId
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  &ldquo;{p.prompt} …&rdquo;
                </button>
              ))}
            </div>
          </fieldset>

          <SliderControl
            id="temperature"
            label="Temperature"
            value={temperature}
            display={temperature.toFixed(2)}
            min={0.1}
            max={2}
            step={0.05}
            onChange={update(setTemperature)}
            help="Logits are divided by T before softmax. Below 1 sharpens the distribution towards the top token; above 1 flattens it."
            scale={["0.1 near-greedy", "1.0 unchanged", "2.0 flat"]}
          />

          <SliderControl
            id="top-k"
            label="Top-k"
            value={topK}
            display={topK === 0 ? "off" : String(topK)}
            min={0}
            max={preset.candidates.length}
            step={1}
            onChange={update(setTopK)}
            help="Keep only the k most likely tokens. 0 turns the filter off."
            scale={["off", `${preset.candidates.length}`]}
          />

          <SliderControl
            id="top-p"
            label="Top-p (nucleus)"
            value={topP}
            display={topP >= 1 ? "off" : topP.toFixed(2)}
            min={0.1}
            max={1}
            step={0.05}
            onChange={update(setTopP)}
            help="Keep the smallest set of top tokens whose probabilities add up to at least p. 1.0 turns it off."
            scale={["0.1", "1.0 off"]}
          />
        </Card>

        <div className="space-y-4 lg:col-span-7">
          <Card>
            <p className="text-xs font-medium text-slate-600">Completion</p>
            <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800" aria-live="polite">
              {preset.prompt}{" "}
              {lastDraw ? (
                <mark className="rounded bg-indigo-100 px-1 font-semibold text-indigo-800">{lastDraw}</mark>
              ) : (
                <span className="text-slate-400">___</span>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => draw(1)} className={buttonPrimary}>
                <Dices size={16} aria-hidden="true" /> Sample next token
              </button>
              <button type="button" onClick={() => draw(BULK_DRAWS)} className={buttonSecondary}>
                Sample {BULK_DRAWS} times
              </button>
              <button type="button" onClick={resetDraws} className={buttonSecondary} disabled={totalDraws === 0}>
                <RotateCcw size={16} aria-hidden="true" /> Reset
              </button>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Next-token distribution</h3>
              <p className="text-xs text-slate-500">
                {totalDraws > 0 ? `${totalDraws} samples drawn` : "Sample to compare observed frequencies"}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">
                  Candidate tokens with logit, softmax probability, final probability after filtering, and observed
                  sample frequency
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th scope="col" className="py-2 pr-2 font-medium">Token</th>
                    <th scope="col" className="py-2 pr-2 text-right font-medium">Logit</th>
                    <th scope="col" className="py-2 pr-2 text-right font-medium">Softmax</th>
                    <th scope="col" className="py-2 pr-2 font-medium">Final probability</th>
                    <th scope="col" className="py-2 text-right font-medium">Observed</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.map((s) => (
                    <tr key={s.token} className={`border-b border-slate-100 ${s.kept ? "" : "text-slate-400"}`}>
                      <th scope="row" className="py-2 pr-2 font-mono font-medium">
                        {s.token}
                        {!s.kept && <span className="ml-2 font-sans text-xs font-normal">(filtered)</span>}
                      </th>
                      <td className="py-2 pr-2 text-right font-mono text-xs">{s.logit.toFixed(2)}</td>
                      <td className="py-2 pr-2 text-right font-mono text-xs">{(s.probability * 100).toFixed(1)}%</td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 min-w-12 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
                              style={{ width: `${s.finalProbability * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-xs">{(s.finalProbability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        {totalDraws > 0 ? `${(((counts[s.token] ?? 0) / totalDraws) * 100).toFixed(0)}%` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {removed > 0
                ? `${removed} token${removed === 1 ? " was" : "s were"} removed by top-k/top-p; the remaining probabilities were rescaled to add up to 100%.`
                : "No tokens are filtered with the current settings, so the final probabilities equal the softmax output."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  help,
  scale,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  help: string;
  scale: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-slate-600">
          {label}
        </label>
        <output htmlFor={id} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-describedby={`${id}-help`}
        aria-valuetext={display}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-slate-400" aria-hidden="true">
        {scale.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <p id={`${id}-help`} className="text-xs leading-relaxed text-slate-500">
        {help}
      </p>
    </div>
  );
}
