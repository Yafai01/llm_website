import { useMemo, useState } from "react";
import { Cpu, Layers, X } from "lucide-react";
import { encode, formatBytes, getDemoTokenizer, type BpeModel } from "../lib/bpe";
import { Card, CardTitle, SectionHeader, SimulationNotice } from "./ui";

// Alternating tints so neighbouring tokens are distinguishable. Colour carries no meaning.
const TOKEN_TINTS = [
  "bg-indigo-50 border-indigo-200 text-indigo-900",
  "bg-sky-50 border-sky-200 text-sky-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-rose-50 border-rose-200 text-rose-900",
];

const MAX_INPUT = 2000;

/** Makes whitespace visible inside token chips. */
function visible(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "↵").replace(/\t/g, "⇥");
}

function vocabText(model: BpeModel, id: number): string {
  return new TextDecoder().decode(model.vocab[id]);
}

export default function TokenizerSection() {
  const model = useMemo(() => getDemoTokenizer(), []);
  const [text, setText] = useState("Tokenization is simple! Even outstanding words get split.");
  const [selected, setSelected] = useState(0);

  const tokens = useMemo(() => encode(text, model), [text, model]);
  const byteCount = useMemo(() => new TextEncoder().encode(text).length, [text]);
  const current = tokens[Math.min(selected, tokens.length - 1)];
  const currentIdx = Math.min(selected, tokens.length - 1);
  const vocabSize = model.vocab.length;

  const merge = current && current.id >= 256 ? model.merges[current.id - 256] : null;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Chapter 1 · Input" title="Tokenization: how models read text">
        <p>
          Models do not see letters or words. A <strong className="font-semibold text-slate-800">tokenizer</strong>{" "}
          first splits text into pieces called tokens, and each token is replaced by its ID in a fixed vocabulary.
          Most modern LLMs use <strong className="font-semibold text-slate-800">byte-pair encoding (BPE)</strong>:
          start from single bytes and repeatedly merge the most frequent neighbouring pair into a new token.
        </p>
      </SectionHeader>

      <SimulationNotice>
        This is a working byte-level BPE tokenizer, but its {vocabSize}-token vocabulary was learned in your browser
        from one short built-in paragraph. Production tokenizers learn 50,000 to 200,000 tokens from very large
        datasets, so they split text differently and use different IDs.
      </SimulationNotice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="tokenizer-input" className="text-xs font-medium text-slate-600">
                Type or paste any text
              </label>
              {text && (
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={14} aria-hidden="true" /> Clear
                </button>
              )}
            </div>
            <textarea
              id="tokenizer-input"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              rows={3}
              maxLength={MAX_INPUT}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSelected(0);
              }}
              placeholder="Try common words, rare words, numbers, accents or an emoji"
            />

            <p className="mb-2 mt-4 text-xs font-medium text-slate-600" id="token-list-label">
              Tokens <span className="font-normal text-slate-400">(select one to inspect it)</span>
            </p>
            <div
              className="flex min-h-20 flex-wrap items-start gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3"
              role="group"
              aria-labelledby="token-list-label"
            >
              {tokens.length === 0 ? (
                <span className="text-sm text-slate-400">Type something above to see its tokens.</span>
              ) : (
                tokens.map((token, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelected(idx)}
                    aria-pressed={idx === currentIdx}
                    aria-label={`Token ${idx + 1}: "${token.text}", ID ${token.id}`}
                    className={`rounded border px-1.5 py-0.5 font-mono text-sm transition-shadow ${
                      TOKEN_TINTS[idx % TOKEN_TINTS.length]
                    } ${idx === currentIdx ? "ring-2 ring-indigo-600 ring-offset-1" : "hover:shadow-sm"}`}
                  >
                    {visible(token.text)}
                  </button>
                ))
              )}
            </div>
          </Card>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Characters", [...text].length],
              ["UTF-8 bytes", byteCount],
              ["Tokens", tokens.length],
              ["Chars / token", tokens.length ? ([...text].length / tokens.length).toFixed(1) : "0"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardTitle icon={<Cpu size={16} className="text-indigo-600" aria-hidden="true" />}>Token inspector</CardTitle>
            {current ? (
              <dl className="space-y-3 text-sm" aria-live="polite">
                <div>
                  <dt className="text-xs text-slate-500">Text</dt>
                  <dd className="font-mono text-base font-semibold text-slate-900">
                    &ldquo;{visible(current.text)}&rdquo;
                    {current.text.startsWith(" ") && (
                      <span className="ml-2 font-sans text-xs font-normal text-slate-500">includes a leading space</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Token ID (in this demo vocabulary)</dt>
                  <dd className="font-mono font-semibold text-indigo-700">{current.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">UTF-8 bytes (hex)</dt>
                  <dd className="break-all font-mono text-slate-700">{formatBytes(current.bytes)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Origin</dt>
                  <dd className="text-slate-700">
                    {merge ? (
                      <>
                        Learned merge #{current.id - 256 + 1}:{" "}
                        <code className="rounded bg-slate-100 px-1 font-mono">{visible(vocabText(model, merge[0]))}</code> +{" "}
                        <code className="rounded bg-slate-100 px-1 font-mono">{visible(vocabText(model, merge[1]))}</code>
                      </>
                    ) : (
                      "One of the 256 base byte tokens (no merge covered it)."
                    )}
                  </dd>
                </div>
                <p className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                  Next, the model uses this ID as a row index into its embedding matrix (chapter 2).
                </p>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Select a token to see its ID, bytes and how it was formed.</p>
            )}
          </Card>

          <Card>
            <CardTitle icon={<Layers size={16} className="text-indigo-600" aria-hidden="true" />}>
              First merges this tokenizer learned
            </CardTitle>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-slate-700">
              {model.merges.slice(0, 10).map(([a, b], i) => (
                <li key={i}>
                  <span className="text-slate-400">{i + 1}.</span> {visible(vocabText(model, a))} +{" "}
                  {visible(vocabText(model, b))} → {visible(vocabText(model, 256 + i))}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {model.merges.length} merges were learned in total. Frequent words end up as single tokens; rare words
              are built from several pieces, and unseen characters fall back to raw bytes, so any text can be encoded.
            </p>
          </Card>

          <Card className="bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Why sub-words?</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
              <li>
                <strong className="font-medium text-slate-800">Characters only:</strong> a tiny vocabulary, but
                sequences become very long and slow to process.
              </li>
              <li>
                <strong className="font-medium text-slate-800">Whole words only:</strong> the vocabulary explodes and
                new names, typos or slang cannot be represented.
              </li>
              <li>
                <strong className="font-medium text-slate-800">Sub-words:</strong> common words stay whole, rare ones
                are assembled from familiar pieces. Short sequences, bounded vocabulary.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
