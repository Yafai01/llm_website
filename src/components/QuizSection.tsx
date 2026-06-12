/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Award } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is a 'token' in the context of Large Language Models?",
    options: [
      "A piece of cryptographic currency used to buy AI services.",
      "A chopped fragment of text (a word or sub-word) mapped to a numerical ID.",
      "An active hardware slot on a graphics card running predictions.",
      "A security certificate validating that the user is not a bot.",
    ],
    correctIdx: 1,
    explanation: "Tokens are the atomic units processed by an LLM. Instead of reading whole words, models slice strings into sub-word pieces (like mapping 'tokenization' to 'token' + 'ization').",
  },
  {
    id: 2,
    question: "How do 'Embeddings' represent semantic similarity between words?",
    options: [
      "They pair words using traditional alphabetical sorting tables.",
      "They store words inside standard text files organized by topic.",
      "They map words to lists of coordinates (vectors) in a high-dimensional space where similar terms sit physically close.",
      "They execute Google searches dynamically every time a word is predicted.",
    ],
    correctIdx: 2,
    explanation: "Embeddings turn semantic meaning into math. Relational concepts have nearby spatial coordinates, enabling vector computations like 'King - Man + Woman = Queen'.",
  },
  {
    id: 3,
    question: "What is the primary breakthrough of 'Self-Attention' in Transformers?",
    options: [
      "It focuses the graphics processor's cooling fans on key calculations.",
      "It allows the model to process words in a sentence one-by-one sequentially.",
      "It allows the model to check dictionary translations dynamically during runs.",
      "It lets every word analyze and calculate connections to all other words in a sentence at the same time to understand context.",
    ],
    correctIdx: 3,
    explanation: "Self-attention processes context in parallel, allowing ambiguous words like 'bank' to connect heavily to surrounding context words (like 'river' or 'money') to determine correct definitions.",
  },
  {
    id: 4,
    question: "What does the 'Temperature' slider influence during generation?",
    options: [
      "The physical speed of the CPU processor chips inside the computer.",
      "The randomness and creativity of next token rolls (High = creative chaos, Low = strict facts).",
      "The volume and tone of the model's vocalizer synthetic outputs.",
      "The ambient color theme contrast on the visitor's browser screen.",
    ],
    correctIdx: 1,
    explanation: "Temperature flattens or peaks the softmax probability distribution. High values spread candidate probabilities (creative, chaotic), and low values reinforce the topmost best guess (dry, factual).",
  },
  {
    id: 5,
    question: "What is the purpose of Positional Encodings added to embeddings?",
    options: [
      "They restrict the maximum number of words you can write in a prompt.",
      "They keep track of the geographic location where the server is located.",
      "They add mathematical coordinates indicating the physical order/position of each token in the sentence (since attention is parallel).",
      "They compress the file size of the output PDF to make downloads faster.",
    ],
    correctIdx: 2,
    explanation: "Because self-attention processes all words in parallel simultaneously, it lacks inherent sense of word order. Positional encodings are added directly to the embeddings to feed sequence data to the model.",
  },
  {
    id: 6,
    question: "In the self-attention formula, what role does the 'Query' vector play?",
    options: [
      "It represents what information the current word is looking for in other words.",
      "It is a hardcoded safety check to block toxic requests.",
      "It holds the raw text representation after the tokenizer finishes.",
      "It defines the spelling of the predicted token outcome.",
    ],
    correctIdx: 0,
    explanation: "Think of attention as a search pipeline. The Query vector acts as a search phrase asking for relevant information, matching against Key vectors (search tags) from other words to fetch Value coordinates.",
  },
  {
    id: 7,
    question: "How do models compute semantic proximity between two embedding coordinate arrows?",
    options: [
      "By looking up spelling similarities inside the dictionary.",
      "Using vector metrics like Cosine Similarity or Dot Product math.",
      "By measuring how many millisecond delays occur during computation.",
      "By converting coordinate vectors back to standard byte arrays.",
    ],
    correctIdx: 1,
    explanation: "Proximity is measured using Cosine Similarity or Dot Product. By measuring the angle between these high-dimensional mathematical arrows, the model determines how closely related they are.",
  },
  {
    id: 8,
    question: "What are MLP (Multi-Layer Perceptron) layer blocks doing after attention runs?",
    options: [
      "They translate sentences to raw HTML webpage structures.",
      "They process positional coordinate patterns to encrypt weight values.",
      "They act as factual databases, holding general context-free knowledge and facts learned during training.",
      "By routing local server packages to speed up bandwidth.",
    ],
    correctIdx: 2,
    explanation: "While attention connects words together dynamically, the Feed-Forward/MLP layers analyze each word independently to act as key-value stores of factual information learned during pre-training.",
  },
  {
    id: 9,
    question: "What does alignment training (like SFT or RLHF) teach the raw model?",
    options: [
      "How to read files from local directories on your system.",
      "To be an interactive, helpful, toxic-free conversational assistant instead of a generic text duplicator.",
      "How to translate decimal floating-point values into binary numbers.",
      "How to automatically compile TypeScript to clean optimized Javascript files.",
    ],
    correctIdx: 1,
    explanation: "Base pre-trained models only autocomplete sentences. Alignment training utilizes high-quality scripts (SFT) and human preference scores (RLHF) to teach safe, structured conversational boundaries.",
  },
  {
    id: 10,
    question: "What occurs during the 'Softmax' layer pass at the very end of generation?",
    options: [
      "The text is formatted to fit elegantly inside your browser iframe.",
      "The temperature settings are resetting back to default standard parameters.",
      "All negative coordinates are cropped out to compress file outputs.",
      "Raw numerical prediction scores (logits) are normalized into real percentages totaling 100%.",
    ],
    correctIdx: 3,
    explanation: "The final layer produces logits (arbitrary positive/negative scores). Softmax converts these logits into standard probability values (0.0 to 1.0) summing to 1.0 (100%) so we can roll weights to select cards.",
  }
];

