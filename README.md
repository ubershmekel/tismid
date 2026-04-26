# TismID

A playful self-reflection quiz that produces a shareable neurodivergence
identity card image. The spectrum is vast, it could be nice to have a simple
model to communicate about it.

[Try TismID](https://ubershmekel.github.io/tismid/)

25 questions across 5 neurodivergent trait categories. No backend, no login, no
data collection.

## Stack

- Vue 3 + `<script setup>`
- TypeScript
- Vite
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export

## Getting started

```bash
npm install
npm run dev
```

## Categories

| Category                 | Questions | Score range |
| ------------------------ | --------- | ----------- |
| Sensory Sensitivity      | 5         | 0–15        |
| Social Processing Load   | 5         | 0–15        |
| Structure Preference     | 5         | 0–15        |
| Detail Focus             | 5         | 0–15        |
| Executive Function Load  | 5         | 0–15        |

**Total: 0–75**

Answers map to 0 (Never) → 3 (Often). Labels: Low (0–4), Medium (5–9), High
(10–15).

## Share card

On the results screen, TismID can generate a PNG, copy a text summary, or open
the native share flow where supported.

- On supported browsers (mobile Safari, Chrome Android): native share sheet with
  the image file
- Download image: direct PNG download
- Copy text: plain text score summary for pasting anywhere

## Debug helpers

Open [`?debugrandom`](https://ubershmekel.github.io/tismid/?debugrandom) to
generate random answers for every question, save them as completed progress, and
jump straight to the results screen.

## Project structure

```
src/
  types.ts          — Question, Answers, CategoryInfo
  questions.ts      — 25 questions, category metadata, score helpers
  App.vue           — root, manages quiz/results screen state
  components/
    QuizScreen.vue  — one question at a time, answer debounce, auto-advance
    ResultsScreen.vue — animated bar charts, share/download/copy controls
    ShareCard.vue   — fixed-width card rendered off-screen for image export
  style.css         — global reset and CSS variables
```

## Build

```bash
npm run build   # outputs to dist/
```
