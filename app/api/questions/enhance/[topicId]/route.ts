import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"
import { parseExamQuestionOutput, extractFinalAnswer } from "@/lib/utils"

export async function POST(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params
    const { enhance_existing = false, add_new = true, target_count = 10 } = await request.json()

    const client = await clientPromise
    const db = client.db("stewart-calculus")

    const topic = stewartTopics.find((t) => t.id === topicId)
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    let questionBank = await db.collection("question_bank").findOne({ topicId })

    if (!questionBank) {
      questionBank = {
        topicId,
        questions: [],
        last_updated: new Date(),
      }
    }

    const updatedQuestions = [...questionBank.questions]
    let newQuestionsAdded = 0
    let questionsEnhanced = 0

    // Enhance existing questions if requested
    if (enhance_existing && questionBank.questions.length > 0) {
      const lowQualityQuestions = questionBank.questions.filter((q) => q.quality_score < 0.8).slice(0, 5) // Limit to 5 at a time

      for (const question of lowQualityQuestions) {
        // Use Gemini for enhancing questions
        const enhanced = await enhanceQuestion(topic, question, google("gemini-pro"))
        if (enhanced) {
          const index = updatedQuestions.findIndex((q) => q.id === question.id)
          if (index !== -1) {
            updatedQuestions[index] = {
              ...enhanced,
              id: question.id,
              created_at: question.created_at,
              last_used: question.last_used,
              usage_count: question.usage_count,
              user_ratings: question.user_ratings,
              quality_score: Math.min(enhanced.quality_score || 0.8, 1.0),
            }
            questionsEnhanced++
          }
        }
      }
    }

    // Add new questions if needed
    if (add_new && updatedQuestions.length < target_count) {
      const needed = target_count - updatedQuestions.length

      // Generate questions using both Groq and Gemini
      const [groqQuestions, geminiQuestions] = await Promise.all([
        generateExamQuestions(topic, Math.floor(needed / 2), groq("llama-3.3-70b-versatile"), "groq"),
        generateExamQuestions(topic, Math.ceil(needed / 2), google("gemini-pro"), "gemini"),
      ])

      // Add Groq questions
      for (const newQ of groqQuestions) {
        updatedQuestions.push({
          ...newQ,
          id: `${topicId}_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date(),
          last_used: new Date(),
          usage_count: 0,
          user_ratings: [],
        })
        newQuestionsAdded++
      }

      // Add Gemini questions
      for (const newQ of geminiQuestions) {
        updatedQuestions.push({
          ...newQ,
          id: `${topicId}_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date(),
          last_used: new Date(),
          usage_count: 0,
          user_ratings: [],
        })
        newQuestionsAdded++
      }
    }

    // Update the question bank
    await db.collection("question_bank").updateOne(
      { topicId },
      {
        $set: {
          questions: updatedQuestions,
          last_updated: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      questions_enhanced: questionsEnhanced,
      new_questions_added: newQuestionsAdded,
      total_questions: updatedQuestions.length,
    })
  } catch (error) {
    console.error("Error enhancing questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function enhanceQuestion(topic: any, question: any, model: any) {
  // Use the improved prompt from the centralized prompts file
  const enhancePrompt = prompts.questionEnhancement.improve(topic, question)

  try {
    const { text } = await generateText({
      model: model,
      prompt: enhancePrompt,
      temperature: 0.3,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error("Error enhancing question:", error)
    return null
  }
}

async function generateExamQuestions(topic: any, count: number, model: any, createdBy: string) {
  const questions = []
  for (let i = 0; i < count; i++) {
    try {
      const { text: rawProblemText } = await generateText({
        model: model,
        prompt: prompts.examQuestion(topic, i % 2 === 0 ? "Multiple Choice" : "Full Solution"), // Alternate MCQ/Full Solution
        temperature: 0.7,
      })

      const parsed = parseExamQuestionOutput(rawProblemText)

      if (parsed) {
        questions.push({
          problem: parsed.question,
          answer:
            parsed.questionType === "Multiple Choice" ? parsed.correctOption || "" : extractFinalAnswer(parsed.answer),
          hint: parsed.hint,
          solution: parsed.answer, // The 'answer' field from the prompt contains the full solution
          difficulty: parsed.mark >= 5 ? "hard" : parsed.mark >= 3 ? "medium" : "easy", // Infer difficulty from marks
          tags: [topic.id, parsed.questionType.toLowerCase().replace(" ", "-")],
          quality_score: 0.95, // High quality for exam-level questions
          created_by: createdBy,
          questionType: parsed.questionType,
          mark: parsed.mark,
          options: parsed.options,
          correctOption: parsed.correctOption,
        })
      }
    } catch (error) {
      console.error(`Error generating exam question with ${createdBy}:`, error)
    }
  }
  return questions
}
