import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const OPENAI_API_KEY =
  "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"

export async function POST(request: NextRequest) {
  try {
    const { selectedTopics, difficulty, duration, totalMarks, paperType, learnerLevel } = await request.json()

    // Generate exam paper with Gemini
    const { text: examPaper } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `
Create a comprehensive ${paperType} exam paper based on learner-selected topics.

LEARNER PROFILE:
- Selected Topics: ${selectedTopics.join(", ")}
- Difficulty Level: ${difficulty}
- Learner Level: ${learnerLevel}
- Duration: ${duration}
- Total Marks: ${totalMarks}

EXAM STRUCTURE:
1. **Section A: Quick Concepts (25% marks)**
   - 5-6 short questions (2-3 marks each)
   - Test fundamental understanding
   - Cover all selected topics

2. **Section B: Problem Solving (50% marks)**
   - 3-4 medium questions (8-12 marks each)
   - Multi-part structured questions
   - Progressive difficulty

3. **Section C: Advanced Application (25% marks)**
   - 1-2 challenging questions (15-20 marks each)
   - Real-world applications
   - Integration of multiple concepts

QUALITY REQUIREMENTS:
- Mathematically accurate and verified
- Appropriate for ${learnerLevel} level
- Clear, unambiguous questions
- Proper LaTeX notation
- Realistic exam timing
- Comprehensive marking schemes

ADAPTIVE FEATURES:
- Weight questions toward learner's selected topics
- Adjust complexity based on learner level
- Include prerequisite checks
- Provide learning pathway suggestions

Return as structured JSON with sections, questions, solutions, and marking schemes.
`,
      temperature: 0.7,
    })

    // Validate with OpenAI
    const validationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert exam validator ensuring mathematical accuracy and pedagogical quality.",
          },
          {
            role: "user",
            content: `Validate and refine this exam paper:\n\n${examPaper}\n\nEnsure mathematical accuracy, appropriate difficulty, and clear marking schemes.`,
          },
        ],
        temperature: 0.1,
      }),
    })

    const validationData = await validationResponse.json()
    const validatedPaper = validationData.choices[0].message.content

    return NextResponse.json({
      examPaper: JSON.parse(examPaper),
      validatedPaper: validatedPaper,
      metadata: {
        selectedTopics,
        difficulty,
        duration,
        totalMarks,
        paperType,
        learnerLevel,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating exam paper:", error)
    return NextResponse.json({ error: "Failed to generate exam paper" }, { status: 500 })
  }
}
