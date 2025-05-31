export interface Chapter {
  _id?: string
  id: string
  title: string
  description: string
  order: number
  topics: string[]
}

export interface Topic {
  _id?: string
  id: string
  chapterId: string
  title: string
  description: string
  order: number
}

export interface Content {
  _id?: string
  topicId: string
  explanation: string
  summary: string
  example: {
    problem: string
    solution: string
    steps: string[]
  }
  practiceProblems: {
    id: string
    problem: string
    answer: string
    hint?: string
    solution: string
    difficulty: "easy" | "medium" | "hard"
    tags: string[]
    quality_score?: number
    created_by: "groq" | "gemini" | "manual" | "puter"
  }[]
  createdAt: Date
  updatedAt: Date
  version: number
  quality_reviewed: boolean
}

export interface UserProgress {
  _id?: string
  userId?: string
  topicId: string
  completed: boolean
  score: number
  lastAccessed: Date
}

export interface QuestionBank {
  _id?: string
  topicId: string
  questions: {
    id: string
    problem: string
    answer: string
    hint?: string
    solution: string
    difficulty: "easy" | "medium" | "hard"
    tags: string[]
    quality_score: number
    created_by: "groq" | "gemini" | "manual" | "puter"
    created_at: Date
    last_used: Date
    usage_count: number
    user_ratings: number[]
  }[]
  last_updated: Date
}

// New interface for content extracted from EPUB
export interface EpubContent {
  _id?: string
  epubTitle: string
  chapterTitle: string
  chapterContent: string // Raw text content of the chapter
  generatedSummary: string
  generatedQuestions: {
    problem: string
    answer: string
    hint?: string
    solution: string
    difficulty: "easy" | "medium" | "hard"
    created_by: "groq" | "gemini" | "puter"
  }[]
  createdAt: Date
  updatedAt: Date
}
