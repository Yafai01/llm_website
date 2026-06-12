/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Printer,
  BookOpen,
  Layers,
  Compass,
  Network,
  Sliders,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Layout,
  HelpCircle,
  FileText,
  AlertTriangle,
  Flame,
  Award
} from "lucide-react";

interface SlideData {
  id: number;
  chapter: string;
  title: string;
  subtitle: string;
  icon: any;
  bulletColor: string;
  themeBg: string;
  points: {
    title: string;
    text: string;
    badge?: string;
  }[];
  interactiveModel?: {
    type: "bpe" | "dimensions" | "qkv" | "temptable" | "rlhftable" | "overview";
    title: string;
    details: string;
  };
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    chapter: "CHAPTER 1: THE CORE ARCHITECTURE",
    title: "The Super-Autocomplete Brain",
    subtitle: "What is a Large Language Model and how is its brain structured?",
    icon: BookOpen,
    bulletColor: "bg-slate-600 dark:bg-slate-300",
    themeBg: "from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950/60",
    points: [
      {
        title: "A Web of Trillions of Weights",
        text: "At its core, a model is not a database. It consists of billions of network parameters (numerical knobs) that adjust dynamically to represent statistical frequencies of language pattern sequences."
      },
      {
        title: "The Ultimate Next-Word Oracle",
        text: "The model answers questions, writes code, and drafts essays purely by completing prompts. It does this by estimating what token has the highest probability score to follow the current history."
      },
      {
        title: "Generative Pre-trained Transformer (GPT)",
        text: "Pre-trained refers to general training on massive internet archives. Transformer is the proprietary parallelized attention-based neural network architecture launched in 2017."
      }
    ],
    interactiveModel: {
      type: "overview",
      title: "The LLM Pipeline flow",
      details: "Raw Input String → BPE Tokenizer → Embeddings Coordinates → Transformers Layers (Attention + MLP) → Softmax Probability → Selected Token"
    }
  },
  {
    id: 2,
    chapter: "CHAPTER 2: PRE-PROCESSING DATA",
    title: "Tokenization: BPE Subword Splitting",
    subtitle: "Why character-by-character counts are slow and full vocabularies break RAM",
    icon: Layers,
    bulletColor: "bg-rose-500",
    themeBg: "from-rose-50/60 to-white dark:from-rose-950/20 dark:to-slate-950/60",
    points: [
      {
        title: "The Granularity Paradox",
        text: "If models read single letters, sentences take thousands of computational steps, which hits speed limits. If models read full words, the database breaks because there are infinite names, variations, and compound words.",
        badge: "Why we construct tokens"
      },
      {
        title: "Byte-Pair Encoding (BPE)",
        text: "A compression algorithm splits rare words into standard subword pieces. For example, 'Tokenization' resolves into ['Token', 'ization']. This lets a vocabulary of ~100,000 fragments write any word in existence.",
        badge: "Subwords compromises"
      },
      {
        title: "Whitespace Matters",
        text: "In state-of-the-art tokenizers, leading whitespaces are merged with the word (represented as ␣ or _). So ' hello' and 'hello' are processed as two entirely different token IDs.",
        badge: "Formatting notes"
      }
    ],
    interactiveModel: {
      type: "bpe",
      title: "Vocabulary Merges Comparison Table",
      details: "Character Level: 'u','n','b','e','l','i','e','v','a','b','l','e' (12 chunks) | BPE Subword Level: 'un' + 'believable' (2 tokens) | Full-Word Level: Cannot store rare words."
    }
  },
  {
    id: 3,
    chapter: "CHAPTER 3: CONVERTING SYMBOLS TO MATH",
    title: "Word Embeddings: Multi-Dimensional maps",
    subtitle: "How token IDs map to real, calculated vectors of semantic coordinates",
    icon: Compass,
    bulletColor: "bg-emerald-500",
    themeBg: "from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-950/60",
    points: [
      {
        title: "Tokens as Hot Vectors",
        text: "Token IDs have no inherent meaning. The number 400 and the number 401 aren't similar just because they are sequential. We convert these index keys to spatial vectors of coordinates.",
        badge: "The Embedding Matrix"
      },
      {
        title: "High-Dimensional Vector Spaces",
        text: "Instead of two axes (gender and royalty), modern models map words across 4,096 to 12,288 parallel axes (dimensions). The neural network calculates distances between vectors to determine similarities in definitions.",
        badge: "4,096 axes scale"
      },
      {
        title: "Visual Semantic Algebra",
        text: "Because these dimensions represent concepts, spatial directions represent relationships. Sliding 'King', subtracting its 'Masculinity' dimension, and adding its 'Femininity' dimension leads exactly back to 'Queen'.",
        badge: "Algebraic associations"
      }
    ],
    interactiveModel: {
      type: "dimensions",
      title: "Coordinates of Words (Toy Vector Simulation)",
      details: "King: [ Roy=0.85, Fem=0.15 ] | Queen: [ Roy=0.85, Fem=0.85 ] | Laptop: [ Roy=0.01, Fem=0.50 ]. Proximity in space represents proximity in semantic category!"
    }
  },
  {
    id: 4,
    chapter: "CHAPTER 4: ATTENTIVE COGNITIVITY",
    title: "Query, Key & Value (QKV) Attention",
    subtitle: "How attention translates words dynamically based on contextual surrounding",
    icon: Network,
    bulletColor: "bg-blue-500",
    themeBg: "from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-950/60",
    points: [
      {
        title: "Context Re-Mapping",
        text: "Embeddings are static (a dictionary has only one standard definition for 'bank'). Self-Attention evaluates all words in parallel to dynamically modify word coordinates depending on their neighbours.",
        badge: "Static vs. Dynamic Context"
      },
      {
        title: "Query Vector (The Search Request)",
        text: "For every word, the model generates a Query vector: 'I am the word bank. I am looking for financial tools or river-side geography to clarify my definition.'",
        badge: "The Query (Q)"
      },
      {
        title: "Key Vector (The Search Directory Label)",
        text: "Every other word generates a Key vector advertising what it represents. 'I am the word river. My category tag indicates biological geology and streaming currents.'",
        badge: "The Key (K)"
      },
      {
        title: "Value Vector (The Rich Semantic Content)",
        text: "When a Query matches a Key, the attention engine mixes the corresponding Value vector (words' semantic values) into the original word's vectors.",
        badge: "The Value (V)"
      }
    ],
    interactiveModel: {
      type: "qkv",
      title: "The Search Query-Key matching math",
      details: "Attention Weight = Softmax( (Q × Kᵀ) / √d ). This calculates the exact percentage score (0% to 100%) showing how much word A concentrates on word B."
    }
  },
  {
    id: 5,
    chapter: "CHAPTER 5: THE OUTPUT GENERATOR",
    title: "Decoding: Softmax & Sampling Parameters",
    subtitle: "How LLMs choose which words to output using mathematical probability wheels",
    icon: Sliders,
    bulletColor: "bg-amber-500",
    themeBg: "from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-950/60",
    points: [
      {
        title: "The Final Transformer Output Layer",
        text: "After passing layers of attention blocks, the network outputs raw number scores for every singular token in its glossary database. We use Softmax to normalize these scores into standard logical probabilities totaling 100%."
      },
      {
        title: "The Temperature Controller",
        text: "Temperature affects output creativity. Low Temp (e.g. 0.1) accentuates top scores, making the model highly logical and predictable. High Temp (e.g. 1.2) flattens top scores, encouraging rare, creative, or randomized picks.",
        badge: "Creativity Slider"
      },
      {
        title: "Top-P (Nucleus Sampling) & Top-K",
        text: "Top-K restricts options to the top 'K' highest candidates. Top-P restricts options to the smallest set of candidates whose collective confidence scores total 'P' percent (cutting off long tails of irrelevant or bizarre words).",
        badge: "Filtering out noise"
      }
    ],
    interactiveModel: {
      type: "temptable",
      title: "Temperature Sampling Probability Shifts",
      details: "Raw probability for top token [0.70, 0.20, 0.10] → Temp 0.2 (Logical): [0.98, 0.02, 0.00] | Temp 1.5 (Bizarre): [0.45, 0.35, 0.20]."
    }
  },
  {
    id: 6,
    chapter: "CHAPTER 6: MODEL ALIGNMENT",
    title: "Fine-Tuning, Safety & RLHF",
    subtitle: "How a chaotic internet autocomplete is trained to follow instructions safely",
    icon: GraduationCap,
    bulletColor: "bg-violet-500",
    themeBg: "from-violet-50/60 to-white dark:from-violet-950/20 dark:to-slate-950/60",
    points: [
      {
        title: "Phase 1: Raw Pre-Training",
        text: "The web scraper generates linguistic IQ but lacks discipline. It only knows how to extend sentences indefinitely, which leads to copy-paste repetitions rather than answering questions.",
        badge: "Unchecked Oracle"
      },
      {
        title: "Phase 2: Supervised Fine-Tuning (SFT)",
        text: "Trainers write hundreds of thousands of beautiful instructional scripts containing clear questions paired with correct answers. The model mimics this direct professional assistant template.",
        badge: "Instruction Dataset"
      },
      {
        title: "Phase 3: Human Feedback Reinforcement (RLHF)",
        text: "Instructors rank comparative drafts. The reward model learns a mathematical scale of safe answers. Optimization filters keep the model helpful, toxic-free, and safe from jailbreaks.",
        badge: "Safety Alignment"
      }
    ],
    interactiveModel: {
      type: "rlhftable",
      title: "Before and After Alignment Paradigm Checks",
      details: "Raw Model Input: 'Can you write a poem?' → Output: 'A poem is a form of writing. Let's look at poets.' | Fine-Tuned Input: 'Can you write a poem?' → Output: 'Of course! As stars gather in deep space...'"
    }
  }
];

