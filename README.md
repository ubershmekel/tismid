# TismID

A playful self-reflection quiz that produces a shareable identity card image.

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

| Category             | Questions | Score range |
| -------------------- | --------- | ----------- |
| Sensory Sensitivity  | 5         | 0–15        |
| Social Intuition     | 5         | 0–15        |
| Structure Preference | 5         | 0–15        |
| Detail Focus         | 5         | 0–15        |
| Executive Function   | 5         | 0–15        |

**Total: 0–75**

Answers map to 0 (Never) → 3 (Often). Labels: Low (0–4), Medium (5–9), High
(10–15).

## Share card

On the results screen, "Share my TismID" generates a png.

- On supported browsers (mobile Safari, Chrome Android): native share sheet with
  the image file
- Fallback: direct PNG download

## Project structure

```
src/
  types.ts          — Question, Answers, CategoryInfo
  questions.ts      — 25 questions, category metadata, score helpers
  App.vue           — root, manages quiz/results screen state
  components/
    QuizScreen.vue  — one question at a time, answer debounce, auto-advance
    ResultsScreen.vue — animated bar charts, share button
    ShareCard.vue   — fixed-width card rendered off-screen for image export
  style.css         — global reset and CSS variables
```

## Build

```bash
npm run build   # outputs to dist/
```
