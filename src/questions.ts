import type { Question, CategoryInfo } from "./types";

export const questions: Question[] = [
  // Sensory Sensitivity
  {
    id: 1,
    text: "Bright lights or loud environments feel overwhelming",
    category: "sensory",
  },
  {
    id: 2,
    text: "Certain textures (clothing, food, surfaces) bother me more than others notice",
    category: "sensory",
  },
  {
    id: 3,
    text: "I notice small background sounds that others ignore",
    category: "sensory",
  },
  {
    id: 4,
    text: "I need to control my environment (lighting, noise, etc.) to feel comfortable",
    category: "sensory",
  },
  {
    id: 5,
    text: "Busy environments leave me drained or overloaded",
    category: "sensory",
  },

  // Social Intuition
  {
    id: 6,
    text: "I miss subtle social cues (tone, facial expressions, hints)",
    category: "social",
  },
  {
    id: 7,
    text: "I prefer people to say things directly instead of implying them",
    category: "social",
  },
  {
    id: 8,
    text: "I realize social expectations only after the fact",
    category: "social",
  },
  {
    id: 9,
    text: "Group conversations are hard to follow or jump into smoothly",
    category: "social",
  },
  {
    id: 10,
    text: "I consciously analyze social situations rather than intuitively picking them up",
    category: "social",
  },

  // Structure Preference
  {
    id: 11,
    text: "I like having clear plans or systems before starting something",
    category: "structure",
  },
  {
    id: 12,
    text: "Unexpected changes to plans feel stressful or frustrating",
    category: "structure",
  },
  {
    id: 13,
    text: "I enjoy organizing things (lists, systems, categories)",
    category: "structure",
  },
  {
    id: 14,
    text: "I feel better when my day has a predictable structure",
    category: "structure",
  },
  {
    id: 15,
    text: "I prefer clear rules or expectations over ambiguity",
    category: "structure",
  },

  // Detail Focus
  {
    id: 16,
    text: "I notice small inconsistencies or errors others miss",
    category: "detail",
  },
  {
    id: 17,
    text: "I get absorbed in specific details rather than the big picture",
    category: "detail",
  },
  {
    id: 18,
    text: "I care more about precision than speed",
    category: "detail",
  },
  {
    id: 19,
    text: "I enjoy refining or optimizing small parts of something",
    category: "detail",
  },
  {
    id: 20,
    text: "I lose track of the bigger goal while focusing on details",
    category: "detail",
  },

  // Executive Function
  {
    id: 21,
    text: "I find it hard to stop an activity and switch to something else",
    category: "action",
  },
  {
    id: 22,
    text: "I get pulled away from tasks by more stimulating things",
    category: "action",
  },
  {
    id: 23,
    text: "I lose track of time when absorbed in something",
    category: "action",
  },
  {
    id: 24,
    text: "I can hyperfocus intensely on things that interest me",
    category: "action",
  },
  {
    id: 25,
    text: "I put off starting tasks even when I genuinely want to do them",
    category: "action",
  },
];

export const categoryInfoList: CategoryInfo[] = [
  {
    key: "sensory",
    name: "Sensory Sensitivity",
    shortName: "Sensory",
    color: "#e8825a",
    cssVar: "--c-sensory",
  },
  {
    key: "social",
    name: "Social Friction",
    shortName: "Social",
    color: "#4aa8d8",
    cssVar: "--c-social",
  },
  {
    key: "structure",
    name: "Bias to Structure",
    shortName: "Structure",
    color: "#9b7edc",
    cssVar: "--c-structure",
  },
  {
    key: "detail",
    name: "Bias to Detail",
    shortName: "Detail",
    color: "#52b788",
    cssVar: "--c-detail",
  },
  {
    key: "action",
    name: "Executive Function Cost",
    shortName: "Executive",
    color: "#d4a82a",
    cssVar: "--c-action",
  },
];

export const ANSWER_LABELS = ["Never", "Rarely", "Sometimes", "Often"] as const;

export function getScoreLabel(score: number): string {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  return "High";
}

export function getCategoryScore(
  answers: Record<number, number>,
  category: string,
): number {
  return questions
    .filter((q) => q.category === category)
    .reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}
