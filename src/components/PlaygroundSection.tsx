/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, RefreshCw, Sparkles, HelpCircle, ShieldAlert } from "lucide-react";

interface PredictOption {
  token: string;
  baseProb: number; // raw likelihood (0 to 1)
  finalProb: number; // calculated prob after temperature
  isKept?: boolean;
}

interface PromptPreset {
  id: number;
  prompt: string;
  candidates: { token: string; baseProb: number }[];
  fillerCandidates: { token: string; baseProb: number }[];
}

const PROMPTS: PromptPreset[] = [
  {
    id: 1,
    prompt: "Once upon a time, in a far away",
    candidates: [
      { token: "kingdom", baseProb: 0.45 },
      { token: "land", baseProb: 0.25 },
      { token: "galaxy", baseProb: 0.15 },
      { token: "forest", baseProb: 0.1 },
      { token: "continent", baseProb: 0.05 },
    ],
    fillerCandidates: [
      { token: "sandwich", baseProb: 0.005 },
      { token: "refrigerator", baseProb: 0.003 },
      { token: "taxpayer", baseProb: 0.002 },
    ],
  },
  {
    id: 2,
    prompt: "The quick brown fox jumps over",
    candidates: [
      { token: "the", baseProb: 0.65 },
      { token: "a", baseProb: 0.18 },
      { token: "some", baseProb: 0.08 },
      { token: "each", baseProb: 0.06 },
      { token: "ten", baseProb: 0.03 },
    ],
    fillerCandidates: [
      { token: "aerated", baseProb: 0.004 },
      { token: "computational", baseProb: 0.003 },
      { token: "bacon", baseProb: 0.003 },
    ],
  },
  {
    id: 3,
    prompt: "Artificial Intelligence will drastically change the",
    candidates: [
      { token: "future", baseProb: 0.42 },
      { token: "world", baseProb: 0.28 },
      { token: "economy", baseProb: 0.16 },
      { token: "classroom", baseProb: 0.09 },
      { token: "refrigerator", baseProb: 0.05 },
    ],
    fillerCandidates: [
      { token: "pineapple", baseProb: 0.004 },
      { token: "toothpaste", baseProb: 0.004 },
      { token: "socks", baseProb: 0.002 },
    ],
  },
];

