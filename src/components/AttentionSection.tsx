/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Network, Info, Check, HelpCircle, Eye } from "lucide-react";

interface SentencePreset {
  id: number;
  label: string;
  sentence: string[];
  // Mapping of word-to-word attention weights of interest
  // index-to-index weighting dictionary
  weights: Record<number, Record<number, number>>;
  ambiguousWordIndex: number;
  insight: string;
}

const PRESETS: SentencePreset[] = [
  {
    id: 1,
    label: "River Bank Context",
    sentence: ["The", "bank", "of", "the", "winding", "river", "had", "green", "moss."],
    ambiguousWordIndex: 1, // bank
    weights: {
      1: { 0: 0.05, 1: 0.3, 2: 0.1, 3: 0.05, 4: 0.1, 5: 0.45, 6: 0.05, 7: 0.05, 8: 0.05 }, // "bank" attends heavily to "river"
      5: { 0: 0.05, 1: 0.5, 2: 0.1, 3: 0.05, 4: 0.15, 5: 0.1, 6: 0.05, 7: 0.05, 8: 0.05 }, // "river" attends heavily back to "bank"
    },
    insight: "The word 'bank' concentrates heavy attention (45%) on 'river'. This makes the LLM fetch coordinates associated with geographical landmarks instead of money!",
  },
  {
    id: 2,
    label: "Financial Bank Context",
    sentence: ["The", "bank", "was", "closed", "to", "protect", "assets", "and", "money."],
    ambiguousWordIndex: 1, // bank
    weights: {
      1: { 0: 0.05, 1: 0.25, 2: 0.05, 3: 0.15, 4: 0.05, 5: 0.1, 6: 0.15, 7: 0.05, 8: 0.35 }, // "bank" attends heavily to "money" and "closed"
      8: { 0: 0.05, 1: 0.4, 2: 0.05, 3: 0.1, 4: 0.05, 5: 0.15, 6: 0.15, 7: 0.05, 8: 0.15 }, // "money" attends heavily to "bank"
    },
    insight: "Here, 'bank' focuses its attention heavily on 'money' (35%) and 'closed' (15%). This pulls the meaning of 'bank' towards retail safehouses and monetary balances.",
  },
  {
    id: 3,
    label: "Dog Bark Context",
    sentence: ["The", "dog", "let", "out", "a", "harsh", "bark", "at", "the", "mailman."],
    ambiguousWordIndex: 6, // bark
    weights: {
      6: { 0: 0.02, 1: 0.45, 2: 0.05, 3: 0.05, 4: 0.01, 5: 0.1, 6: 0.2, 7: 0.02, 8: 0.02, 9: 0.13 }, // "bark" attends heavily to "dog"
      1: { 0: 0.05, 1: 0.2, 2: 0.05, 3: 0.05, 4: 0.05, 5: 0.05, 6: 0.45, 7: 0.05, 8: 0.05, 9: 0.15 }, // "dog" attends to "bark"
    },
    insight: "The word 'bark' focuses 45% of its structural attention weight on 'dog', helping the neural transformer parse this word as a vocalization rather than wood.",
  },
  {
    id: 4,
    label: "Tree Bark Context",
    sentence: ["We", "scra", "ped", "rough", "bark", "of", "the", "old", "pine", "tree."],
    ambiguousWordIndex: 4, // bark
    weights: {
      4: { 0: 0.02, 1: 0.08, 2: 0.02, 3: 0.15, 4: 0.2, 5: 0.03, 6: 0.02, 7: 0.05, 8: 0.05, 9: 0.42 }, // "bark" attends heavily to "tree"
      9: { 0: 0.02, 1: 0.05, 2: 0.02, 3: 0.05, 4: 0.5, 5: 0.02, 6: 0.02, 7: 0.1, 8: 0.1, 9: 0.15 }, // "tree" attends back to "bark"
    },
    insight: "The model maps 'bark' directly to 'tree' (42%) and 'rough' (15%). Attention links these tokens, mapping 'bark' as a protective biological surface.",
  },
];

