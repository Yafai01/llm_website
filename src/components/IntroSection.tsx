import { Card, SectionHeader } from "./ui";

const ROADMAP = [
  { n: "01", title: "Tokenization", text: "Split text into sub-word pieces and map each to an ID." },
  { n: "02", title: "Embeddings", text: "Turn each ID into a vector whose position carries meaning." },
  { n: "03", title: "Self-attention", text: "Let every token pull in information from the tokens around it." },
  { n: "04", title: "Sampling", text: "Convert scores into probabilities and pick the next token." },
  { n: "05", title: "Training & alignment", text: "From raw text prediction to a helpful assistant." },
];

export default function IntroSection() {
  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Getting started" title="What is a large language model?">
        <p>
          You have probably used ChatGPT, Gemini or Claude. Underneath, each one is a{" "}
          <strong className="font-semibold text-slate-800">large language model (LLM)</strong>: a neural network
          trained to predict the next piece of text. This guide walks through how that works, one step at a time,
          with small interactive demos.
        </p>
      </SectionHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900">A very large autocomplete</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your phone keyboard suggests the next word. An LLM does the same job at a vastly larger scale: given all
            the text so far, it estimates how likely every possible next token is, picks one, appends it, and
            repeats.
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-900">How does that answer questions?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Given &ldquo;The capital of France is&rdquo;, text seen during training makes &ldquo;Paris&rdquo; by far
            the most likely continuation. Repeating that prediction step token by token produces whole answers,
            essays and code.
          </p>
        </Card>
      </div>

      <section aria-labelledby="roadmap-heading" className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 id="roadmap-heading" className="text-sm font-semibold text-slate-900">
          What you will cover
        </h3>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROADMAP.map((item) => (
            <li key={item.n} className="flex gap-3">
              <span className="font-mono text-xs font-semibold text-indigo-600">{item.n}</span>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          Then check your understanding with a short quiz, or present the material with the slide deck. Use the
          button at the bottom of each chapter to continue.
        </p>
      </section>
    </div>
  );
}