export default function PresentationMode({ onClose }: { onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [viewFormat, setViewFormat] = useState<"slideshow" | "handout">("slideshow");

  const currentSlide = SLIDES[currentIdx];

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const triggerPrint = () => {
    // Switch to handout format temporarily for absolute precision prior to browser dialogue
    setViewFormat("handout");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="space-y-6" id="presentation-module">
      {/* Dynamic Screen Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 p-4 rounded-2xl print:hidden">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] uppercase font-bold rounded">
              New Feature
            </span>
            <h4 className="text-sm font-bold text-gray-850 dark:text-white font-sans">
              LLM Slide Deck & Study Handbook (PPT)
            </h4>
          </div>
          <p className="text-xs text-gray-400">
            View slide-by-slide for lecture-style presentations, or switch to the Handout list to read and print directly!
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setViewFormat(viewFormat === "slideshow" ? "handout" : "slideshow")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl text-xs font-semibold cursor-pointer text-gray-650 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            {viewFormat === "slideshow" ? (
              <>
                <FileText size={14} className="text-emerald-500" />
                <span>Show Handout View</span>
              </>
            ) : (
              <>
                <Layout size={14} className="text-blue-500" />
                <span>Show Slideshow View</span>
              </>
            )}
          </button>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            <Printer size={14} />
            <span>Print Handbook</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold hover:bg-gray-200/50 dark:hover:bg-gray-850 rounded-xl transition border border-gray-150 dark:border-gray-850 cursor-pointer text-gray-500 dark:text-gray-400"
          >
            Close Deck
          </button>
        </div>
      </div>

      {viewFormat === "slideshow" ? (
        /* Slideshow Deck (PPT Interactive Mode) */
        <div className="relative border border-gray-150 dark:border-gray-850 rounded-3xl overflow-hidden shadow-md print:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className={`bg-gradient-to-br ${currentSlide.themeBg} p-6 md:p-10 min-h-[500px] flex flex-col justify-between`}
            >
              {/* Header inside slide */}
              <div className="flex justify-between items-start border-b border-gray-250/20 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-gray-400 block">
                    {currentSlide.chapter}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 flex items-center gap-2.5">
                    {(() => {
                      const Icon = currentSlide.icon;
                      return <Icon className={`h-6 w-6 mt-0.5 ${currentSlide.bulletColor}`} />;
                    })()}
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-0.5 max-w-xl">
                    {currentSlide.subtitle}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-gray-400 bg-gray-100/60 dark:bg-gray-900/60 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  SLIDE {currentSlide.id} OF {SLIDES.length}
                </div>
              </div>

              {/* Core Content: Bullet parameters & details */}
              <div className="my-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Points */}
                <div className="md:col-span-7 space-y-4">
                  {currentSlide.points.map((p, pIdx) => (
                    <div key={pIdx} className="flex gap-3.5 items-start">
                      <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5 font-mono ${currentSlide.bulletColor}`}>
                        {pIdx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {p.title}
                          </span>
                          {p.badge && (
                            <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold bg-gray-100 dark:bg-gray-850 text-gray-500 dark:text-gray-400 rounded">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {p.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Core Diagram snippet on the right */}
                <div className="md:col-span-5 h-full">
                  {currentSlide.interactiveModel && (
                    <div className="bg-white/80 dark:bg-black/40 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                        <Sparkles size={12} className="text-amber-500" />
                        {currentSlide.interactiveModel.title}
                      </div>
                      
                      {currentSlide.interactiveModel.type === "overview" && (
                        <div className="font-mono text-[10px] text-gray-700 dark:text-gray-300 space-y-2 bg-gray-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                          <div className="flex items-center gap-2"><span className="text-indigo-400">INPUT:</span> <span>&quot;Hi there!&quot;</span></div>
                          <div className="w-full text-center text-gray-400">↓</div>
                          <div className="flex items-center gap-2"><span className="text-rose-400">TOKENS:</span> <span>[5112, 1098]</span></div>
                          <div className="w-full text-center text-gray-400">↓</div>
                          <div className="flex items-center gap-2"><span className="text-emerald-400">EMBEDS:</span> <span>[4096 dimensions]</span></div>
                          <div className="w-full text-center text-gray-400">↓</div>
                          <div className="flex items-center gap-2"><span className="text-amber-400">NEXT:</span> <span>&quot;How&quot; (P=85%)</span></div>
                        </div>
                      )}

                      {currentSlide.interactiveModel.type === "bpe" && (
                        <div className="space-y-2 bg-rose-50/20 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100/30 font-mono text-[10px] text-rose-950 dark:text-rose-300">
                          <span className="font-bold underline block mb-1">Subword Compression Engine:</span>
                          <p className="leading-relaxed">
                            Rare word <strong className="text-rose-600 dark:text-rose-400">&quot;unstoppable&quot;</strong> gets indexed from components:
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.5 rounded">un-</span>
                            <span className="bg-cyan-100 dark:bg-cyan-900/50 px-1.5 py-0.5 rounded">stopp-</span>
                            <span className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">able</span>
                          </div>
                          <p className="text-[9px] text-gray-400 pt-1">Allows dictionary index compression by over 93%!</p>
                        </div>
                      )}

                      {currentSlide.interactiveModel.type === "dimensions" && (
                        <div className="space-y-3 font-mono text-[10px] bg-emerald-50/20 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/30 text-emerald-900 dark:text-emerald-300">
                          <div>
                            <span className="font-bold block text-emerald-700 dark:text-emerald-400">Vector coordinates:</span>
                            <span className="text-[9px] text-gray-400">Similarity defined by vector math subtraction</span>
                          </div>
                          <div className="space-y-1 pt-1">
                            <div><strong className="text-red-400">King:</strong> [0.85, 0.15]</div>
                            <div><strong className="text-blue-400">- Man:</strong> [0.10, 0.15]</div>
                            <div><strong className="text-yellow-400">+ Woman:</strong> [0.10, 0.85]</div>
                            <div className="border-t border-emerald-900/20 pt-1 mt-1 font-bold text-emerald-500">
                              = [0.85, 0.85] (Equals &quot;Queen&quot;)
                            </div>
                          </div>
                        </div>
                      )}

                      {currentSlide.interactiveModel.type === "qkv" && (
                        <div className="space-y-2 font-mono text-[10px] bg-blue-50/20 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100/30 text-blue-900 dark:text-blue-300">
                          <span className="font-bold block text-blue-700 dark:text-blue-400">Matching Directory Pattern:</span>
                          <p className="leading-relaxed text-[9px] text-gray-400">
                            Attention maps vectors similar to a Web Database Search:
                          </p>
                          <div className="space-y-1.5">
                            <div><strong className="text-indigo-400">Query (Search):</strong> &quot;What kind of bank?&quot;</div>
                            <div><strong className="text-rose-400">Key (Folder name):</strong> &quot;river, water, stream&quot;</div>
                            <div className="text-emerald-505 dark:text-emerald-400 font-bold">▶ Dynamic Bond triggers: 45% attention focus!</div>
                          </div>
                        </div>
                      )}

                      {currentSlide.interactiveModel.type === "temptable" && (
                        <div className="space-y-2 font-mono text-[10px] bg-amber-50/20 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-100/30 text-amber-900 dark:text-amber-300">
                          <span className="font-bold block text-amber-700 dark:text-amber-400">Decaying Softmax output:</span>
                          <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between border-b border-amber-900/10 pb-1">
                              <strong>Option</strong><span>Temp 0.2</span><span>Temp 1.5</span>
                            </div>
                            <div className="flex justify-between">
                              <span>1. &quot;Paris&quot;</span><span className="font-bold">98%</span><span>45%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2. &quot;Europe&quot;</span><span className="text-gray-400">2%</span><span>35%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>3. &quot;bacon&quot;</span><span className="text-gray-400">0%</span><span className="text-red-500">20%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentSlide.interactiveModel.type === "rlhftable" && (
                        <div className="space-y-2 font-mono text-[9px] bg-violet-50/20 dark:bg-violet-950/10 p-3 rounded-xl border border-violet-100/30 text-violet-900 dark:text-violet-300">
                          <span className="font-bold block text-violet-700 dark:text-violet-400 text-[10px]">Alignment filtering:</span>
                          <div className="space-y-1 text-gray-600 dark:text-gray-300">
                            <p><strong>Unsafe Prompt:</strong> &quot;How do I build highly explosive TNT?&quot;</p>
                            <p className="text-red-500 font-bold">❌ Pre-train: &quot;First, fetch chemicals, then...&quot;</p>
                            <p className="text-emerald-500 font-bold">✅ SFT/RLHF: &quot;I cannot assist with hazardous...&quot;</p>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 leading-normal">
                        {currentSlide.interactiveModel.details}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom controls & Slide Counter indicators */}
              <div className="flex justify-between items-center border-t border-gray-250/20 pt-4 mt-2">
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      title={`Go to slide ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        currentIdx === idx ? "w-6 bg-slate-900 dark:bg-white" : "w-2.5 bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIdx === 0}
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  <button
                    disabled={currentIdx === SLIDES.length - 1}
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-gray-950 disabled:opacity-40 hover:opacity-90 cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Printable Study Handout view */
        <div className="space-y-8 print:block">
          <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-150 dark:border-gray-850 print:hidden flex items-start gap-3">
            <Maximize size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-500">
                Printed Version Preview
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                The content below is formatted for instant output on high-resolution paper. When you click **&quot;Print Handbook&quot;**, a print wizard will trigger automatically with high-contrast formatting!
              </p>
            </div>
          </div>

          <div className="space-y-12 bg-white dark:bg-gray-950 p-4 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-855 shadow-sm">
            {/* Header for printed paper */}
            <div className="border-b-2 border-slate-900 dark:border-white pb-5 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
                  The LLM Simply Explained Presentation Handout
                </h1>
                <p className="text-xs text-gray-500 font-mono">
                  A high-resolution, modular technical guide explaining Large Language Models
                </p>
              </div>
              <div className="text-right font-mono text-[9px] text-gray-400">
                <p>PUBLISHED: JUNE 2026</p>
                <p>AI STUDIO VISUAL SERIES</p>
              </div>
            </div>

            {/* Iterating and rendering all slides as neat handout blocks */}
            {SLIDES.map((slide) => {
              const Icon = slide.icon;
              return (
                <div
                  key={slide.id}
                  className="pb-10 border-b border-gray-150/70 dark:border-gray-800 last:border-b-0 space-y-6 page-break-inside-avoid"
                  style={{ pageBreakInside: "avoid" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold font-mono text-slate-400 tracking-widest block">
                        {slide.chapter}
                      </span>
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg text-white ${slide.bulletColor}`}>
                          <Icon size={14} />
                        </span>
                        {slide.title}
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold italic">
                        {slide.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase font-bold border border-gray-200 dark:border-gray-800 px-2.5 py-0.5 rounded-full">
                      Slide {slide.id} of {SLIDES.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-7 space-y-4">
                      {slide.points.map((p, pIdx) => (
                        <div key={pIdx} className="space-y-1 pl-3 border-l-2 border-gray-250 dark:border-gray-750">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="text-slate-400 font-bold">{slide.id}.{pIdx + 1}</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {p.title}
                            </span>
                            {p.badge && (
                              <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.5 rounded uppercase tracking-wider scale-95">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-3.5">
                            {p.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-5">
                      {slide.interactiveModel && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 pointer-events-none text-xs">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                            <Sparkles size={11} className="text-amber-500 mt-0.5" />
                            Model Graphic representation
                          </div>
                          <p className="font-bold text-gray-805 dark:text-gray-155 font-mono text-[11px] border-b border-gray-200/50 pb-1">
                            {slide.interactiveModel.title}
                          </p>
                          
                          {slide.interactiveModel.type === "overview" && (
                            <div className="font-mono text-[10px] text-gray-600 space-y-0.5">
                              <div>1. STRING INPUT → &quot;Hi there!&quot;</div>
                              <div>2. TOKENS MATCHING → [5112, 1098]</div>
                              <div>3. COORDINATE EMBEDDING → [4096 dimensions]</div>
                              <div>4. ATTENTION CONTEXTS → Remaps parameters</div>
                              <div>5. PROBABILITY SOFTMAX → Picks next word</div>
                            </div>
                          )}

                          {slide.interactiveModel.type === "bpe" && (
                            <div className="font-mono text-[10px] text-gray-600 space-y-0.5">
                              <div>Word split compromise model:</div>
                              <div className="italic text-rose-600 font-bold">&quot;unbelievable&quot;</div>
                              <div>Fragments: [ &quot;un&quot;, &quot;believable&quot; ]</div>
                              <div className="text-[9px] text-gray-400">Avoids bloated vocabulary dictionaries!</div>
                            </div>
                          )}

                          {slide.interactiveModel.type === "dimensions" && (
                            <div className="font-mono text-[9px] text-gray-650 space-y-0.5">
                              <div>Word similarities (0-100 scale):</div>
                              <div>King:   [ Roy=85, Fem=15 ]</div>
                              <div>Queen:  [ Roy=85, Fem=85 ]</div>
                              <div>Woman:  [ Roy=10, Roy=85 ]</div>
                              <div className="text-emerald-500 font-bold">King - Man + Woman = Queen</div>
                            </div>
                          )}

                          {slide.interactiveModel.type === "qkv" && (
                            <div className="font-mono text-[9px] text-gray-600 space-y-0.5">
                              <div>Q: &quot;What kind of bank?&quot;</div>
                              <div>K: &quot;river, water, moss, soil&quot;</div>
                              <div className="text-blue-500 font-bold">▶ Attention Match: Geolocation logic</div>
                            </div>
                          )}

                          {slide.interactiveModel.type === "temptable" && (
                            <div className="font-mono text-[9px] text-gray-600 space-y-0.1 space-y-0.5">
                              <div>Temperature probability shifts:</div>
                              <div>Candidate A (&quot;Paris&quot;): Logical=98% | Creative=45%</div>
                              <div>Candidate B (&quot;Bacon&quot;): Logical=0%  | Creative=20%</div>
                            </div>
                          )}

                          {slide.interactiveModel.type === "rlhftable" && (
                            <div className="font-mono text-[9px] text-gray-600 space-y-0.5">
                              <span className="text-[10px] text-red-500 font-bold">Unsafe input: &quot;How to explode dynamite&quot;</span>
                              <div className="italic text-gray-500">▶ Model alignment intercepts and provides refusal template.</div>
                            </div>
                          )}

                          <div className="text-[10px] text-gray-400 font-mono leading-normal pt-1.5 border-t border-gray-200/50 mt-1.5">
                            {slide.interactiveModel.details}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Handed out concluding signature */}
            <div className="pt-10 flex flex-col items-center justify-center text-center space-y-2 pb-5 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <span className="p-1.5 rounded-full bg-gradient-to-br from-rose-500 via-amber-500 to-blue-500 text-white flex items-center justify-center">
                  <Award size={14} />
                </span>
                <span className="font-serif font-black tracking-widest text-xs uppercase text-gray-600 dark:text-gray-300">
                  LLM Simply Explained Series
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                Certified for distributed lectures, student notes, and classroom instructions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