export default function AttentionSection() {
  const [selectedPresetId, setSelectedPresetId] = useState<number>(1);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(1);

  const preset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Retrieve attention weights for the currently active word, or fallback to default
  const activeWeights = preset.weights[activeWordIdx] || preset.weights[preset.ambiguousWordIndex] || {};

  return (
    <div className="space-y-8" id="attention-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider font-mono">
          Step 03 / Context Understanding
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          Self-Attention: Reading Words in Context
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          Before 2017, machines translated text word-by-word, missing the big picture. Now, the **Transformer neural architecture** uses **Self-Attention** to calculate connections between every word in a sentence simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Controls and Presets Selector */}
        <div className="lg:col-span-4 space-y-4">
          <span className="block text-xs font-bold text-gray-400 font-mono uppercase tracking-wide">
            Select an Ambiguity Scenario
          </span>

          <div className="flex flex-col gap-2">
            {PRESETS.map((p) => {
              const isSelected = p.id === selectedPresetId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPresetId(p.id);
                    setActiveWordIdx(p.ambiguousWordIndex);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl border text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm font-medium scale-[1.01]"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
                  }`}
                >
                  <span className="font-sans font-semibold tracking-tight">{p.label}</span>
                  {isSelected ? (
                    <Check size={16} className="text-white bg-blue-600 rounded-full p-0.5" />
                  ) : (
                    <span className="text-[10px] font-mono opacity-60">Try preset</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-5 border border-blue-100/50 dark:border-blue-950/50">
            <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
              <Eye size={14} className="text-blue-500 animate-pulse" /> Try Hovering!
            </h4>
            <p className="text-xs text-gray-750 dark:text-gray-300 leading-relaxed">
              In the diagram, **hover or click on any word** in the sentence. Watch how the attention bonds instantly realign to reveal which nouns, verbs, or adjectives are shaping that word&apos;s contextual storage!
            </p>
          </div>
        </div>

        {/* Right column: Interactive Visual Link Web Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 font-sans flex items-center gap-2">
                <Network size={16} className="text-blue-500" />
                Live Context Matrix Visualization
              </h3>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                Attention Head #5
              </span>
            </div>

            {/* Interactive link nodes diagram */}
            <div className="py-6 flex flex-col items-center justify-center space-y-12 relative overflow-hidden min-h-[220px]">
              {/* Words row */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 select-none relative z-10 w-full px-4">
                {preset.sentence.map((word, idx) => {
                  const isActive = activeWordIdx === idx;
                  const weight = activeWeights[idx] || 0;
                  const isAmbig = idx === preset.ambiguousWordIndex;

                  // Compute dynamic intensity backgrounds based on attention weights when another word is hovered
                  let intensityClass = "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
                  if (isActive) {
                    intensityClass = "bg-blue-500 text-white border-blue-600 shadow-md font-bold scale-105";
                  } else if (weight > 0.3) {
                    intensityClass = "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800/80 font-semibold";
                  } else if (weight > 0.1) {
                    intensityClass = "bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-900/40";
                  }

                  return (
                    <button
                      key={`${word}-${idx}`}
                      onMouseEnter={() => {
                        // Let users hover any word that has defined weights, or fallback to the ambiguous word
                        if (preset.weights[idx]) {
                          setActiveWordIdx(idx);
                        }
                      }}
                      onClick={() => {
                        if (preset.weights[idx]) {
                          setActiveWordIdx(idx);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer relative ${intensityClass}`}
                    >
                      <span>{word}</span>
                      {/* Ambiguous Word Star Pin indicator */}
                      {isAmbig && !isActive && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full uppercase scale-90">
                          target
                        </span>
                      )}
                      
                      {/* Percent indicator */}
                      {!isActive && weight > 0 && (
                        <span className="block text-[9px] text-center font-mono opacity-80 mt-0.5">
                          {(weight * 100).toFixed(0)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Laser Lines / Curved Svg bonds backing overlay */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* For simplicity we draw lines between the active index and other indices.
                      We map indices roughly across the 600 width. */}
                  {preset.sentence.map((_, idx) => {
                    const weight = activeWeights[idx] || 0;
                    if (idx === activeWordIdx || weight < 0.03) return null;

                    // Grid points mapping math
                    const segments = preset.sentence.length;
                    const xStart = 50 + (activeWordIdx / (segments - 1)) * 500;
                    const xEnd = 50 + (idx / (segments - 1)) * 500;
                    const yLevel = 100; // Middle row alignment height

                    // Curved quadratic bezier representation
                    const ctrlX = (xStart + xEnd) / 2;
                    const ctrlY = yLevel - (Math.abs(xStart - xEnd) * 0.4); // higher arc for longer distances

                    return (
                      <g key={`path-${idx}`}>
                        <path
                          d={`M ${xStart} ${yLevel} Q ${ctrlX} ${ctrlY} ${xEnd} ${yLevel}`}
                          stroke="#3b82f6"
                          strokeWidth={weight * 12} // thicker line for more weight focus strength
                          strokeOpacity={weight + 0.15}
                          fill="none"
                          className="transition-all duration-300"
                        />
                        {/* Moving particles animation along paths if attention is heavy */}
                        {weight > 0.15 && (
                          <circle r="2.5" fill="#1d4ed8">
                            <animateMotion
                              path={`M ${xStart} ${yLevel} Q ${ctrlX} ${ctrlY} ${xEnd} ${yLevel}`}
                              dur={`${2.2 - (weight * 2.1)}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Explanation box */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPresetId + "-insight-" + activeWordIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-900 flex items-start gap-3"
                >
                  <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase font-mono tracking-wider mb-1">
                      Active Brain Link: &quot;{preset.sentence[activeWordIdx]}&quot; Attention Context
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                      {preset.insight}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Quick takeaway summary card */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2.5 leading-relaxed">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 bg-white dark:bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center border border-blue-200">
              💡
            </span>
            <span>
              <strong>Takeaway:</strong> Self-attention reads words by linking them to relevant partners. A model learns to translate, summarize, and code because it tracks how every word relates to its grammatical surroundings!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
