import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { paperId: string } }) {
  try {
    const { paperId } = params

    // In a real app, this would fetch from MongoDB
    // For now, we'll generate a sample paper structure
    const samplePaper = {
      id: paperId,
      paperInfo: {
        title: `University Calculus Exam - ${paperId.toUpperCase()}`,
        course: "Calculus I",
        duration: "3 hours",
        totalMarks: 100,
        instructions: [
          "Answer ALL questions",
          "Show all working clearly",
          "Calculators are permitted",
          "Formula sheet provided",
        ],
      },
      sectionA: {
        title: "Section A: Multiple Choice Questions",
        instructions: "Choose the best answer for each question",
        questions: [
          {
            questionNumber: 1,
            marks: 4,
            question: "Find $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
            options: {
              a: "0",
              b: "2",
              c: "4",
              d: "8",
              e: "Does not exist",
            },
            correctAnswer: "c",
            solution:
              "Factor the numerator: $(x-2)(x+2)$. Cancel $(x-2)$ terms. Limit becomes $x+2$ as $x \\to 2$, which equals $4$.",
            topic: "Limits",
          },
        ],
      },
      sectionB: {
        title: "Section B: Structured Questions",
        instructions: "Answer all parts of each question",
        questions: [
          {
            questionNumber: 1,
            totalMarks: 12,
            topic: "Derivatives and Applications",
            parts: [
              {
                part: "a",
                marks: 4,
                question: "Find $\\frac{dy}{dx}$ if $y = x^3 \\sin(2x)$",
                solution:
                  "Using product rule: $\\frac{dy}{dx} = 3x^2 \\sin(2x) + x^3 \\cdot 2\\cos(2x) = 3x^2 \\sin(2x) + 2x^3 \\cos(2x)$",
                markingScheme: [
                  "1 mark for identifying product rule",
                  "2 marks for correct differentiation",
                  "1 mark for final answer",
                ],
              },
              {
                part: "b",
                marks: 8,
                question:
                  "A rectangular box with square base has volume $32 \\text{ cm}^3$. Find the dimensions that minimize the surface area.",
                solution:
                  "Let side of base = $x$, height = $h$. Volume: $x^2 h = 32$, so $h = \\frac{32}{x^2}$. Surface area: $S = 2x^2 + 4xh = 2x^2 + \\frac{128}{x}$. $\\frac{dS}{dx} = 4x - \\frac{128}{x^2} = 0$. Solving: $4x^3 = 128$, $x = 2\\sqrt{2}$ cm, $h = 4\\sqrt{2}$ cm.",
                markingScheme: [
                  "2 marks for setting up equations",
                  "2 marks for expressing S in terms of x",
                  "2 marks for differentiation",
                  "2 marks for solving and final answer",
                ],
              },
            ],
          },
        ],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: "medium",
        estimatedTime: "180 minutes",
      },
    }

    return NextResponse.json(samplePaper)
  } catch (error) {
    console.error("Error fetching past paper:", error)
    return NextResponse.json({ error: "Failed to fetch past paper" }, { status: 500 })
  }
}
