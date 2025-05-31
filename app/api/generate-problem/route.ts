import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"
import { parseExamQuestionOutput, extractFinalAnswer } from "@/lib/utils" // Import new utility

export async function POST(request: Request) {
  try {
    const { topicId, level } = await request.json()

    const topic = stewartTopics.find((t) => t.id === topicId)
    if (!topic) {
      return Response.json({ error: "Topic not found" }, { status: 404 })
    }

    // Use the new examQuestion prompt
    const { text: rawProblemText } = await generateText({
      model: google("gemini-pro"), // Using Gemini for problem generation
      prompt: prompts.examQuestion(topic, "auto"), // Let AI choose MCQ or Full Solution
      temperature: 0.7,
    })

    const parsed = parseExamQuestionOutput(rawProblemText)

    if (!parsed) {
      console.error("Failed to parse AI generated exam question.")
      return Response.json({ problem: getFallbackProblem(topicId, level) })
    }

    // Map parsed output to the expected problem structure
    const problem = {
      question: parsed.question,
      answer:
        parsed.questionType === "Multiple Choice" ? parsed.correctOption || "" : extractFinalAnswer(parsed.answer),
      tolerance: 0.01, // Default tolerance, as not provided by new prompt
      hint: parsed.hint,
      solution: parsed.answer, // The 'answer' field from the prompt contains the full solution
      questionType: parsed.questionType,
      mark: parsed.mark,
      options: parsed.options,
      correctOption: parsed.correctOption,
    }

    return Response.json({ problem })
  } catch (error) {
    console.error("Error generating problem:", error)
    // Return fallback problem on any error
    const { topicId, level } = await request.json()
    const problem = getFallbackProblem(topicId, level)
    return Response.json({ problem })
  }
}

function getFallbackProblem(topicId: string, level: number) {
  const fallbackProblems = {
    limits: [
      {
        question: "Find the limit: $$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$$",
        answer: "4", // Changed to string to match new type
        tolerance: 0.01,
        hint: "Factor the numerator: $x^2 - 4 = (x+2)(x-2)$",
        solution: "Factor $x^2 - 4 = (x+2)(x-2)$, then cancel $(x-2)$ to get $\\lim_{x \\to 2} (x+2) = 4$",
        questionType: "Full Solution",
        mark: 4,
      },
      {
        question: "Find the limit: $$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$",
        answer: "1", // Changed to string
        tolerance: 0.01,
        hint: "This is a fundamental trigonometric limit",
        solution: "This is a standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
        questionType: "Full Solution",
        mark: 3,
      },
      {
        question: "Find the limit: $$\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$$",
        answer: "6", // Changed to string
        tolerance: 0.01,
        hint: "Factor the numerator: $x^2 - 9 = (x+3)(x-3)$",
        solution: "Factor $x^2 - 9 = (x+3)(x-3)$, then cancel $(x-3)$ to get $\\lim_{x \\to 3} (x+3) = 6$",
        questionType: "Full Solution",
        mark: 4,
      },
    ],
    derivatives: [
      {
        question: "Find the derivative of $f(x) = 3x^2 + 2x - 1$. What is $f'(2)$?",
        answer: "14", // Changed to string
        tolerance: 0.01,
        hint: "Use the power rule: $(x^n)' = nx^{n-1}$",
        solution: "$f'(x) = 6x + 2$. Therefore, $f'(2) = 6(2) + 2 = 14$",
        questionType: "Full Solution",
        mark: 4,
      },
      {
        question: "Find the derivative of $g(x) = x^3 - 4x + 5$. What is $g'(1)$?",
        answer: "-1", // Changed to string
        tolerance: 0.01,
        hint: "Apply the power rule to each term",
        solution: "$g'(x) = 3x^2 - 4$. Therefore, $g'(1) = 3(1)^2 - 4 = -1$",
        questionType: "Full Solution",
        mark: 4,
      },
      {
        question: "Find the derivative of $h(x) = 2x^4 - x^2 + 3x$. What is $h'(0)$?",
        answer: "3", // Changed to string
        tolerance: 0.01,
        hint: "Differentiate term by term using the power rule",
        solution: "$h'(x) = 8x^3 - 2x + 3$. Therefore, $h'(0) = 8(0)^3 - 2(0) + 3 = 3$",
        questionType: "Full Solution",
        mark: 3,
      },
    ],
    "derivative-applications": [
      {
        question:
          "A ball is thrown upward with initial velocity 64 ft/s. Its height is $h(t) = -16t^2 + 64t$. When does it reach maximum height?",
        answer: "2", // Changed to string
        tolerance: 0.01,
        hint: "Find when $h'(t) = 0$",
        solution: "$h'(t) = -32t + 64 = 0$, so $t = 2$ seconds",
        questionType: "Full Solution",
        mark: 5,
      },
      {
        question:
          "A rectangular box has a square base with side length $x$ and height $h = 10 - x$. What value of $x$ maximizes the volume?",
        answer: "20/3", // Changed to string
        tolerance: 0.01,
        hint: "Volume is $V = x^2h = x^2(10-x)$. Find where $V'(x) = 0$",
        solution: "$V = 10x^2 - x^3$, so $V'(x) = 20x - 3x^2 = 0$. This gives $x(20-3x) = 0$, so $x = \\frac{20}{3}$",
        questionType: "Full Solution",
        mark: 6,
      },
    ],
    integrals: [
      {
        question: "Find the integral: $$\\int (3x^2 + 2x) \\, dx$$",
        answer: "x^3 + x^2 + C",
        tolerance: 0.01,
        hint: "Use the power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$",
        solution: "$\\int (3x^2 + 2x) \\, dx = x^3 + x^2 + C$",
        questionType: "Full Solution",
        mark: 3,
      },
      {
        question: "Evaluate: $$\\int_0^2 x^2 \\, dx$$",
        answer: "8/3", // Changed to string
        tolerance: 0.01,
        hint: "Find the antiderivative first, then apply the fundamental theorem",
        solution: "$\\int_0^2 x^2 \\, dx = \\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3} - 0 = \\frac{8}{3}$",
        questionType: "Full Solution",
        mark: 4,
      },
    ],
    "integral-applications": [
      {
        question: "Find the area under $f(x) = x^2$ from $x = 0$ to $x = 2$.",
        answer: "8/3", // Changed to string
        tolerance: 0.01,
        hint: "Use the definite integral: $\\int_0^2 x^2 \\, dx$",
        solution: "$\\int_0^2 x^2 \\, dx = \\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3}$",
        questionType: "Full Solution",
        mark: 4,
      },
      {
        question: "Find the area between $y = x^2$ and $y = 4$ from $x = 0$ to $x = 2$.",
        answer: "16/3", // Changed to string
        tolerance: 0.01,
        hint: "Area = $\\int_0^2 (4 - x^2) \\, dx$",
        solution:
          "$\\int_0^2 (4 - x^2) \\, dx = \\left[4x - \\frac{x^3}{3}\\right]_0^2 = 8 - \\frac{8}{3} = \\frac{16}{3}$",
        questionType: "Full Solution",
        mark: 5,
      },
    ],
  }

  const topicProblems = fallbackProblems[topicId as keyof typeof fallbackProblems] || fallbackProblems.limits
  const randomIndex = Math.floor(Math.random() * topicProblems.length)
  return topicProblems[randomIndex]
}
