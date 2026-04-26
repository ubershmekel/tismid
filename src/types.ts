export type Category = 'sensory' | 'social' | 'structure' | 'detail' | 'action'

export interface Question {
  id: number
  text: string
  category: Category
}

export type AnswerValue = 0 | 1 | 2 | 3

export type Answers = Record<number, AnswerValue>

export interface CategoryInfo {
  key: Category
  name: string
  shortName: string
  color: string
  cssVar: string
}
