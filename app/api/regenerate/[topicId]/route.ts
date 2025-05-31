import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"
import { parseExamQuestionOutput, extractFinalAnswer } from "@/lib/utils" // Import new utility

export async function POST(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params
    const { type } = await request.json() // 'example' or 'practice'

    const topic = stewartTopics.find((t) => t.id === topicId)
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    let newContent
    if (type === "example") {
      newContent = await generateExample(topic, google("gemini-pro"))
    } else if (type === "practice") {
      // Use the new examQuestion prompt for practice problems
      const { text: rawProblemText } = await generateText({
        model: google("gemini-pro"),
        prompt: prompts.examQuestion(topic, "auto"), // Let AI choose MCQ or Full Solution
        temperature: 0.7,
      })

      const parsed = parseExamQuestionOutput(rawProblemText)

      if (!parsed) {
        console.error("Failed to parse AI generated exam question for regeneration.")
        // Fallback to a default problem if parsing fails
        newContent = {
          problem: "Failed to generate new practice problem.",
          answer: "N/A",
          hint: "Try regenerating again.",
          solution: "No solution available.",
          difficulty: "medium",
          tags: [topic.id],
          quality_score: 0.5,
          created_by: "manual",
          questionType: "Full Solution",
          mark: 0,
        }
      } else {
        newContent = {
          problem: parsed.question,
          answer:
            parsed.questionType === "Multiple Choice" ? parsed.correctOption || "" : extractFinalAnswer(parsed.answer),
          hint: parsed.hint,
          solution: parsed.answer, // The 'answer' field from the prompt contains the full solution
          difficulty: parsed.mark >= 5 ? "hard" : parsed.mark >= 3 ? "medium" : "easy", // Infer difficulty from marks
          tags: [topic.id, parsed.questionType.toLowerCase().replace(" ", "-")],
          quality_score: 0.95,
          created_by: "gemini",
          questionType: parsed.questionType,
          mark: parsed.mark,
          options: parsed.options,
          correctOption: parsed.correctOption,
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Update the cached content in MongoDB
    const client = await clientPromise
    const db = client.db("stewart-calculus")

    const updateField = type === "example" ? { example: newContent } : { practiceProblems: [newContent] }

    await db.collection("content").updateOne(
      { topicId },
      {
        $set: {
          ...updateField,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ content: newContent })
  } catch (error) {
    console.error("Error regenerating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateExample(topic: any, model: any) {
  const prompt = `Generate a new worked example for the calculus topic: "${topic.title}". 
  Return only a JSON object with this structure:
  {
    "problem": "Example problem with LaTeX notation",
    "solution": "Complete solution with LaTeX",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }`

  const { text } = await generateText({
    model: model,
    prompt,
    temperature: 0.7,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch
    ? JSON.parse(jsonMatch[0])
    : {
        problem: "New example for " + topic.title,
        solution: "Solution with steps",
        steps: ["Step 1", "Step 2", "Step 3"],
      }
}
