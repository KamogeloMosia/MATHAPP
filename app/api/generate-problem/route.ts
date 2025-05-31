import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { topicId, level } = await request.json()

    const topicPrompts = {
      limits: `Generate a calculus limit problem at level ${level} difficulty (1=basic, 5=advanced). 
      Include proper LaTeX formatting using $ for inline math and $$ for display math.
      Return a JSON object with:
      - question: The problem statement with LaTeX
      - answer: Numerical answer
      - tolerance: Acceptable error range (usually 0.01)
      - hint: A helpful hint with LaTeX
      - solution: Step-by-step solution with LaTeX
      
      Example format:
      {
        "question": "Find the limit: $$\\\\lim_{x \\\\to 2} \\\\frac{x^2 - 4}{x - 2}$$",
        "answer": 4,
        "tolerance": 0.01,
        "hint": "Factor the numerator: $x^2 - 4 = (x+2)(x-2)$",
        "solution": "Factor $x^2 - 4 = (x+2)(x-2)$, then cancel $(x-2)$ to get $\\\\lim_{x \\\\to 2} (x+2) = 4$"
      }`,

      derivatives: `Generate a calculus derivative problem at level ${level} difficulty.
      Include proper LaTeX formatting. Return JSON with question, answer, tolerance, hint, and solution.
      
      Focus on:
      - Level 1-2: Basic power rule, polynomial derivatives
      - Level 3-4: Product rule, quotient rule, chain rule
      - Level 5: Complex compositions and applications`,

      "derivative-applications": `Generate an application of derivatives problem at level ${level} difficulty.
      Focus on optimization, related rates, or curve sketching. Include LaTeX formatting.
      Return JSON format with question, answer, tolerance, hint, and solution.`,

      integrals: `Generate an integral calculus problem at level ${level} difficulty.
      Include proper LaTeX formatting for integrals using \\\\int notation.
      
      Focus on:
      - Level 1-2: Basic antiderivatives, power rule for integration
      - Level 3-4: Substitution method, integration by parts
      - Level 5: Complex integration techniques`,

      "integral-applications": `Generate an application of integrals problem at level ${level} difficulty.
      Focus on area, volume, or other applications. Include LaTeX formatting.
      Return JSON format with question, answer, tolerance, hint, and solution.`,
    }

    const prompt = topicPrompts[topicId as keyof typeof topicPrompts] || topicPrompts.limits

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"), // Updated to supported model
      prompt: prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    let problem
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text
      problem = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      // Fallback if JSON parsing fails
      problem = getFallbackProblem(topicId, level)
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
        answer: 4,
        tolerance: 0.01,
        hint: "Factor the numerator: $x^2 - 4 = (x+2)(x-2)$",
        solution: "Factor $x^2 - 4 = (x+2)(x-2)$, then cancel $(x-2)$ to get $\\lim_{x \\to 2} (x+2) = 4$",
      },
      {
        question: "Find the limit: $$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$",
        answer: 1,
        tolerance: 0.01,
        hint: "This is a fundamental trigonometric limit",
        solution: "This is a standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
      },
      {
        question: "Find the limit: $$\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$$",
        answer: 6,
        tolerance: 0.01,
        hint: "Factor the numerator: $x^2 - 9 = (x+3)(x-3)$",
        solution: "Factor $x^2 - 9 = (x+3)(x-3)$, then cancel $(x-3)$ to get $\\lim_{x \\to 3} (x+3) = 6$",
      },
    ],
    derivatives: [
      {
        question: "Find the derivative of $f(x) = 3x^2 + 2x - 1$. What is $f'(2)$?",
        answer: 14,
        tolerance: 0.01,
        hint: "Use the power rule: $(x^n)' = nx^{n-1}$",
        solution: "$f'(x) = 6x + 2$. Therefore, $f'(2) = 6(2) + 2 = 14$",
      },
      {
        question: "Find the derivative of $g(x) = x^3 - 4x + 5$. What is $g'(1)$?",
        answer: -1,
        tolerance: 0.01,
        hint: "Apply the power rule to each term",
        solution: "$g'(x) = 3x^2 - 4$. Therefore, $g'(1) = 3(1)^2 - 4 = -1$",
      },
      {
        question: "Find the derivative of $h(x) = 2x^4 - x^2 + 3x$. What is $h'(0)$?",
        answer: 3,
        tolerance: 0.01,
        hint: "Differentiate term by term using the power rule",
        solution: "$h'(x) = 8x^3 - 2x + 3$. Therefore, $h'(0) = 8(0)^3 - 2(0) + 3 = 3$",
      },
    ],
    "derivative-applications": [
      {
        question:
          "A ball is thrown upward with initial velocity 64 ft/s. Its height is $h(t) = -16t^2 + 64t$. When does it reach maximum height?",
        answer: 2,
        tolerance: 0.01,
        hint: "Find when $h'(t) = 0$",
        solution: "$h'(t) = -32t + 64 = 0$, so $t = 2$ seconds",
      },
      {
        question:
          "A rectangular box has a square base with side length $x$ and height $h = 10 - x$. What value of $x$ maximizes the volume?",
        answer: 10 / 3,
        tolerance: 0.01,
        hint: "Volume is $V = x^2h = x^2(10-x)$. Find where $V'(x) = 0$",
        solution: "$V = 10x^2 - x^3$, so $V'(x) = 20x - 3x^2 = 0$. This gives $x(20-3x) = 0$, so $x = \\frac{20}{3}$",
      },
    ],
    integrals: [
      {
        question: "Find the integral: $$\\int (3x^2 + 2x) \\, dx$$",
        answer: "x^3 + x^2 + C",
        tolerance: 0.01,
        hint: "Use the power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$",
        solution: "$\\int (3x^2 + 2x) \\, dx = x^3 + x^2 + C$",
      },
      {
        question: "Evaluate: $$\\int_0^2 x^2 \\, dx$$",
        answer: 8 / 3,
        tolerance: 0.01,
        hint: "Find the antiderivative first, then apply the fundamental theorem",
        solution: "$\\int_0^2 x^2 \\, dx = \\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3} - 0 = \\frac{8}{3}$",
      },
    ],
    "integral-applications": [
      {
        question: "Find the area under $f(x) = x^2$ from $x = 0$ to $x = 2$.",
        answer: 8 / 3,
        tolerance: 0.01,
        hint: "Use the definite integral: $\\int_0^2 x^2 \\, dx$",
        solution: "$\\int_0^2 x^2 \\, dx = \\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3}$",
      },
      {
        question: "Find the area between $y = x^2$ and $y = 4$ from $x = 0$ to $x = 2$.",
        answer: 8 / 3,
        tolerance: 0.01,
        hint: "Area = $\\int_0^2 (4 - x^2) \\, dx$",
        solution:
          "$\\int_0^2 (4 - x^2) \\, dx = \\left[4x - \\frac{x^3}{3}\\right]_0^2 = 8 - \\frac{8}{3} = \\frac{16}{3}$",
      },
    ],
  }

  const topicProblems = fallbackProblems[topicId as keyof typeof fallbackProblems] || fallbackProblems.limits
  const randomIndex = Math.floor(Math.random() * topicProblems.length)
  return topicProblems[randomIndex]
}
