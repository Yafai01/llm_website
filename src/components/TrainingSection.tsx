/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, ThumbsUp, ThumbsDown, Sparkles, Trophy, RefreshCw } from "lucide-react";

interface AlignScenario {
  id: number;
  prompt: string;
  responseA: string;
  responseB: string;
  preferred: "A" | "B";
  feedbackReason: string;
}

const SCENARIOS: AlignScenario[] = [
  {
    id: 1,
    prompt: "Write a message apologizing for arriving late to a project sync.",
    responseA: "Sync late. Stuck. Sorry.",
    responseB: "Hi team, my apologies but I am currently running 10 minutes behind due to public transit delays. Please feel free to start without me!",
    preferred: "B",
    feedbackReason: "Response B is professional, polite, and provides an actionable update. Response A is too brief and feels rude.",
  },
  {
    id: 2,
    prompt: "How do I make a simple homemade volcano?",
    responseA: "Buy highly explosive TNT and place it in your living room, then detonate with a safety fuse for a massive explosion.",
    responseB: "You can create a safe baking soda volcano! Mix warm water, dish soap, red food coloring, and baking soda inside a plastic bottle container, then pour in vinegar to trigger a foaming eruption.",
    preferred: "B",
    feedbackReason: "Response B is educational and totally safe. Response A is highly dangerous and malicious, and is suppressed by safety RLHF alignment filters.",
  },
  {
    id: 3,
    prompt: "Draft a polite reminder to a client who hasn't paid their invoice yet.",
    responseA: "GIVE ME MY MONEY NOW OR I WILL SUE YOU IMMEDIATELY SINCERELY YOURS.",
    responseB: "Dear client, I hope you are having a wonderful week. This is a quick friendly reminder that invoice #204 is now outstanding. We would appreciate it if you could review this payment at your earliest convenience.",
    preferred: "B",
    feedbackReason: "Response B is professional and maintains a strong business relationship. Response A is hostile and unprofessional.",
  },
];

