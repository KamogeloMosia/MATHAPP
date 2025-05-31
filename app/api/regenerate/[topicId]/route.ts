import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { stewartTopics } from "@/lib/stewart-data"

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
      newContent = await generateExample(topic)
    } else if (type === "practice") {
      newContent = await generatePracticeProblem(topic)
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

async function generateExample(topic: any) {
  const prompt = `Generate a new worked example for the calculus topic: "${topic.title}". 
  Return only a JSON object with this structure:
  {
    "problem": "Example problem with LaTeX notation",
    "solution": "Complete solution with LaTeX",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }`

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
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

async function generatePracticeProblem(topic: any) {
  const prompt = `Generate a new practice problem for the calculus topic: "${topic.title}".
  Return only a JSON object with this structure:
  {
    "problem": "Practice problem with LaTeX notation",
    "answer": "Answer",
    "hint": "Helpful hint",
    "solution": "Step-by-step solution"
  }`

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
    temperature: 0.7,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch
    ? JSON.parse(jsonMatch[0])
    : {
        problem: "New practice problem for " + topic.title,
        answer: "Answer",
        hint: "Hint",
        solution: "Solution",
      }
}
