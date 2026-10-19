# LLM Simply Explained

An interactive guide that explains how large language models work, step by step: tokenization, embeddings, self-attention, next-token sampling and training. Each concept has a small hands-on visualization, and the guide ends with a quiz and a slide deck you can print.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

## Sections

| Section | What it shows |
|---------|---------------|
| **The Super-Autocomplete Concept** | An introduction to LLMs as next-word predictors |
| **Tokenization** | Splits your text into colour-coded tokens with token IDs and byte views |
| **Embeddings** | An interactive 2D map where related words cluster together |
| **Self-Attention** | Attention weights between words in example sentences |
| **Next-Token Playground** | Temperature and Top-P sliders that reshape a next-token probability distribution live |
| **Machine School** | The training stages: pre-training, fine-tuning and RLHF |
| **Knowledge Check** | A multiple-choice quiz with explanations and a score |
| **Slide Deck & Handbook** | Slides for presenting, plus a handout view you can print |

A progress bar tracks which sections you've visited. The interface follows your system's light or dark mode setting.

All demos run entirely in the browser using pre-defined example data. No model or API is called.

## Tech stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (animations) and Lucide icons

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Run locally

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000.

### Build

```bash
npm run build     # outputs static files to dist/
npm run preview   # preview the production build
```

### Environment variables

None are needed. `.env.example` comes from the AI Studio template and lists `GEMINI_API_KEY` and `APP_URL`, but the current code doesn't use them.

## Project structure

```
src/App.tsx                       Layout, section navigation, progress tracking
src/components/TokenizerSection.tsx
src/components/EmbeddingSection.tsx
src/components/AttentionSection.tsx
src/components/PlaygroundSection.tsx
src/components/TrainingSection.tsx
src/components/QuizSection.tsx
src/components/PresentationMode.tsx
src/types.ts
```
