import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"
import { generatePuterQuestion } from "@/lib/puter-integration"

export async function GET(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params
    const client = await clientPromise
    const db = client.db("stewart-calculus")

    // Check if content exists in cache
    const cachedContent = await db.collection("content").findOne({ topicId })

    if (cachedContent) {
      // Get additional questions from question bank
      const questionBank = await db.collection("question_bank").findOne({ topicId })

      if (questionBank && questionBank.questions.length > 0) {
        // Select best questions based on quality score and variety
        const selectedQuestions = selectBestQuestions(questionBank.questions, 3)
        cachedContent.practiceProblems = [...cachedContent.practiceProblems, ...selectedQuestions]
      }

      return NextResponse.json({ content: cachedContent, cached: true })
    }

    // Generate new content if not cached
    const topic = stewartTopics.find((t) => t.id === topicId)
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    const content = await generateComprehensiveContent(topic)

    // Save to MongoDB
    const result = await db.collection("content").insertOne({
      ...content,
      topicId,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      quality_reviewed: false,
    })

    // Also save questions to question bank
    await saveQuestionsToBank(db, topicId, content.practiceProblems)

    return NextResponse.json({ content: { ...content, _id: result.insertedId }, cached: false })
  } catch (error) {
    console.error("Error fetching/generating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateComprehensiveContent(topic: any) {
  // Generate content using both Groq and Puter for diversity
  const [groqContent, summaryContent] = await Promise.all([
    generateContentWithGroq(topic),
    generateSummaryWithGroq(topic),
  ])

  // Generate additional questions using both AI models
  const additionalQuestions = await generateMultipleQuestions(topic)

  // Try to get a Puter question if possible
  const puterQuestion = await generatePuterQuestion(topic)
  const allQuestions = [...groqContent.practiceProblems, ...additionalQuestions]

  if (puterQuestion) {
    allQuestions.push(puterQuestion)
  }

  return {
    explanation: groqContent.explanation,
    summary: summaryContent,
    example: groqContent.example,
    practiceProblems: allQuestions,
  }
}

async function generateContentWithGroq(topic: any) {
  // Use the improved prompts from the centralized prompts file
  const explanationPrompt = prompts.contentGeneration.explanation(topic)
  const examplePrompt = prompts.contentGeneration.example(topic)

  try {
    // Generate explanation
    const { text: explanationText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: explanationPrompt,
      temperature: 0.2,
    })

    // Generate example
    const { text: exampleText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: examplePrompt,
      temperature: 0.3,
    })

    // Generate practice problems with different difficulties
    const easyProblemPrompt = prompts.contentGeneration.practiceProblem(topic, "easy")
    const mediumProblemPrompt = prompts.contentGeneration.practiceProblem(topic, "medium")
    const hardProblemPrompt = prompts.contentGeneration.practiceProblem(topic, "hard")

    const [easyProblemText, mediumProblemText, hardProblemText] = await Promise.all([
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: easyProblemPrompt,
        temperature: 0.3,
      }),
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: mediumProblemPrompt,
        temperature: 0.4,
      }),
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: hardProblemPrompt,
        temperature: 0.5,
      }),
    ])

    // Parse the JSON responses
    let example = { problem: "", solution: "", steps: [] }
    try {
      const exampleMatch = exampleText.text.match(/\{[\s\S]*\}/)
      if (exampleMatch) {
        example = JSON.parse(exampleMatch[0])
      }
    } catch (error) {
      console.error("Error parsing example JSON:", error)
    }

    // Parse practice problems
    const practiceProblems = []

    try {
      const easyMatch = easyProblemText.text.match(/\{[\s\S]*\}/)
      if (easyMatch) {
        const easyProblem = JSON.parse(easyMatch[0])
        practiceProblems.push({
          ...easyProblem,
          id: `${topic.id}_easy_${Date.now()}`,
          created_by: "groq",
          quality_score: 0.85,
        })
      }
    } catch (error) {
      console.error("Error parsing easy problem JSON:", error)
    }

    try {
      const mediumMatch = mediumProblemText.text.match(/\{[\s\S]*\}/)
      if (mediumMatch) {
        const mediumProblem = JSON.parse(mediumMatch[0])
        practiceProblems.push({
          ...mediumProblem,
          id: `${topic.id}_medium_${Date.now()}`,
          created_by: "groq",
          quality_score: 0.85,
        })
      }
    } catch (error) {
      console.error("Error parsing medium problem JSON:", error)
    }

    try {
      const hardMatch = hardProblemText.text.match(/\{[\s\S]*\}/)
      if (hardMatch) {
        const hardProblem = JSON.parse(hardMatch[0])
        practiceProblems.push({
          ...hardProblem,
          id: `${topic.id}_hard_${Date.now()}`,
          created_by: "groq",
          quality_score: 0.85,
        })
      }
    } catch (error) {
      console.error("Error parsing hard problem JSON:", error)
    }

    return {
      explanation: explanationText,
      example,
      practiceProblems: practiceProblems.length > 0 ? practiceProblems : [getDefaultProblem(topic)],
    }
  } catch (error) {
    console.error("Error generating content with Groq:", error)
    return getFallbackContent(topic)
  }
}

async function generateSummaryWithGroq(topic: any) {
  const summaryPrompt = prompts.contentGeneration.summary(topic)

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: summaryPrompt,
      temperature: 0.3,
    })

    return text
  } catch (error) {
    console.error("Error generating summary:", error)
    return getDefaultSummary(topic)
  }
}

