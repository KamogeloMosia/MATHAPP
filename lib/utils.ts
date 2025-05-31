import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ParsedExamQuestion {
  topic: string
  questionType: "Multiple Choice" | "Full Solution"
  question: string
  mark: number
  answer: string // This will contain the solution steps if full-solution
  hint: string
  options?: string[] // Array of options, e.g., ["(a) 5", "(b) 6", ...]
  correctOption?: string // e.g., "b"
}

export function parseExamQuestionOutput(rawText: string): ParsedExamQuestion | null {
  const result: Partial<ParsedExamQuestion> = {}

  const topicMatch = rawText.match(/\[Topic: (.*?)\]/)
  if (topicMatch) result.topic = topicMatch[1].trim()

  const typeMatch = rawText.match(/\[Question Type: (Multiple Choice|Full Solution)\]/)
  if (typeMatch) result.questionType = typeMatch[1].trim() as "Multiple Choice" | "Full Solution"

  const questionMatch = rawText.match(/\[Question: ([\s\S]*?)\]/)
  if (questionMatch) result.question = questionMatch[1].trim()

  const markMatch = rawText.match(/\[Mark: (\d+) marks?\]/)
  if (markMatch) result.mark = Number.parseInt(markMatch[1], 10)

  const answerMatch = rawText.match(/\[Answer: ([\s\S]*?)\]/)
  if (answerMatch) result.answer = answerMatch[1].trim()

  const hintMatch = rawText.match(/\[Hint: ([\s\S]*?)\]/)
  if (hintMatch) result.hint = hintMatch[1].trim()

  if (result.questionType === "Multiple Choice") {
    const optionsMatch = rawText.match(/\[If MCQ: Options ([\s\S]*?)\]/)
    if (optionsMatch) {
      const optionsText = optionsMatch[1].trim()
      // Split by (a), (b), etc. and filter out empty strings
      const optionLines = optionsText.split(/\s*$$[a-e]$$\s*/).filter(Boolean)
      result.options = optionLines.map((line, index) => `(${String.fromCharCode(97 + index)}) ${line.trim()}`)

      const correctOptionMatch = optionsText.match(/$$Correct: ([a-e])$$/)
      if (correctOptionMatch) {
        result.correctOption = correctOptionMatch[1].trim()
      }
    }
  }

  // Basic validation to ensure all critical fields are present
  if (!result.topic || !result.questionType || !result.question || !result.mark || !result.answer || !result.hint) {
    console.error("Failed to parse all required fields from AI output:", result)
    return null
  }

  return result as ParsedExamQuestion
}

// Helper to extract final answer from a detailed solution string
export function extractFinalAnswer(solution: string): string {
  const finalAnswerMatch = solution.match(/Final Answer:\s*([\s\S]*)/i)
  if (finalAnswerMatch && finalAnswerMatch[1]) {
    return finalAnswerMatch[1].trim()
  }
  // Fallback: if no explicit "Final Answer:", try to get the last line or a concise part
  const lines = solution
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 0) {
    return lines[lines.length - 1]
  }
  return solution // Return full solution if no clear final answer found
}
