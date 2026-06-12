/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareCode, Layers, Info, RotateCcw, Cpu } from "lucide-react";
import { TokenUnit } from "../types";

// Palette for consistent visual token highlight blocks
const HIGHLIGHT_COLORS = [
  "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50",
  "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900/50",
  "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50",
  "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-900/50",
  "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-900/50",
  "bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-900/50",
];

// Simple hashing-based deterministic token ID generator to make it realistic
const generateTokenId = (text: string): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 98000) + 101; // real LLM vocabs range up to ~100k
};

// Convert string snippet to hex byte representation
const getBytesString = (text: string): string => {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => "0x" + b.toString(16).toUpperCase())
    .join(" ");
};

// Simple pseudo BPE tokenizer logic that cuts words sensibly
const simulateTokenizer = (inputText: string): TokenUnit[] => {
  if (!inputText) return [];

  // Match words, spaces, punctuations, and split them logically
  const regex = /([A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+|[^\s\w]|\s+)/g;
  const matches = inputText.match(regex) || [inputText];

  const tokens: TokenUnit[] = [];
  let colorIdx = 0;

  matches.forEach((part) => {
    // If the part is long (e.g. over 6 chars), let's split it into subwords to demonstrate subword tokenization
    if (part.trim().length > 6 && !/\s/.test(part)) {
      const mid = Math.ceil(part.length / 2);
      const sub1 = part.substring(0, mid);
      const sub2 = part.substring(mid);

      tokens.push({
        id: generateTokenId(sub1),
        text: sub1,
        color: HIGHLIGHT_COLORS[colorIdx % HIGHLIGHT_COLORS.length],
        bytes: getBytesString(sub1),
      });
      colorIdx++;

      tokens.push({
        id: generateTokenId(sub2),
        text: sub2,
        color: HIGHLIGHT_COLORS[colorIdx % HIGHLIGHT_COLORS.length],
        bytes: getBytesString(sub2),
      });
      colorIdx++;
    } else {
      tokens.push({
        id: generateTokenId(part),
        text: part,
        color: HIGHLIGHT_COLORS[colorIdx % HIGHLIGHT_COLORS.length],
        bytes: getBytesString(part),
      });
      colorIdx++;
    }
  });

  return tokens;
};

export default function TokenizerSection() {
  const [text, setText] = useState<string>(
    "Tokenization is simple! Even outstanding words get split."
  );
  const [tokens, setTokens] = useState<TokenUnit[]>([]);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);

  useEffect(() => {
    const simulated = simulateTokenizer(text);
    setTokens(simulated);
    // Auto-select the first token if valid
    if (simulated.length > 0) {
      setSelectedTokenIdx(0);
    } else {
      setSelectedTokenIdx(null);
    }
  }, [text]);

  const totalChars = text.length;
  const totalTokens = tokens.length;
  // Standard metric: 100 tokens ~ 75 words
  const averageWordLength = totalTokens > 0 ? (totalChars / totalTokens).toFixed(1) : "0";

  return (
    <div className="space-y-8" id="tokenizer-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider font-mono">
          Step 01 / Input & Translation
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          Tokenization: How Computers Read
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          Computers do not think in English letters or words. Large Language Models begin by chopping your
          typed text into small fractional pieces called <strong>tokens</strong>, then assigning each token a numerical ID from a giant look-up dictionary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Playground controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-sm relative">
            <label className="block text-xs font-semibold tracking-wide text-gray-400 font-mono uppercase mb-2">
              Write Anything to see BPE Tokenization
            </label>
            <textarea
              className="w-full text-sm p-4 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-gray-400 transition-all font-sans resize-y"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing some words, symbols (like 🔥), or extremelylongwords..."
            />
            {text && (
              <button
                onClick={() => setText("")}
                className="absolute top-12 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                title="Clear Text"
              >
                <RotateCcw size={16} />
              </button>
            )}

            {/* Simulated Live visualizer bubble */}
            <div className="mt-4">
              <span className="block text-xs font-semibold tracking-wide text-gray-400 font-mono uppercase mb-2">
                Live Document Chunks (Tokenized View)
              </span>
              <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200/80 dark:border-gray-800 min-h-[5rem] flex flex-wrap gap-1 leading-relaxed items-center select-none">
                {tokens.length === 0 ? (
                  <span className="text-gray-400 text-xs italic">Type something above to see tokens...</span>
                ) : (
                  tokens.map((token, idx) => (
                    <motion.span
                      layout
                      key={`${token.id}-${idx}`}
                      onClick={() => setSelectedTokenIdx(idx)}
                      className={`inline-block px-1.5 py-0.5 rounded text-sm cursor-pointer border transition-all ${
                        token.color
                      } ${
                        selectedTokenIdx === idx
                          ? "ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-gray-950 scale-105 font-medium"
                          : "opacity-90 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      {token.text.replace(/ /g, "␣")}
                    </motion.span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/80 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Characters</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200 font-sans">{totalChars}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/80 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Tokens</span>
              <span className="text-lg font-bold text-rose-500 font-sans">{totalTokens}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/80 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Char / Token</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200 font-sans">{averageWordLength}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual inspect panel & quick theory explainer */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between space-y-6">
          {/* Diagnostic Inspector */}
          <div className="bg-gray-900 text-gray-100 rounded-xl p-5 border border-gray-800 shadow-lg font-mono text-xs flex-1 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
                <Cpu size={14} className="text-rose-400 animate-pulse" />
                <span className="uppercase text-[10px] tracking-wider text-gray-400 font-bold">
                  Token Metadata Inspector
                </span>
              </div>

              <AnimatePresence mode="wait">
                {selectedTokenIdx !== null && tokens[selectedTokenIdx] ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div>
                      <span className="text-gray-500 block">Original String Segment:</span>
                      <span className="text-sm text-rose-400 font-bold">
                        &quot;{tokens[selectedTokenIdx].text}&quot;
                        {tokens[selectedTokenIdx].text.startsWith(" ") && (
                          <span className="text-xs text-gray-500 font-light ml-2">
                            (Includes leading space)
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Assigned Numerical ID:</span>
                      <span className="text-sm text-emerald-400 font-bold">
                        {tokens[selectedTokenIdx].id}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Hexadecimal Bytes:</span>
                      <span className="text-xs text-cyan-400 select-all font-mono leading-relaxed">
                        {tokens[selectedTokenIdx].bytes}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-800 mt-2 text-[11px] text-gray-400 leading-normal flex items-start gap-1.5">
                      <Info size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        The model retrieves vector data matching ID{" "}
                        <span className="text-emerald-400 font-bold">{tokens[selectedTokenIdx].id}</span> in
                        the embedding matrix next!
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Click a colored token chunk to inspect its internal properties.
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-gray-800 pt-3 mt-4 text-[10px] text-gray-500 flex justify-between">
              <span>VOCAB SIZE: 100,000</span>
              <span>COMPRESSION RATIO: ~0.78</span>
            </div>
          </div>

          {/* Key theory card */}
          <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-xl p-5 border border-rose-100/50 dark:border-rose-950/50">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
              <Layers size={14} /> The Magic Trade-off
            </h4>
            <ul className="text-xs space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>
                <strong>All Characters?</strong> Too granular. Writing &quot;hello&quot; takes 5 operations.
                Memory limit overflows quickly.
              </li>
              <li>
                <strong>All Words?</strong> Too bloated. There are infinite words, names, and slang. The model
                dictionary would grow to millions and run out of memory.
              </li>
              <li>
                <strong>Subword compromise:</strong> Uncommon words (like <em>outstanding</em>) get chopped
                into familiar fragments (<em>out-standing</em>). That way, standard roots can represent any
                English prompt!
              </li>
              <li>
                <strong>Byte-Pair Encoding (BPE) deep-dive:</strong> Tokenizers are trained, not hardcoded. They start with a library of single letters/digits and iteratively discover and merge the most common sequential byte pairs (for instance, merging 't' + 'h' into 'th', then 'th' + 'e' into 'the') until reaching a set target vocabulary size. This combines computational execution speed with maximum grammatical flexibility!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
