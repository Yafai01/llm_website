/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Layers,
  Compass,
  Network,
  Sliders,
  GraduationCap,
  Award,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle,
  Layout,
} from "lucide-react";

import TokenizerSection from "./components/TokenizerSection";
import EmbeddingSection from "./components/EmbeddingSection";
import AttentionSection from "./components/AttentionSection";
import PlaygroundSection from "./components/PlaygroundSection";
import TrainingSection from "./components/TrainingSection";
import QuizSection from "./components/QuizSection";
import PresentationMode from "./components/PresentationMode";

interface Section {
  id: string;
  title: string;
  shortTitle: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgLight: string;
}

const SECTIONS: Section[] = [
  {
    id: "intro",
    title: "The Super-Autocomplete Concept",
    shortTitle: "Introduction",
    icon: BookOpen,
    color: "text-slate-600 dark:text-slate-300",
    bgLight: "bg-slate-50 dark:bg-slate-900/60",
  },
  {
    id: "tokenizer",
    title: "Tokenization: Chopping Words into Chunks",
    shortTitle: "1. Tokenizer",
    icon: Layers,
    color: "text-rose-500",
    bgLight: "bg-rose-50/40 dark:bg-rose-950/20",
  },
  {
    id: "embeddings",
    title: "Embeddings: Mapping Words on Coordinates",
    shortTitle: "2. Embeddings",
    icon: Compass,
    color: "text-emerald-500",
    bgLight: "bg-emerald-50/40 dark:bg-emerald-950/20",
  },
  {
    id: "attention",
    title: "Self-Attention: Reading Words in Context",
    shortTitle: "3. Self-Attention",
    icon: Network,
    color: "text-blue-500",
    bgLight: "bg-blue-50/40 dark:bg-blue-950/20",
  },
  {
    id: "playground",
    title: "Next-Token Playground: Autocomplete Engine",
    shortTitle: "4. Generator",
    icon: Sliders,
    color: "text-amber-500",
    bgLight: "bg-amber-50/40 dark:bg-amber-950/20",
  },
  {
    id: "training",
    title: "Machine School: How Models Learn",
    shortTitle: "5. Alignment",
    icon: GraduationCap,
    color: "text-violet-500",
    bgLight: "bg-violet-50/40 dark:bg-violet-950/20",
  },
  {
    id: "quiz",
    title: "Knowledge Check: Interactive Certification",
    shortTitle: "Evaluation Quiz",
    icon: Award,
    color: "text-rose-500",
    bgLight: "bg-rose-50/40 dark:bg-rose-950/20",
  },
  {
    id: "presentation",
    title: "LLM Slide Deck & Study Handbook (PPT)",
    shortTitle: "★ Slides & Print (PPT)",
    icon: Layout,
    color: "text-indigo-505 dark:text-indigo-400",
    bgLight: "bg-indigo-50/45 dark:bg-indigo-950/20",
  },
];

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<string>("intro");
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set(["intro"]));

  const handleSectionSwitch = (id: string) => {
    setActiveSectionId(id);
    setVisitedSet((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });
  };

  // Convert progress into fraction %
  const progressRatio = (visitedSet.size / SECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col font-sans">
      {/* Top Banner / Navigation header */}
      <header className="bg-white dark:bg-gray-905 border-b border-gray-150 dark:border-gray-900 sticky top-0 z-50 py-3.5 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-blue-500 text-white shadow-sm flex items-center justify-center">
              <Sparkles size={18} className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-950 dark:text-white uppercase font-sans">
                LLM Simply Explained
              </h1>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider block uppercase">
                An interactive handbook on Transformers & vectors
              </span>
            </div>
          </div>

          {/* Cumulative Progress bar tracker */}
          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-gray-405">
              <span>Chapter Progress</span>
              <span className="font-bold text-gray-700 dark:text-gray-350">
                {visitedSet.size} / {SECTIONS.length} Completed
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Chapters & Roadmap rail */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-900 p-4 shadow-xs sticky top-24 space-y-3">
            <span className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest pl-1">
              Table of Contents
            </span>

            <nav className="flex flex-col gap-1">
              {SECTIONS.map((sec) => {
                const isActive = sec.id === activeSectionId;
                const isVisited = visitedSet.has(sec.id);
                const Icon = sec.icon;

                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSectionSwitch(sec.id)}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold font-sans tracking-tight flex items-center justify-between border cursor-pointer transition-all ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-gray-950 shadow-xs scale-[1.01]"
                        : "bg-transparent border-transparent text-gray-600 dark:text-gray-405 hover:bg-gray-100/60 dark:hover:bg-gray-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        size={15}
                        className={isActive ? "text-rose-500 dark:text-rose-600" : sec.color}
                      />
                      <span className="truncate">{sec.shortTitle}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pl-1">
                      {isVisited && !isActive && (
                        <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                      )}
                      <ChevronRight size={12} className="opacity-40" />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Side: Active lesson canvas box */}
        <div className="lg:col-span-9 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-150/85 dark:border-gray-900 p-6 md:p-8 shadow-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSectionId === "intro" && (
                <div className="space-y-8">
                  {/* Lesson Heading */}
                  <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Getting Started
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
                      The Autocomplete Brain: What is an LLM?
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
                      You have likely used ChatGPT, Gemini, or Claude. But what actually is a **Large Language Model (LLM)**? Let&apos;s clear the mathematical jargon and explain it in plain English.
                    </p>
                  </div>

                  {/* Mental Model layout cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Concept card 1 */}
                    <div className="bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-950 p-5 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-500">
                        1. Think of it as: Supercharged Autocomplete
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        When you write a message on your phone, it suggests the absolute most likely next word.
                        An LLM works on the **exact same principle**—just hundreds of billions of times larger.
                        It scans history and tells you what word should logically follow!
                      </p>
                    </div>

                    {/* Concept card 2 */}
                    <div className="bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-950 p-5 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-500">
                        2. How does it answer questions?
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        If you prompt: &quot;The capital of France is...&quot;, the autocomplete knows from
                        reading the internet that the next word is almost certainly going to be **Paris**.
                        By continuously predicting next words, it writes whole essays, computer code, and songs!
                      </p>
                    </div>
                  </div>

                  {/* Step-by-step roadmap outline */}
                  <div className="bg-slate-50 dark:bg-gray-950/40 rounded-xl p-5 border border-gray-100 dark:border-gray-900">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-3">
                      <Info size={14} className="text-slate-500" /> Your Educational Roadmap
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      In this handbook, you will walk step-by-step through the actual pipeline inside a state-of-the-art model. Click the sections in the sidebar or below to begin:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-2">
                        <span className="text-rose-500 font-bold text-xs font-mono">01.</span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold tracking-tight">Tokenization</span>
                          <span className="block text-[11px] text-gray-400">
                            See how words are split into numerical chunks.
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-emerald-500 font-bold text-xs font-mono">02.</span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold tracking-tight">Embeddings</span>
                          <span className="block text-[11px] text-gray-400">
                            Map semantic words onto mathematical coordinate grids.
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-blue-500 font-bold text-xs font-mono">03.</span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold tracking-tight">Self-Attention</span>
                          <span className="block text-[11px] text-gray-400">
                            Connect words in full sentence contexts in parallel.
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold text-xs font-mono">04.</span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold tracking-tight">Playground Generator</span>
                          <span className="block text-[11px] text-gray-400">
                            Tweak Temperature parameters to sample token probability wheels!
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Immediate jump trigger */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSectionSwitch("tokenizer")}
                      className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold py-3 px-6 rounded-xl text-xs md:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 bg-gradient-to-r hover:opacity-90 cursor-pointer"
                    >
                      Step 1: Start Tokenization <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "tokenizer" && (
                <div className="space-y-6">
                  <TokenizerSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("intro")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      ← Back to Intro
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("embeddings")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 2: Embeddings Coordinates →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "embeddings" && (
                <div className="space-y-6">
                  <EmbeddingSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("tokenizer")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      ← Back to Tokenizer
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("attention")}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 3: Self-Attention Context →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "attention" && (
                <div className="space-y-6">
                  <AttentionSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("embeddings")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      ← Back to Embeddings
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("playground")}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 4: Predict Playground →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "playground" && (
                <div className="space-y-6">
                  <PlaygroundSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("attention")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      ← Back to Attention
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("training")}
                      className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 5: How they Learn →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "training" && (
                <div className="space-y-6">
                  <TrainingSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("playground")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      ← Back to Playground
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("quiz")}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 6: Certification Exam →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "quiz" && (
                <div className="space-y-6">
                  <QuizSection />
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("training")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    >
                      ← Back to School Stage
                    </button>
                    <button
                      onClick={() => handleSectionSwitch("presentation")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Step 7: Keynote PPT & Print Handout →
                    </button>
                  </div>
                </div>
              )}

              {activeSectionId === "presentation" && (
                <div className="space-y-6">
                  <PresentationMode onClose={() => handleSectionSwitch("intro")} />
                  <div className="flex justify-start pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleSectionSwitch("quiz")}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    >
                      ← Back to Evaluation Quiz
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modern footer with clean credits */}
      <footer className="mt-auto py-8 bg-white dark:bg-gray-905 border-t border-gray-150 dark:border-gray-900 text-center text-xs text-gray-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 LLM Simply Explained. Hand-crafted for visual cognitive engineering.</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            From Tokenization to Softmax Prediction, everything unfolded.
          </p>
        </div>
      </footer>
    </div>
  );
}