async function generateMultipleQuestions(topic: any) {
  // Generate a challenging question using the improved prompt
  const difficultQuestionPrompt = prompts.questionEnhancement.createDifficult(topic)

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: difficultQuestionPrompt,
      temperature: 0.5, // Higher temperature for more creative questions
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const question = JSON.parse(jsonMatch[0])
      return [
        {
          ...question,
          id: `${topic.id}_difficult_${Date.now()}`,
          created_by: "groq",
        },
      ]
    }

    return []
  } catch (error) {
    console.error("Error generating difficult question:", error)
    return []
  }
}

async function saveQuestionsToBank(db: any, topicId: string, questions: any[]) {
  // Prepare questions for the question bank
  const questionBankEntries = questions.map((q) => ({
    ...q,
    created_at: new Date(),
    last_used: new Date(),
    usage_count: 0,
    user_ratings: [],
  }))

  // Update existing question bank or create a new one
  await db.collection("question_bank").updateOne(
    { topicId },
    {
      $push: { questions: { $each: questionBankEntries } },
      $set: { last_updated: new Date() },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true },
  )
}

function selectBestQuestions(questions: any[], count: number) {
  // Sort by quality score and variety of difficulty
  const sorted = [...questions].sort((a, b) => b.quality_score - a.quality_score)

  // Ensure we have a mix of difficulties if possible
  const easy = sorted.filter((q) => q.difficulty === "easy").slice(0, 1)
  const medium = sorted.filter((q) => q.difficulty === "medium").slice(0, 1)
  const hard = sorted.filter((q) => q.difficulty === "hard").slice(0, 1)

  // Combine and ensure we don't exceed count
  const selected = [...easy, ...medium, ...hard]

  // If we don't have enough, add more from the sorted list
  if (selected.length < count) {
    const remainingNeeded = count - selected.length
    const selectedIds = new Set(selected.map((q) => q.id))
    const additional = sorted.filter((q) => !selectedIds.has(q.id)).slice(0, remainingNeeded)

    selected.push(...additional)
  }

  return selected.slice(0, count)
}

function getDefaultProblem(topic: any) {
  return {
    id: `${topic.id}_default_${Date.now()}`,
    problem: `Practice problem for ${topic.title}`,
    answer: "Answer will be provided",
    hint: "Think about the key concepts from this topic",
    solution: `DETAILED STEP-BY-STEP SOLUTION:

Step 1: Identify the key concepts related to ${topic.title}.

Step 2: Apply the appropriate formulas or techniques.

Step 3: Solve the problem systematically.

Final Answer: The solution would be determined by applying the concepts correctly.`,
    difficulty: "medium",
    tags: [topic.id],
    quality_score: 0.5,
    created_by: "manual",
  }
}

function getFallbackContent(topic: any) {
  // Enhanced fallback content with more comprehensive coverage
  const fallbackContents: { [key: string]: any } = {
    "limit-function": {
      explanation:
        "The **limit** of a function describes the behavior of the function as the input approaches a particular value. We write $\\lim_{x \\to a} f(x) = L$ to mean that as $x$ gets arbitrarily close to $a$, the function values $f(x)$ get arbitrarily close to $L$. Limits are fundamental to calculus because they allow us to define derivatives and integrals precisely. Understanding limits helps us analyze function behavior at points where the function might not even be defined.",
      example: {
        problem: "Find $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
        solution:
          "$$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 4$$",
        steps: [
          "Factor the numerator: $x^2 - 4 = (x-2)(x+2)$",
          "Cancel the common factor $(x-2)$",
          "Evaluate the limit: $\\lim_{x \\to 2} (x+2) = 2+2 = 4$",
        ],
      },
      practiceProblems: [
        {
          id: "limit_fallback_1",
          problem: "Find $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$",
          answer: "6",
          hint: "Factor the numerator and cancel common terms",
          solution: `DETAILED STEP-BY-STEP SOLUTION:

Step 1: We need to evaluate $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$. Direct substitution gives $\\frac{0}{0}$, which is an indeterminate form.

Step 2: Factor the numerator: $x^2 - 9 = (x-3)(x+3)$

Step 3: Cancel the common factor $(x-3)$ from numerator and denominator:
$\\lim_{x \\to 3} \\frac{(x-3)(x+3)}{x-3} = \\lim_{x \\to 3} (x+3)$

Step 4: Now we can directly substitute $x = 3$:
$\\lim_{x \\to 3} (x+3) = 3+3 = 6$

Final Answer: The limit equals 6.`,
          difficulty: "medium",
          tags: ["limit-function", "factoring"],
          quality_score: 0.9,
          created_by: "manual",
        },
      ],
    },
  }

  return (
    fallbackContents[topic.id] || {
      explanation: `This topic covers ${topic.title}. ${topic.description}`,
      example: {
        problem: "Example problem for " + topic.title,
        solution: "Solution steps would be shown here",
        steps: ["Step 1", "Step 2", "Step 3"],
      },
      practiceProblems: [
        {
          id: `${topic.id}_fallback_1`,
          problem: "Practice problem for " + topic.title,
          answer: "Answer",
          hint: "Helpful hint",
          solution: `DETAILED STEP-BY-STEP SOLUTION:

Step 1: Identify the key concepts related to ${topic.title}.

Step 2: Apply the appropriate formulas or techniques.

Step 3: Solve the problem systematically.

Final Answer: The solution would be determined by applying the concepts correctly.`,
          difficulty: "medium",
          tags: [topic.id],
          quality_score: 0.5,
          created_by: "manual",
        },
      ],
    }
  )
}

function getDefaultSummary(topic: any) {
  return `<h3>${topic.title}</h3><p>${topic.description}</p><p>This is a fundamental concept in calculus that requires careful study and practice.</p>`
}