export default function TrainingSection() {
  const [activeStage, setActiveStage] = useState<"pretrain" | "finetune" | "rlhf">("pretrain");
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [votedChoice, setVotedChoice] = useState<"A" | "B" | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const scenario = SCENARIOS[scenarioIdx];

  const handleVote = (choice: "A" | "B") => {
    setVotedChoice(choice);
    setShowResult(true);
    if (choice === scenario.preferred) {
      setGameScore((score) => score + 1);
    }
  };

  const handleNextScenario = () => {
    setVotedChoice(null);
    setShowResult(false);
    setScenarioIdx((idx) => (idx + 1) % SCENARIOS.length);
  };

  const handleResetGame = () => {
    setVotedChoice(null);
    setShowResult(false);
    setScenarioIdx(0);
    setGameScore(0);
  };

  return (
    <div className="space-y-8" id="training-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider font-mono">
          Step 05 / Model Alignment
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          Machine School: How Models Learn
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          How do we take a system that only predicts autocomplete strings and turn it into a helpful, obedient, and highly customized assistant? We put it through three rigorous stages of educational training!
        </p>
      </div>

      {/* Tabs navigation for education pipeline */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveStage("pretrain")}
          className={`py-3 px-2 md:px-4 rounded-xl border text-center transition-all ${
            activeStage === "pretrain"
              ? "bg-violet-500 hover:bg-violet-600 border-violet-500 text-white shadow-sm font-semibold scale-[1.01]"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
          }`}
        >
          <span className="block text-xs font-mono mb-1">STAGES 01</span>
          <span className="text-xs md:text-sm tracking-tight block">1. Pre-training</span>
        </button>

        <button
          onClick={() => setActiveStage("finetune")}
          className={`py-3 px-2 md:px-4 rounded-xl border text-center transition-all ${
            activeStage === "finetune"
              ? "bg-violet-500 hover:bg-violet-600 border-violet-500 text-white shadow-sm font-semibold scale-[1.01]"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
          }`}
        >
          <span className="block text-xs font-mono mb-1">STAGES 02</span>
          <span className="text-xs md:text-sm tracking-tight block">2. Fine-Tuning</span>
        </button>

        <button
          onClick={() => setActiveStage("rlhf")}
          className={`py-3 px-2 md:px-4 rounded-xl border text-center transition-all ${
            activeStage === "rlhf"
              ? "bg-violet-500 hover:bg-violet-600 border-violet-500 text-white shadow-sm font-semibold scale-[1.01]"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
          }`}
        >
          <span className="block text-xs font-mono mb-1">STAGES 03</span>
          <span className="text-xs md:text-sm tracking-tight block">3. Safety & RLHF</span>
        </button>
      </div>

      {/* Explanatory cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left side: educational context */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
          <AnimatePresence mode="wait">
            {activeStage === "pretrain" && (
              <motion.div
                key="pretrain"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <GraduationCap className="text-violet-500" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 font-sans">
                    Pre-training: Reading the Whole Web
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Imagine downloading the entire public internet, scanning through trillions of texts, papers, blocks of code, and novels, and forcing a neural network to make sense of standard sentence structure.
                </p>
                <div className="bg-violet-50/40 dark:bg-violet-950/20 p-4 rounded-xl text-xs space-y-2 text-violet-950 dark:text-violet-300">
                  <p><strong>Goal:</strong> Teach the engine standard grammar, general knowledge, math operations, and coding syntax.</p>
                  <p><strong>Cost & Time:</strong> Thousands of expensive super-GPU computer clusters running non-stop for months, consuming millions of dollars.</p>
                  <p><strong>Result:</strong> An advanced autocomplete engine, but highly chaotic! If you write &quot;Do you have a pen&quot;, it might respond with &quot;...in your desk or my pocket?&quot; instead of answering directly.</p>
                </div>
              </motion.div>
            )}

            {activeStage === "finetune" && (
              <motion.div
                key="finetune"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <GraduationCap className="text-violet-500" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 font-sans">
                    Supervised Fine-Tuning (SFT): Learning to Follow Orders
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  After reading the internet, the model has the intelligence, but has no discipline. In fine-tuning, cognitive engineers give the model thousands of beautifully formatted **Prompt / Answer** instruction scripts.
                </p>
                <div className="bg-violet-50/40 dark:bg-violet-950/20 p-4 rounded-xl text-xs space-y-2 text-violet-950 dark:text-violet-300">
                  <p><strong>The Script Format:</strong></p>
                  <div className="bg-white dark:bg-black p-2.5 rounded border border-gray-100 dark:border-gray-900 font-mono text-[10px] text-gray-700 dark:text-gray-400 space-y-1">
                    <p className="text-rose-500">&gt; Q: Translate this sentence to French...</p>
                    <p className="text-emerald-500">&gt; A: Bonjour tout le monde!</p>
                  </div>
                  <p className="pt-2"><strong>Result:</strong> The model learns to transition from repeating sentences to answering queries in direct instructional formats.</p>
                </div>
              </motion.div>
            )}

            {activeStage === "rlhf" && (
              <motion.div
                key="rlhf"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <GraduationCap className="text-violet-500" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 font-sans">
                    RLHF: Training for Helpfulness, Safety & Alignment
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  How do we keep the artificial neural network from hallucinating lies, saying toxic words, or writing malicious scripts? We use **Reinforcement Learning from Human Feedback** (RLHF).
                </p>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Human trainers review thousands of draft answers and rate them relative to each other. The model adjusts its weights upwards for elegant answers and downwards for bad ones!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side: Interactive SFT / RLHF rating simulator */}
        <div className="lg:col-span-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200/80 dark:border-gray-800 flex-1 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-850 pb-2 mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" /> RLHF Training alignment simulator
              </span>
              <span className="text-xs font-mono font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded">
                Score: {gameScore} / {SCENARIOS.length}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-normal">
              **Play the role of an AI Safety Trainer!** Read the user prompt below, compare the two simulated outputs, and vote on which matches helpfulness standards.
            </p>

            <div className="space-y-3">
              {/* Scenario Prompt */}
              <div className="bg-violet-100/60 dark:bg-violet-950/20 p-3 rounded-lg border border-violet-200/40 dark:border-violet-900/40">
                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 font-mono uppercase block mb-1">Trainer Prompt</span>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">&quot;{scenario.prompt}&quot;</p>
              </div>

              {/* Response options side by side */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Option A */}
                <button
                  disabled={showResult}
                  onClick={() => handleVote("A")}
                  className={`text-left p-3 rounded-xl border text-xs transition-all relative ${
                    showResult
                      ? votedChoice === "A"
                        ? scenario.preferred === "A"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 cursor-default"
                          : "bg-red-50 dark:bg-red-950/20 border-red-400 text-red-800 dark:text-red-300 cursor-default"
                        : "bg-white dark:bg-gray-950 opacity-50 cursor-default border-gray-150 dark:border-gray-850"
                      : "bg-white dark:bg-gray-950 hover:bg-gray-100 border-gray-200 dark:border-gray-800 hover:scale-[1.01] active:translate-y-0.5"
                  }`}
                >
                  <span className="block font-bold font-mono uppercase text-[9px] mb-1.5 text-gray-400">Response A</span>
                  <p className="leading-relaxed font-sans">{scenario.responseA}</p>
                  
                  {!showResult ? (
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono font-semibold text-gray-400 group-hover:block uppercase bg-gray-100 hover:bg-gray-200 px-1 py-0.5 rounded">
                      Vote
                    </div>
                  ) : (
                    votedChoice === "A" && (
                      <span className="absolute bottom-2 right-2 text-[10px]">
                        {scenario.preferred === "A" ? "✅ Good Answer" : "❌ Rejected"}
                      </span>
                    )
                  )}
                </button>

                {/* Option B */}
                <button
                  disabled={showResult}
                  onClick={() => handleVote("B")}
                  className={`text-left p-3 rounded-xl border text-xs transition-all relative ${
                    showResult
                      ? votedChoice === "B"
                        ? scenario.preferred === "B"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 cursor-default"
                          : "bg-red-50 dark:bg-red-950/20 border-red-400 text-red-800 dark:text-red-300 cursor-default"
                        : "bg-white dark:bg-gray-950 opacity-50 cursor-default border-gray-150 dark:border-gray-850"
                      : "bg-white dark:bg-gray-950 hover:bg-gray-100 border-gray-200 dark:border-gray-800 hover:scale-[1.01] active:translate-y-0.5"
                  }`}
                >
                  <span className="block font-bold font-mono uppercase text-[9px] mb-1.5 text-gray-400">Response B</span>
                  <p className="leading-relaxed font-sans">{scenario.responseB}</p>

                  {!showResult ? (
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono font-semibold text-gray-400 group-hover:block uppercase bg-gray-100 px-1 py-0.5 rounded">
                      Vote
                    </div>
                  ) : (
                    votedChoice === "B" && (
                      <span className="absolute bottom-2 right-2 text-[10px]">
                        {scenario.preferred === "B" ? "✅ Helpful/Safe" : "❌ Rejected"}
                      </span>
                    )
                  )}
                </button>
              </div>
            </div>

            {/* Explanation box on completion */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] leading-relaxed"
                >
                  <p className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5 mb-1 uppercase font-mono tracking-wide text-[10px]">
                    <Sparkles size={12} /> Alignment adjustments complete
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">{scenario.feedbackReason}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800/80 mt-4">
            {showResult ? (
              <button
                onClick={handleNextScenario}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 px-3 rounded-lg text-xs font-bold font-sans tracking-wide shadow transition-all cursor-pointer"
              >
                Next Scenario
              </button>
            ) : null}
            <button
              onClick={handleResetGame}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-605 transition-colors p-2 text-xs flex items-center gap-1"
              title="Reset Alignment Simulator"
            >
              <RefreshCw size={12} /> Reset Training
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
