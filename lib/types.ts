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
    questionType: "Multiple Choice" | "Full Solution"
    mark?: number
    options?: string[]
    correctOption?: string
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
  questionsAttempted: number
  questionsCorrect: number
  currentStreak: number
  bestStreak: number
  masteryLevel: number
  // New gamification fields
  totalPoints: number
  bonusPoints: number
  challengesCompleted: number
  studyStreak: number // consecutive days studied
  achievements: string[]
  level: number
  experiencePoints: number
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
    questionType: "Multiple Choice" | "Full Solution"
    mark?: number
    options?: string[]
    correctOption?: string
  }[]
  last_updated: Date
}

export interface EpubContent {
  _id?: string
  epubTitle: string
  chapterTitle: string
  chapterContent: string
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

// New interfaces for gamification
export interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "bonus"
  pointsReward: number
  requirements: {
    questionsCorrect?: number
    topicsCompleted?: number
    streakDays?: number
  }
  expiresAt?: Date
  isCompleted: boolean
}

export interface AICoach {
  motivationalMessage: string
  studyTip: string
  currentChallenge: Challenge
  encouragement: string
  nextRecommendation: {
    type: "topic" | "chapter" | "review"
    id: string
    title: string
    reason: string
  }
}
