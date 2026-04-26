import { questions } from './questions'
import type { Answers, AnswerValue } from './types'

const STORAGE_KEY = 'tismid.quizProgress'

export interface QuizProgress {
  answers: Answers
  currentIndex: number
  completed: boolean
}

function isAnswerValue(value: unknown): value is AnswerValue {
  return value === 0 || value === 1 || value === 2 || value === 3
}

function normalizeProgress(value: unknown): QuizProgress | null {
  if (!value || typeof value !== 'object') return null

  const progress = value as Partial<QuizProgress>
  const answers: Answers = {}
  const validIds = new Set(questions.map(q => q.id))

  if (progress.answers && typeof progress.answers === 'object') {
    for (const [id, answer] of Object.entries(progress.answers)) {
      const questionId = Number(id)
      if (validIds.has(questionId) && isAnswerValue(answer)) {
        answers[questionId] = answer
      }
    }
  }

  const maxIndex = questions.length - 1
  const currentIndex = Number.isInteger(progress.currentIndex)
    ? Math.min(Math.max(progress.currentIndex as number, 0), maxIndex)
    : Math.min(Object.keys(answers).length, maxIndex)

  return {
    answers,
    currentIndex,
    completed: progress.completed === true,
  }
}

export function loadQuizProgress(): QuizProgress | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return normalizeProgress(JSON.parse(stored))
  } catch {
    return null
  }
}

export function saveQuizProgress(progress: QuizProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Progress persistence is a convenience; the quiz should still work without it.
  }
}

export function clearQuizProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
