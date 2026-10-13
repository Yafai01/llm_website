import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  Award,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  Layers,
  Network,
  Presentation,
  Sliders,
} from "lucide-react";

import IntroSection from "./components/IntroSection";
import TokenizerSection from "./components/TokenizerSection";
import EmbeddingSection from "./components/EmbeddingSection";
import AttentionSection from "./components/AttentionSection";
import PlaygroundSection from "./components/PlaygroundSection";
import TrainingSection from "./components/TrainingSection";
import QuizSection from "./components/QuizSection";
import PresentationMode from "./components/PresentationMode";

type SectionId =
  | "intro"
  | "tokenizer"
  | "embeddings"
  | "attention"
  | "playground"
  | "training"
  | "quiz"
  | "slides";

interface Section {
  id: SectionId;
  label: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>;
}

const SECTIONS: Section[] = [
  { id: "intro", label: "Introduction", icon: BookOpen },
  { id: "tokenizer", label: "1. Tokenization", icon: Layers },
  { id: "embeddings", label: "2. Embeddings", icon: Compass },
  { id: "attention", label: "3. Self-attention", icon: Network },
  { id: "playground", label: "4. Sampling", icon: Sliders },
  { id: "training", label: "5. Training & alignment", icon: GraduationCap },
  { id: "quiz", label: "Quiz", icon: Award },
  { id: "slides", label: "Slides & handout", icon: Presentation },
];

const isSectionId = (value: string): value is SectionId => SECTIONS.some((s) => s.id === value);

function sectionFromHash(): SectionId {
  const hash = window.location.hash.replace(/^#/, "");
  return isSectionId(hash) ? hash : "intro";
}

export default function App() {
  const [active, setActive] = useState<SectionId>(sectionFromHash);
  const [visited, setVisited] = useState<Set<SectionId>>(() => new Set([sectionFromHash()]));
  const contentRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const goTo = useCallback((id: SectionId) => {
    if (window.location.hash !== `#${id}`) window.location.hash = id;
    setActive(id);
  }, []);

  // Keep state in sync with the URL so chapters can be linked and the back button works.
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (isSectionId(hash)) setActive(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    setVisited((prev) => (prev.has(active) ? prev : new Set(prev).add(active)));
    // On small screens the chapter list scrolls horizontally; keep the current chapter visible.
    document
      .querySelector('nav[aria-label="Chapters"] [aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Move focus to the new chapter so keyboard and screen-reader users land on it.
    contentRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollIntoView({ block: "start" });
  }, [active]);

  const index = SECTIONS.findIndex((s) => s.id === active);
  const prev = SECTIONS[index - 1];
  const next = SECTIONS[index + 1];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 print:bg-white">
        <a
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            contentRef.current?.focus();
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>

        <header className="no-print z-50 lg:sticky lg:top-0 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <BrainCircuit size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-900">LLM Simply Explained</p>
                <p className="text-xs text-slate-500">An interactive guide to how language models work</p>
              </div>
            </div>

            <div className="w-full sm:w-56" aria-label="Reading progress">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span className="font-medium text-slate-700">
                  {visited.size} of {SECTIONS.length} viewed
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={SECTIONS.length}
                aria-valuenow={visited.size}
                aria-label="Chapters viewed"
              >
                <div
                  className="h-full rounded-full bg-indigo-600 transition-[width] duration-500"
                  style={{ width: `${(visited.size / SECTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-start gap-6 px-4 py-6 md:px-8 lg:grid-cols-12 lg:gap-8 lg:py-8 print:block print:p-0">
          <nav aria-label="Chapters" className="no-print lg:sticky lg:top-24 lg:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-2 lg:p-3">
              <p className="hidden px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:block">
                Contents
              </p>
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {SECTIONS.map((s) => {
                  const isActive = s.id === active;
                  const Icon = s.icon;
                  return (
                    <li key={s.id} className="shrink-0">
                      <a
                        href={`#${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(s.id);
                        }}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-indigo-50 font-medium text-indigo-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" className={isActive ? "text-indigo-600" : "text-slate-400"} />
                        <span className="flex-1">{s.label}</span>
                        {visited.has(s.id) && !isActive && (
                          <Check size={14} className="hidden text-slate-400 lg:block" aria-label="viewed" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <main
            id="main-content"
            ref={contentRef}
            tabIndex={-1}
            className="print-full min-w-0 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-5 focus:outline-none md:p-8 lg:col-span-9"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {active === "intro" && <IntroSection />}
                {active === "tokenizer" && <TokenizerSection />}
                {active === "embeddings" && <EmbeddingSection />}
                {active === "attention" && <AttentionSection />}
                {active === "playground" && <PlaygroundSection />}
                {active === "training" && <TrainingSection />}
                {active === "quiz" && <QuizSection />}
                {active === "slides" && <PresentationMode />}

                <div className="no-print mt-10 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
                  {prev ? (
                    <button
                      type="button"
                      onClick={() => goTo(prev.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      <span>
                        <span className="sr-only">Previous: </span>
                        {prev.label}
                      </span>
                    </button>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => goTo(next.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      <span>
                        <span className="sr-only">Next: </span>
                        {next.label}
                      </span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <p className="mx-auto max-w-7xl px-4">
            Everything runs in your browser. No language model is called; demos use small, clearly labelled examples.
          </p>
        </footer>
      </div>
    </MotionConfig>
  );
}
