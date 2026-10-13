import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Maximize,
  Minimize,
  Network,
  Presentation,
  Printer,
  Sliders,
} from "lucide-react";
import { encode, getDemoTokenizer } from "../lib/bpe";
import { add, getWord, subtract } from "../lib/embeddings";
import { softmax } from "../lib/sampling";
import { SectionHeader, buttonPrimary, buttonSecondary } from "./ui";

interface Slide {
  chapter: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>;
  points: { title: string; text: string }[];
  visualTitle: string;
  visual: () => ReactNode;
}

const mono = "font-mono text-xs text-slate-700";

function TokenRow({ text }: { text: string }) {
  const tokens = encode(text, getDemoTokenizer());
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((t, i) => (
        <span key={i} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs">
          {t.text.replace(/ /g, "␣")}
          <span className="ml-1 text-[10px] text-slate-400">{t.id}</span>
        </span>
      ))}
    </div>
  );
}

const TEMP_PROBS = [0.7, 0.2, 0.1];
const TEMP_TOKENS = ["Paris", "Lyon", "France"];
const TEMPS = [0.2, 1, 1.5];

const SLIDES: Slide[] = [
  {
    chapter: "Overview",
    title: "A very large autocomplete",
    subtitle: "What a large language model is and what it does",
    icon: BookOpen,
    points: [
      {
        title: "Billions of learned numbers",
        text: "A model is not a database of sentences. It is a neural network with billions of parameters, tuned during training to capture the statistics of language.",
      },
      {
        title: "One job: predict the next token",
        text: "Given the text so far, the model outputs a probability for every possible next token. Generating an answer means repeating this step token by token.",
      },
      {
        title: "GPT = Generative Pre-trained Transformer",
        text: "Pre-trained on large text corpora, built on the Transformer architecture introduced in the 2017 paper 'Attention Is All You Need'.",
      },
    ],
    visualTitle: "The pipeline",
    visual: () => (
      <ol className={`space-y-2 ${mono}`}>
        <li>1. Text: &ldquo;Hi there!&rdquo;</li>
        <li>
          2. Tokens (this site&rsquo;s demo tokenizer):
          <div className="mt-1">
            <TokenRow text="Hi there!" />
          </div>
        </li>
        <li>3. Embeddings: one vector per token</li>
        <li>4. Transformer layers: attention + MLP</li>
        <li>5. Softmax: a probability for every next token</li>
        <li>6. Sample one token, append, repeat</li>
      </ol>
    ),
  },
  {
    chapter: "Chapter 1",
    title: "Tokenization with byte-pair encoding",
    subtitle: "Why models read sub-word pieces instead of letters or whole words",
    icon: Layers,
    points: [
      {
        title: "The granularity trade-off",
        text: "Single characters make sequences long and slow. Whole words need an unbounded vocabulary and cannot handle new words. Sub-words sit in between.",
      },
      {
        title: "Byte-pair encoding (BPE)",
        text: "Start from bytes and repeatedly merge the most frequent adjacent pair into a new token. Common words become single tokens; rare words are built from pieces.",
      },
      {
        title: "Whitespace is part of the token",
        text: "Most tokenizers attach the leading space to a word, so ' hello' and 'hello' usually have different IDs.",
      },
    ],
    visualTitle: "Live output of the demo tokenizer",
    visual: () => (
      <div className="space-y-3">
        <TokenRow text="Tokenization is outstanding" />
        <p className="text-xs text-slate-500">
          Tiny vocabulary trained in the browser, so splits and IDs differ from production tokenizers.
        </p>
      </div>
    ),
  },
  {
    chapter: "Chapter 2",
    title: "Embeddings: meaning as coordinates",
    subtitle: "How token IDs become vectors that encode similarity",
    icon: Compass,
    points: [
      {
        title: "IDs carry no meaning",
        text: "Token 400 is not similar to token 401. Each ID selects a row of a learned embedding matrix: a vector of numbers.",
      },
      {
        title: "High-dimensional space",
        text: "Real models use hundreds to thousands of dimensions (GPT-3 used 12,288). Tokens used in similar contexts end up with similar vectors.",
      },
      {
        title: "Directions can carry relationships",
        text: "In learned embeddings, King − Man + Woman lands near Queen, approximately. Similarity is measured with cosine similarity or the dot product.",
      },
    ],
    visualTitle: "Toy 2D example [royalty, gender]",
    visual: () => {
      const k = getWord("King");
      const m = getWord("Man");
      const w = getWord("Woman");
      const r = add(subtract(k, m), w);
      const f = (v: { royalty: number; gender: number }) => `[${v.royalty}, ${v.gender}]`;
      return (
        <div className={`space-y-1 ${mono}`}>
          <div>King&nbsp;&nbsp;&nbsp;{f(k)}</div>
          <div>− Man&nbsp;&nbsp;{f(m)}</div>
          <div>+ Woman {f(w)}</div>
          <div className="border-t border-slate-200 pt-1 font-semibold text-slate-900">
            = {f(r)} → Queen {f(getWord("Queen"))}
          </div>
          <p className="pt-2 font-sans text-slate-500">Hand-picked coordinates for illustration.</p>
        </div>
      );
    },
  },
  {
    chapter: "Chapter 3",
    title: "Self-attention: query, key and value",
    subtitle: "How each token gathers context from the others",
    icon: Network,
    points: [
      {
        title: "Static vs contextual",
        text: "An embedding gives 'bank' one vector everywhere. Attention lets each token update its vector using the other tokens in the sentence.",
      },
      {
        title: "Query and key",
        text: "Each token's query is compared with every token's key. A high score means 'this token is relevant to me'.",
      },
      {
        title: "Value",
        text: "Scores are turned into weights with softmax, and each token receives the weighted sum of the other tokens' value vectors.",
      },
    ],
    visualTitle: "Scaled dot-product attention",
    visual: () => (
      <div className="space-y-2">
        <p className="rounded bg-white px-2 py-2 text-center font-mono text-sm text-slate-900">
          Attention(Q, K, V) = softmax(QKᵀ / √d) · V
        </p>
        <p className="text-xs leading-relaxed text-slate-600">
          Each row of softmax(QKᵀ/√d) sums to 1: it is how one token divides its attention across the sentence. Many
          heads run in parallel in every layer.
        </p>
      </div>
    ),
  },
  {
    chapter: "Chapter 4",
    title: "Sampling: softmax, temperature, top-k, top-p",
    subtitle: "How the next token is actually chosen",
    icon: Sliders,
    points: [
      {
        title: "Softmax",
        text: "The final layer outputs a logit per vocabulary token. Softmax turns them into positive probabilities that sum to 1.",
      },
      {
        title: "Temperature",
        text: "Logits are divided by T first. T < 1 concentrates probability on the top token; T > 1 spreads it out.",
      },
      {
        title: "Top-k and top-p",
        text: "Top-k keeps the k most likely tokens. Top-p keeps the smallest set whose probabilities reach p. The survivors are renormalised and one is drawn at random.",
      },
    ],
    visualTitle: "Temperature applied to [0.70, 0.20, 0.10]",
    visual: () => {
      const rows = TEMPS.map((t) => softmax(TEMP_PROBS.map(Math.log), t));
      return (
        <table className="w-full text-left font-mono text-xs text-slate-700">
          <caption className="sr-only">Probabilities of three tokens at different temperatures</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th scope="col" className="py-1 font-medium">Token</th>
              {TEMPS.map((t) => (
                <th scope="col" key={t} className="py-1 text-right font-medium">
                  T={t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEMP_TOKENS.map((tok, i) => (
              <tr key={tok}>
                <th scope="row" className="py-1 font-medium">{tok}</th>
                {rows.map((r, j) => (
                  <td key={j} className="py-1 text-right">
                    {(r[i] * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
  },
  {
    chapter: "Chapter 5",
    title: "Fine-tuning and alignment",
    subtitle: "Turning a text predictor into a helpful assistant",
    icon: GraduationCap,
    points: [
      {
        title: "Pre-training",
        text: "Next-token prediction on a very large corpus. Produces a capable base model that continues text but does not reliably follow instructions.",
      },
      {
        title: "Supervised fine-tuning (SFT)",
        text: "Further training on curated example conversations teaches the assistant format and direct answers.",
      },
      {
        title: "Learning from preferences (RLHF, DPO)",
        text: "People compare pairs of answers. Those comparisons steer the model towards helpful, honest and harmless responses, including declining harmful requests.",
      },
    ],
    visualTitle: "Example: before and after",
    visual: () => (
      <div className="space-y-2 text-xs leading-relaxed text-slate-700">
        <p>
          <span className="font-medium">Prompt:</span> &ldquo;Can you write a short poem about the sea?&rdquo;
        </p>
        <p>
          <span className="font-medium">Base model:</span> &ldquo;Can you write a short poem about the sky? Can you
          write…&rdquo; (continues the pattern)
        </p>
        <p>
          <span className="font-medium">Aligned model:</span> &ldquo;Sure. Grey waves fold and fall, / the tide keeps
          time for all…&rdquo;
        </p>
        <p className="text-slate-500">Illustrative example, not real model output.</p>
      </div>
    ),
  },
];

function SlideContent({ slide, headingLevel }: { slide: Slide; headingLevel: "h3" | "h4" }) {
  const Heading = headingLevel;
  const Icon = slide.icon;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="space-y-4 md:col-span-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{slide.chapter}</p>
          <Heading className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900 md:text-2xl">
            <Icon size={22} className="shrink-0 text-indigo-600" aria-hidden="true" />
            {slide.title}
          </Heading>
          <p className="mt-1 text-sm text-slate-500">{slide.subtitle}</p>
        </div>
        <ol className="space-y-3">
          {slide.points.map((p, i) => (
            <li key={p.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                <p className="text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="md:col-span-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-medium text-slate-500">{slide.visualTitle}</p>
          {slide.visual()}
        </div>
      </div>
    </div>
  );
}

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export default function PresentationMode() {
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState<"slides" | "handout">("slides");
  const [printPending, setPrintPending] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => setCurrent(Math.max(0, Math.min(SLIDES.length - 1, i))), []);

  // Keyboard navigation for the slideshow.
  useEffect(() => {
    if (view !== "slides") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          setCurrent((c) => Math.min(SLIDES.length - 1, c + 1));
          break;
        case "ArrowLeft":
        case "PageUp":
          setCurrent((c) => Math.max(0, c - 1));
          break;
        case "Home":
          setCurrent(0);
          break;
        case "End":
          setCurrent(SLIDES.length - 1);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === deckRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Print once the handout has rendered.
  useEffect(() => {
    if (printPending && view === "handout") {
      setPrintPending(false);
      window.print();
    }
  }, [printPending, view]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await deckRef.current?.requestFullscreen();
    } catch {
      // Fullscreen can be blocked (e.g. inside some iframes); the deck still works without it.
    }
  };

  const slide = SLIDES[current];
  const fullscreenSupported = typeof document !== "undefined" && document.fullscreenEnabled;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <SectionHeader eyebrow="Present or print" title="Slides & handout">
          <p>
            A six-slide summary of the guide. Present it in the browser (use the arrow keys to move between slides) or
            switch to the handout to read or print everything on one page.
          </p>
        </SectionHeader>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2">
        <div role="group" aria-label="View" className="inline-flex rounded-lg border border-slate-300 p-0.5">
          {(
            [
              ["slides", "Slides", Presentation],
              ["handout", "Handout", FileText],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                view === id ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        {view === "slides" && fullscreenSupported && (
          <button type="button" onClick={toggleFullscreen} className={buttonSecondary}>
            <Maximize size={15} aria-hidden="true" /> Full screen
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setView("handout");
            setPrintPending(true);
          }}
          className={buttonSecondary}
        >
          <Printer size={15} aria-hidden="true" /> Print handout
        </button>
      </div>

      {view === "slides" ? (
        <div
          ref={deckRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Slide deck"
          className={`no-print relative flex flex-col rounded-xl border border-slate-200 bg-white ${
            isFullscreen ? "h-full justify-center overflow-auto p-8 md:p-16" : "p-5 md:p-8"
          }`}
        >
          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <Minimize size={15} aria-hidden="true" /> Exit full screen
            </button>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${current + 1} of ${SLIDES.length}: ${slide.title}`}
              className="min-h-[380px]"
            >
              <SlideContent slide={slide} headingLevel="h3" />
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  aria-current={i === current ? "step" : undefined}
                  className="flex h-6 items-center px-0.5"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      i === current ? "w-6 bg-indigo-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500" aria-live="polite">
              Slide {current + 1} of {SLIDES.length}
              <span className="ml-2 hidden sm:inline">· Use ← → to navigate</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(current - 1)} disabled={current === 0} className={buttonSecondary}>
                <ChevronLeft size={16} aria-hidden="true" /> Previous
              </button>
              <button
                type="button"
                onClick={() => go(current + 1)}
                disabled={current === SLIDES.length - 1}
                className={buttonPrimary}
              >
                Next <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <article className="space-y-8">
          <header className="border-b-2 border-slate-900 pb-4">
            <h3 className="text-2xl font-semibold text-slate-900">LLM Simply Explained: handout</h3>
            <p className="mt-1 text-sm text-slate-500">
              A printable summary of how large language models turn text into predictions.
            </p>
          </header>
          {SLIDES.map((s) => (
            <section key={s.title} className="print-break-avoid border-b border-slate-200 pb-8 last:border-b-0">
              <SlideContent slide={s} headingLevel="h4" />
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
