# LLM Simply Explained

An interactive, browser-only guide to how large language models work, from tokenization to sampling and alignment.

Live site: https://llm-website-one.vercel.app

## What it does

The site walks a reader through the pipeline inside an LLM, one chapter at a time, with a small interactive demo in each:

| Chapter | Demo | How real it is |
| --- | --- | --- |
| 1. Tokenization | Type any text and see it split into tokens, with IDs, UTF-8 bytes and the merge that produced each token | A working byte-level BPE tokenizer. Its ~500-token vocabulary is trained in the browser on a short built-in paragraph, so splits and IDs differ from production tokenizers. |
| 2. Embeddings | 2D chart of words; step through King − Man + Woman and find the nearest word | Hand-picked toy coordinates. The vector arithmetic and nearest-neighbour search are computed. |
| 3. Self-attention | Pick an ambiguous sentence and see where each word "looks" | Hand-written attention weights (each row sums to 1). Not taken from a real model. |
| 4. Sampling | Adjust temperature, top-k and top-p, then draw tokens and compare observed frequencies | Candidate words and starting probabilities are hand-picked. The softmax, temperature, top-k, top-p, renormalisation and weighted draw are the real algorithms. |
| 5. Training & alignment | Pre-training, SFT and RLHF explained; act as a human rater on example answer pairs | Responses are hand-written examples. Votes are compared with a reference choice and train nothing. |
| Quiz | 10 questions with explanations and a printable self-assessment record | Scored in the browser. The record is not an accredited certificate. |
| Slides & handout | Six-slide summary with keyboard navigation and full screen, plus a printable handout | Slide figures are computed from the same code as the demos. |

Every illustrative demo is labelled as such in the UI. No language model or external API is called.

## Features

- Chapter navigation with deep links (`/#tokenizer`, `/#playground`, ...) and browser back/forward support
- Keyboard accessible: skip link, visible focus states, real radio buttons in the quiz, ARIA tabs in the training chapter
- Slide deck keyboard shortcuts: Left/Right arrows or Page Up/Down to move, Home/End for first/last slide
- Print styles for the handout and the quiz completion record
- Responsive layout from phone to desktop; respects "reduce motion"

## Current limitations

- The tokenizer's vocabulary is tiny, so it splits many ordinary words into several pieces and its IDs match no real model.
- Embedding coordinates, attention weights, next-token candidates and preference examples are hand-authored for teaching.
- Progress (chapters viewed) is kept in memory only and resets on reload.
- Light theme only.

## Tech stack

React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion (animations), lucide-react (icons). Vitest for tests, ESLint for linting.

## Project structure

```
src/
  App.tsx                 Layout, chapter navigation, hash routing
  components/
    ui.tsx                Shared UI pieces (section header, cards, demo notice, button styles)
    IntroSection.tsx
    TokenizerSection.tsx
    EmbeddingSection.tsx
    AttentionSection.tsx
    PlaygroundSection.tsx  Sampling playground
    TrainingSection.tsx
    QuizSection.tsx
    PresentationMode.tsx  Slides and printable handout
  lib/
    bpe.ts                Byte-level BPE trainer, encoder and decoder
    sampling.ts           Softmax, temperature, top-k, top-p, weighted sampling
    quiz.ts               Questions and scoring
    embeddings.ts         Toy 2D word vectors and vector maths
    attention.ts          Hand-authored attention examples
    *.test.ts             Unit tests
```

## Prerequisites

Node.js 22.12 or newer (required by Vitest 5) and npm.

## Setup and commands

```bash
npm ci              # install exact dependency versions from package-lock.json
npm run dev         # start the dev server on http://localhost:3000
npm run build       # type-check and build static files into dist/
npm run preview     # serve the production build locally
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm test            # run the Vitest suite once
```

No environment variables are needed.

## Tests

`npm test` runs unit tests for the sampling maths (softmax against known values, temperature, top-k, top-p, renormalisation, the weighted draw), quiz scoring and pass thresholds, the BPE tokenizer (training, round-trip encoding of any Unicode text, byte fallback), and consistency checks on the hand-authored content (attention rows sum to 1, King − Man + Woman lands on Queen).

## Deployment

The build output in `dist/` is a static site and can be hosted anywhere. The live site is deployed on Vercel with the Vite preset (build command `npm run build`, output directory `dist`).

## License

No license has been chosen yet. All rights reserved by the author until a license file is added.