export default function PlaygroundSection() {
  const [selectedPromptId, setSelectedPromptId] = useState<number>(1);
  const [currentText, setCurrentText] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7); // 0.1 to 2.0
  const [topP, setTopP] = useState<number>(0.9); // 0.1 to 1.0
  const [calculatedList, setCalculatedList] = useState<PredictOption[]>([]);
  const [historyTokens, setHistoryTokens] = useState<string[]>([]);

  const activePreset = PROMPTS.find((p) => p.id === selectedPromptId) || PROMPTS[0];

  // Initialize and reset history
  useEffect(() => {
    setCurrentText(activePreset.prompt);
    setHistoryTokens([]);
  }, [selectedPromptId]);

  // Recalculate probabilities based on Temperate and Top P
  useEffect(() => {
    // 1. Temperature algorithm simulation.
    // Standard Softmax scaling: exp(log(p_i) / T) / sum(exp(log(p_j) / T))
    const tempSafe = Math.max(0.1, temperature);

    // Grab all options
    const allRaw = [...activePreset.candidates, ...activePreset.fillerCandidates];

    // Calculate logs, scale by temp, then exponentiate
    const exponentiated = allRaw.map((cand) => {
      // guard ln calculation
      const logP = Math.log(cand.baseProb);
      const scaledLogP = logP / tempSafe;
      const finalExp = Math.exp(scaledLogP);
      return { token: cand.token, finalExp };
    });

    const sumExp = exponentiated.reduce((sum, item) => sum + item.finalExp, 0);

    const calculatedListRaw = exponentiated.map((item) => {
      const parent = allRaw.find((c) => c.token === item.token)!;
      return {
        token: item.token,
        baseProb: parent.baseProb,
        finalProb: item.finalExp / sumExp,
      };
    });

    // Sort by final probability decreasing
    calculatedListRaw.sort((a, b) => b.finalProb - a.finalProb);

    // 2. Apply Top P (Nucleus Sampling) Filter
    // Walk down the sorted list, take cumulative sum, flag anything exceeding cumulative threshold
    let cumulativeSum = 0;
    const finalFiltered = calculatedListRaw.map((item) => {
      const itemSumBefore = cumulativeSum;
      cumulativeSum += item.finalProb;

      // Special visual flag: is this word kept in Top-P basket?
      // Usually we keep items whose sum *before* inclusion is less than Top-P
      const isKept = itemSumBefore < topP;

      return {
        ...item,
        isKept,
      };
    });

    setCalculatedList(finalFiltered);
  }, [temperature, topP, selectedPromptId, currentText]);

  // Helper trigger to physically sample and write the next token
  const handleGenerateNextToken = () => {
    // Collect options that passed Top P selection filter, or fallback to top options if empty
    const choices = calculatedList.filter((item) => item.isKept);
    const validChoices = choices.length > 0 ? choices : [calculatedList[0]];

    // Run weighted pick simulation
    const totalMass = validChoices.reduce((sum, item) => sum + item.finalProb, 0);
    const randomPick = Math.random() * totalMass;

    let rollingMass = 0;
    let selectedToken = validChoices[0].token;

    for (const choice of validChoices) {
      rollingMass += choice.finalProb;
      if (randomPick <= rollingMass) {
        selectedToken = choice.token;
        break;
      }
    }

    // Append to current document
    setCurrentText((prev) => `${prev}  ${selectedToken}`);
    setHistoryTokens((prev) => [...prev, selectedToken]);
  };

  const handleReset = () => {
    setCurrentText(activePreset.prompt);
    setHistoryTokens([]);
  };

  return (
    <div className="space-y-8" id="playground-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider font-mono">
          Step 04 / Text Generation Engine
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          The Autocomplete Engine: Sampling Next Tokens
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          At their core, LLMs are ultra-advanced **completers**. They do not read or plan. Instead, they examine the historical text, calculate the mathematical probability for every possible word on the internet, and roll a weighted dice to pick the very next chunk!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Sliders & Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-150 dark:border-gray-850 pb-3">
            <Sliders size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 font-sans">
              Generation Parameters
            </h3>
          </div>

          {/* Prompt choosing templates */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase tracking-wide">
              Starting Prompt Scenario
            </label>
            <div className="flex flex-col gap-1.5">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPromptId(p.id)}
                  className={`text-left text-xs py-2.5 px-3 rounded-lg border transition-all ${
                    p.id === selectedPromptId
                      ? "bg-amber-500 text-white border-amber-600 font-medium"
                      : "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-150 dark:border-gray-850/60 hover:bg-gray-100"
                  }`}
                >
                  &quot;{p.prompt}...&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase tracking-wide">
                Temperature (Randomness)
              </label>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                T: {temperature.toFixed(1)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
              **Low** (0.1) makes predictions strict, dry, and highly factual. **High** (1.5+) stretches the distribution, making results highly creative or unpredictable slang.
            </p>
            <input
              type="range"
              min="0.1"
              max="1.8"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-mono">
              <span>0.1 (Strict Truth)</span>
              <span>1.0 (Default Balanced)</span>
              <span>1.8 (Creative Chaos)</span>
            </div>
          </div>

          {/* Top-P Slider */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase tracking-wide">
                Top P (Nucleus Cutoff)
              </label>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                P: {topP.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
              Truncates selection to only the top candidate tokens adding up to **P%** cumulative probability. Prevents gibberish or typo tokens from slipping in.
            </p>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-mono">
              <span>0.2 (Only Top Best)</span>
              <span>0.9 (Standard Guard)</span>
              <span>1.0 (Take Everything)</span>
            </div>
          </div>
        </div>

        {/* Right pane: Document Canvas & Interactive Probability Wheel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Output Document Writing Stage */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
            <span className="block text-[10px] font-bold tracking-widest text-amber-400 font-mono uppercase">
              Terminal Writer Outputs
            </span>

            <div className="min-h-[100px] overflow-y-auto bg-black rounded-lg p-4 font-mono text-xs md:text-sm text-gray-300 border border-gray-850 leading-relaxed max-h-[150px]">
              <span className="text-gray-500">{activePreset.prompt}</span>
              {historyTokens.length > 0 && (
                <span className="text-amber-400 font-bold ml-1">
                  {historyTokens.map((t, i) => (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={`${t}-${i}`}
                      className="inline-block mr-1.5 bg-amber-950/30 px-1 rounded border border-amber-900/30"
                    >
                      {t}
                    </motion.span>
                  ))}
                </span>
              )}
              <span className="inline-block ml-1 w-2 h-4 bg-amber-400 animate-ping" />
            </div>

            {/* Triggers */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerateNextToken}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles size={16} /> 🎲 Roll Prob & Generate Next Token
              </button>
              <button
                onClick={handleReset}
                title="Restart Prompt"
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Probability options visual bar graph */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 font-sans">
            <h4 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
              <span>Next Candidate Probability Matrix</span>
              <span className="text-[9px] font-mono font-normal tracking-normal text-gray-400 flex items-center gap-1">
                <HelpCircle size={10} strokeWidth={3} /> Expands list dynamically
              </span>
            </h4>

            <div className="space-y-3">
              {calculatedList.map((cand, idx) => {
                const isKept = cand.isKept;
                const percentage = (cand.finalProb * 100).toFixed(1);
                const rawPercentage = (cand.baseProb * 100).toFixed(1);

                return (
                  <div
                    key={`${cand.token}-${idx}`}
                    className={`flex items-center gap-3 py-1.5 px-3 rounded-lg border transition-all ${
                      isKept
                        ? "bg-gray-50/50 dark:bg-gray-950/20 border-gray-100 dark:border-gray-850"
                        : "bg-red-50/10 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/10 opacity-40 line-through select-none"
                    }`}
                  >
                    {/* Token bubble */}
                    <span className="w-24 font-mono text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      &quot;{cand.token}&quot;
                    </span>

                    {/* Bar visual representation */}
                    <div className="flex-1 h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative">
                      <motion.div
                        layout
                        className={`h-full rounded-md transition-all duration-300 ${
                          isKept
                            ? idx === 0
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : "bg-gradient-to-r from-amber-300/80 to-amber-400/80"
                            : "bg-gray-300 dark:bg-gray-750"
                        }`}
                        style={{ width: `${parseFloat(percentage)}%` }}
                      />
                    </div>

                    {/* Percent Text value */}
                    <div className="w-16 text-right font-mono text-[11px] font-bold">
                      <span className="text-gray-800 dark:text-gray-200">{percentage}%</span>
                    </div>

                    {/* Status Badge */}
                    <div className="w-14 text-right">
                      {isKept ? (
                        <span className="inline-block text-[9px] uppercase font-bold tracking-wide text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">
                          Valid
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] uppercase font-bold tracking-wide text-red-500 bg-red-50 dark:bg-red-950/30 px-1 py-0.5 rounded">
                          Cutoff
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cutoff alerts */}
            {calculatedList.some((c) => !c.isKept) && (
              <div className="bg-amber-50/30 dark:bg-amber-950/10 rounded-lg p-3 text-[11px] text-gray-500 dark:text-gray-400 border border-amber-100/40 flex items-start gap-2">
                <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Top P Cutoff Active:</strong> Tokens grayed out above were filtered out because the cumulative sum of candidate probabilities exceeded your current threshold of **{(topP * 100).toFixed(0)}%**. This keeps the output sharp and readable!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
