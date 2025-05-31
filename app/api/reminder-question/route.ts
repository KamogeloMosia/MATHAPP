import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { prompts } from "@/lib/ai-prompts"
import { stewartTopics } from "@/lib/stewart-data"

export async function GET() {
  try {
    // Select 3-5 random topics for the reminder question
    const shuffledTopics = stewartTopics.sort(() => 0.5 - Math.random())
    const selectedTopics = shuffledTopics.slice(0, 3).map((t) => t.title)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompts.reminderQuestion(selectedTopics),
    })

    // Parse the JSON response
    let questionData
    try {
      questionData = JSON.parse(text)
    } catch {
      // Fallback if JSON parsing fails
      questionData = {
        question: "What is the derivative of $x^2$?",
        answer: "$2x$",
        explanation: "Use the power rule: bring down the exponent and subtract 1. Remember: 'Power down, power down!'",
        topic: "Basic Derivatives",
        timeEstimate: "30 seconds",
        encouragement: "Great job! You're building strong calculus foundations! 🚀",
        mnemonic: "Power Rule: 'Bring it down, knock it down!'",
      }
    }

    return NextResponse.json(questionData)
  } catch (error) {
    console.error("Error generating reminder question:", error)

    // Fallback question
    return NextResponse.json({
      question: "Quick check: What's $\\frac{d}{dx}[x^3]$?",
      answer: "$3x^2$",
      explanation: "Power rule: multiply by the exponent, then reduce the exponent by 1.",
      topic: "Power Rule",
      timeEstimate: "20 seconds",
      encouragement: "Perfect! Keep that momentum going! ⚡",
      mnemonic: "Power Rule: 'Down and down!'",
    })
  }
}
