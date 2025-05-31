import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"

export async function POST(request: NextRequest) {
  try {
    const { action = "generate_missing" } = await request.json()

    const client = await clientPromise
    const db = client.db("stewart-calculus")

    if (action === "generate_missing") {
      // Find topics without content
      const existingContent = await db.collection("content").find({}).toArray()
      const existingTopicIds = new Set(existingContent.map((c) => c.topicId))

      const missingTopics = stewartTopics.filter((topic) => !existingTopicIds.has(topic.id))

      if (missingTopics.length === 0) {
        return NextResponse.json({
          success: true,
          message: "All topics have content",
          generated: 0,
        })
      }

      // Generate content for up to 3 topics at a time to avoid timeouts
      const topicsToGenerate = missingTopics.slice(0, 3)
      let generated = 0

      for (const topic of topicsToGenerate) {
        try {
          // Generate content using Gemini
          const content = await generateComprehensiveContentWithGemini(topic)

          await db.collection("content").insertOne({
            ...content,
            topicId: topic.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            quality_reviewed: false,
          })

          generated++
        } catch (error) {
          console.error(`Error generating content for ${topic.id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Generated content for ${generated} topics`,
        generated,
        remaining: missingTopics.length - generated,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Error in background generation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateComprehensiveContentWithGemini(topic: any) {
  // Generate all content using Gemini for consistency
  const [explanation, summary, example, practiceProblems] = await Promise.all([
    generateExplanationWithGemini(topic),
    generateSummaryWithGemini(topic),
    generateExampleWithGemini(topic),
    generatePracticeProblemsWithGemini(topic, 3),
  ])

  return {
    explanation,
    summary,
    example,
    practiceProblems,
  }
}

async function generateExplanationWithGemini(topic: any) {
  try {
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: prompts.contentGeneration.explanation(topic),
      temperature: 0.2,
    })
    return text
  } catch (error) {
    console.error("Error generating explanation:", error)
    return `<h3>Key Concept</h3><p>${topic.description}</p>`
  }
}

async function generateSummaryWithGemini(topic: any) {
  try {
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: prompts.contentGeneration.summary(topic),
      temperature: 0.3,
    })
    return text
  } catch (error) {
    console.error("Error generating summary:", error)
    return `<h3>Summary</h3><p>${topic.description}</p>`
  }
}

async function generateExampleWithGemini(topic: any) {
  try {
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: prompts.contentGeneration.example(topic),
      temperature: 0.3,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return {
      problem: `Example for ${topic.title}`,
      solution: "Solution steps",
      steps: ["Step 1", "Step 2", "Step 3"],
      marks: 4,
    }
  } catch (error) {
    console.error("Error generating example:", error)
    return {
      problem: `Example for ${topic.title}`,
      solution: "Solution steps",
      steps: ["Step 1", "Step 2", "Step 3"],
      marks: 4,
    }
  }
}

async function generatePracticeProblemsWithGemini(topic: any, count: number) {
  const problems = []

  for (let i = 0; i < count; i++) {
    try {
      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompts.examQuestion(topic, i % 2 === 0 ? "Multiple Choice" : "Full Solution"),
        temperature: 0.7,
      })

      // Parse the exam question format
      const parsed = parseExamQuestionOutput(text)
      if (parsed) {
        problems.push({
          id: `${topic.id}_bg_${Date.now()}_${i}`,
          problem: parsed.question,
          answer:
            parsed.questionType === "Multiple Choice" ? parsed.correctOption || "" : extractFinalAnswer(parsed.answer),
          hint: parsed.hint,
          solution: parsed.answer,
          difficulty: parsed.mark >= 5 ? "hard" : parsed.mark >= 3 ? "medium" : "easy",
          tags: [topic.id, "background-generated"],
          quality_score: 0.9,
          created_by: "gemini",
          questionType: parsed.questionType,
          mark: parsed.mark,
          options: parsed.options,
          correctOption: parsed.correctOption,
        })
      }
    } catch (error) {
      console.error("Error generating practice problem:", error)
    }
  }

  return problems
}

// Import the utility functions
function parseExamQuestionOutput(rawText: string) {
  // Implementation from utils.ts
  const result: any = {}

  const topicMatch = rawText.match(/\[Topic: (.*?)\]/)
  if (topicMatch) result.topic = topicMatch[1].trim()

  const typeMatch = rawText.match(/\[Question Type: (Multiple Choice|Full Solution)\]/)
  if (typeMatch) result.questionType = typeMatch[1].trim()

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
      const optionLines = optionsText.split(/\s*$$[a-e]$$\s*/).filter(Boolean)
      result.options = optionLines.map(
        (line: string, index: number) => `(${String.fromCharCode(97 + index)}) ${line.trim()}`,
      )

      const correctOptionMatch = optionsText.match(/$$Correct: ([a-e])$$/)
      if (correctOptionMatch) {
        result.correctOption = correctOptionMatch[1].trim()
      }
    }
  }

  return result.topic && result.questionType && result.question ? result : null
}

function extractFinalAnswer(solution: string): string {
  const finalAnswerMatch = solution.match(/Final Answer:\s*([\s\S]*)/i)
  if (finalAnswerMatch && finalAnswerMatch[1]) {
    return finalAnswerMatch[1].trim()
  }
  const lines = solution
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 0) {
    return lines[lines.length - 1]
  }
  return solution
}