export default function QuizSection() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("");
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const question = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || submitted) return;
    setSubmitted(true);
    if (selectedOpt === question.correctIdx) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setSubmitted(false);

    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((c) => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setShowCertificate(false);
  };

  const triggerCertificatePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8" id="quiz-section">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider font-mono">
          Interactive Evaluation
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans tracking-tight mt-1">
          Knowledge Check: Test Your LLM Intellect
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-3xl leading-relaxed">
          Now that you have traversed our lessons in tokenization, embeddings, self-attention, and alignment training, test your knowledge against our visual AI certification board!
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left side: Question Card details */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200/85 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center text-xs text-gray-400 font-mono uppercase tracking-wide border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="flex items-center gap-1">
                  <HelpCircle size={14} className="text-rose-500" />
                  Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="font-bold">Score: {score}</span>
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100">
                {question.question}
              </h3>

              {/* Options lists elements */}
              <div className="space-y-3">
                {question.options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrect = oIdx === question.correctIdx;
                  let optStyle = "bg-gray-50 hover:bg-gray-100/70 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300";

                  if (submitted) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300";
                    } else if (isSelected) {
                      optStyle = "bg-red-50 border-red-400 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300";
                    } else {
                      optStyle = "bg-white border-gray-150 text-gray-400 dark:bg-gray-950 dark:border-gray-850 dark:text-gray-500 opacity-60";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300 font-medium";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left py-3.5 px-4 rounded-xl border text-xs md:text-sm transition-all focus:outline-none flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="font-mono text-xs font-bold shrink-0 bg-white dark:bg-gray-900 border border-gray-200 rounded w-6 h-6 flex items-center justify-center">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 pb-2">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedOpt === null}
                    className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:text-gray-950 font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm tracking-wide shadow-md transition-all cursor-pointer"
                  >
                    {currentIdx + 1 < QUIZ_QUESTIONS.length ? "Next Question" : "Complete Quiz"}
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Explanation Board */}
            <div className="lg:col-span-5">
              <AnimatePresence>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200/80 dark:border-gray-800/80 space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                      {selectedOpt === question.correctIdx ? (
                        <>
                          <CheckCircle className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 uppercase font-mono tracking-widest">
                            Correct Answer!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-500" />
                          <span className="text-xs font-bold text-red-500 uppercase font-mono tracking-widest">
                            Incorrect choice
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider mb-2">
                        Educational Explanation:
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-rose-50/30 dark:bg-rose-950/10 rounded-xl p-5 border border-rose-100/40 text-center py-12 text-gray-500">
                    <HelpCircle size={32} className="mx-auto text-rose-300 dark:text-rose-800 animate-bounce mb-3" />
                    <p className="text-xs leading-normal">
                      Select an option on the left side and hit **Submit** to unlock the academic explanation here!
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 md:p-8 text-center shadow-lg space-y-6"
          >
            <Award size={64} className="mx-auto text-amber-500 animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Cognitive Quiz Completed!</h3>
              <p className="text-sm text-gray-500">
                You scored <span className="font-bold text-rose-500 text-lg">{score}</span> out of{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{QUIZ_QUESTIONS.length}</span> correct answers.
              </p>
            </div>

            {/* Performance status banner */}
            <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-850 inline-block w-full text-xs text-gray-600 dark:text-gray-400">
              {score === QUIZ_QUESTIONS.length ? (
                <span>🏆 **Mastermind Status!** You scored a perfect 10/10! You fully understand exactly how Modern LLMs function!</span>
              ) : score >= 8 ? (
                <span>🥇 **Outstanding Architect!** You scored {score}/10. You have an exceptional grasp of attention mechanics and alignment!</span>
              ) : score >= 6 ? (
                <span>🥈 **Certified Practitioner!** You scored {score}/10. You have a solid grasp on tokenizer math and context vectors!</span>
              ) : (
                <span>🌱 **Budding Explorer!** You scored {score}/10 and didn&apos;t pass the 60% mark. Re-explore the handbook chapters to unlock your LLM Graduate diploma!</span>
              )}
            </div>

            {/* Name Input for Certification generation */}
            {score >= 6 && (
              <div className="border-t border-gray-150 dark:border-gray-800 pt-5 space-y-4 text-left">
                <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900 rounded-xl p-4 flex gap-3">
                  <Award className="text-amber-500 shrink-0 mt-0.5" size={24} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide font-mono">
                      Visual AI Certification Unlocked!
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                      Since you scored {score}/10, you have qualified for the prestigious **Certificate of LLM & Attention Cognitive Architecture**. Enter your name below to generate your custom diploma card:
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider pl-0.5">
                    Your Name (For Certification Printout)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-855 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500 text-gray-800 dark:text-white"
                      placeholder="e.g. Marie Curie, PhD"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                    />
                    <button
                      onClick={() => setShowCertificate(true)}
                      disabled={!candidateName.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-xs cursor-pointer transition-all shrink-0"
                    >
                      Generate Diploma
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Beautiful Diploma/Certificate Card Representation */}
            {showCertificate && score >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6"
              >
                {/* Print layout overrides inside a custom style block so ONLY the diploma prints on paper */}
                <style>{`
                  @media print {
                    header, footer, aside, button, nav, input, label, .print\\:hidden {
                      display: none !important;
                      height: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    body {
                      background: white !important;
                      color: black !important;
                    }
                    #printable-certificate-card {
                      position: fixed !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      border: 12px double #b45309 !important;
                      background-color: #fafaf9 !important;
                      color: #1c1917 !important;
                      margin: 0 !important;
                      padding: 40px !important;
                      z-index: 9999999 !important;
                      display: block !important;
                      box-shadow: none !important;
                    }
                  }
                `}</style>

                {/* Main Visible Certificate */}
                <div
                  id="printable-certificate-card"
                  className="bg-stone-50 dark:bg-stone-900 border-8 border-double border-amber-600 rounded-2xl p-6 md:p-8 space-y-6 text-center select-none shadow-md relative overflow-hidden"
                >
                  {/* Decorative background vectors */}
                  <div className="absolute right-0 top-0 opacity-5 pointer-events-none text-right">
                    <span className="text-[120px] font-black font-mono select-none">AI</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 font-mono tracking-widest block">
                      HONORIS CAUSA CERTIFICATE
                    </span>
                    <h4 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 italic tracking-wide">
                      LLM Simply Explained Series
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                      THIS CREDENTIAL DECREES AND CONFIRMS THAT
                    </p>
                    
                    <h2 className="text-2xl sm:text-3xl font-serif font-black underline decoration-amber-500 tracking-tight text-amber-800 dark:text-amber-400 py-1.5 capitalize">
                      {candidateName || "Graduate Scholar"}
                    </h2>

                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                      has successfully passed the comprehensive evaluation board under academic metrics. The scholar demonstrated flawless command of Byte-Pair Encoding (BPE) subword parsing, vector coordinates similarity matrix mapping, dynamic multi-headed Query-Key-Value self-attention contexts, output softmax probability sampling, and supervised safety alignment (RLHF).
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between items-center max-w-sm mx-auto text-left py-2 border-t border-stone-200 dark:border-stone-800 font-mono text-[9px] text-stone-400">
                    <div>
                      <p className="font-bold text-stone-600 dark:text-stone-300">GRADE PERFORMANCE</p>
                      <p className="text-amber-600 dark:text-amber-400">Outstanding ({(score / QUIZ_QUESTIONS.length * 100).toFixed(0)}% Score)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-600 dark:text-stone-300">ISSUED DATE</p>
                      <p>{new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>

                  {/* Stamp seal element */}
                  <div className="flex justify-center items-center gap-4 pt-1">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-600 flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 shrink-0 transform rotate-12">
                      <span className="text-[8px] font-mono font-bold text-amber-700 dark:text-amber-400 text-center uppercase tracking-tighter">
                        BOARD APPROVED
                      </span>
                    </div>
                    <div className="text-left font-serif text-[10px] text-stone-500 dark:text-stone-400">
                      <p className="italic underline decoration-stone-400 dark:decoration-stone-700">Digital Validation Cryptographic Anchor</p>
                      <span className="font-mono text-[8px] text-stone-400 uppercase">SHA-256 ID: b8aed54b-c3d9-47eb-abf9-60628a</span>
                    </div>
                  </div>

                  {/* Print action trigger inside modal */}
                  <div className="pt-3 print:hidden">
                    <button
                      onClick={triggerCertificatePrint}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs gap-1.5 flex items-center justify-center mx-auto transition-all cursor-pointer shadow-sm"
                    >
                      <Award size={14} /> Print / Save PDF Certificate
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 justify-center items-center pt-4 print:hidden">
              <button
                onClick={handleRestart}
                className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold py-3 px-6 rounded-xl text-xs md:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={16} /> Take Quiz Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
