import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"
import { stewartTopics } from "@/lib/stewart-data"
import { prompts } from "@/lib/ai-prompts"
import { generatePuterQuestion } from "@/lib/puter-integration"
import { parseExamQuestionOutput, extractFinalAnswer } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params

    // Validate topicId
    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("stewart-calculus")

    // Check if content exists in cache with timeout
    const cachedContent = (await Promise.race([
      db.collection("content").findOne({ topicId }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 10000)),
    ])) as any

    if (cachedContent) {
      try {
        // Get additional questions from question bank
        const questionBank = await db.collection("question_bank").findOne({ topicId })
        if (questionBank && questionBank.questions.length > 0) {
          const selectedQuestions = selectBestQuestions(questionBank.questions, 3)
          cachedContent.practiceProblems = [...cachedContent.practiceProblems, ...selectedQuestions]
        }
      } catch (questionError) {
        console.error("Error fetching question bank:", questionError)
        // Continue with cached content even if question bank fails
      }

      return NextResponse.json({ content: cachedContent, cached: true })
    }

    // Generate new content if not cached
    const topic = stewartTopics.find((t) => t.id === topicId)
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    let content
    try {
      content = await generateComprehensiveContent(topic)
    } catch (generateError) {
      console.error("Error generating content:", generateError)
      // Use fallback content if generation fails
      content = getFallbackContent(topic)
    }

    // Save to MongoDB with error handling
    try {
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
    } catch (saveError) {
      console.error("Error saving content:", saveError)
      // Return generated content even if save fails
      return NextResponse.json({ content, cached: false })
    }
  } catch (error) {
    console.error("Critical error in content API:", error)

    // Return emergency fallback content
    const topic = stewartTopics.find((t) => t.id === params.topicId)
    const fallbackContent = topic ? getFallbackContent(topic) : getEmergencyFallback()

    return NextResponse.json({
      content: fallbackContent,
      cached: false,
      error: "Content generated with fallback due to system error",
    })
  }
}

async function generateComprehensiveContent(topic: any) {
  // Generate content using both Groq and Gemini for diversity
  const [groqExplanation, geminiSummary, easyExample, easyPracticeProblems, examLevelProblems] = await Promise.all([
    generateExplanationWithGroq(topic),
    generateSummaryWithGemini(topic),
    generateEasyExampleWithGemini(topic), // Easy example for learning
    generateEasyPracticeProblems(topic, 2), // Easy practice problems
    generateExamLevelProblems(topic, 3), // Exam-level problems for challenge
  ])

  // Try to get a Puter question if possible
  const puterQuestion = await generatePuterQuestion(topic)
  const allQuestions = [...easyPracticeProblems, ...examLevelProblems]

  if (puterQuestion) {
    allQuestions.push(puterQuestion)
  }

  return {
    explanation: groqExplanation,
    summary: geminiSummary,
    example: easyExample, // Easy example for learning
    practiceProblems: allQuestions,
  }
}

async function generateExplanationWithGroq(topic: any) {
  const explanationPrompt = prompts.contentGeneration.explanation(topic)
  try {
    const { text: explanationText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: explanationPrompt,
      temperature: 0.2,
    })
    return explanationText
  } catch (error) {
    console.error("Error generating explanation with Groq:", error)
    return getFallbackContent(topic).explanation
  }
}

async function generateEasyPracticeProblems(topic: any, count: number) {
  const problems = []
  for (let i = 0; i < count; i++) {
    try {
      const { text: rawProblemText } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: prompts.easyPracticeExample(topic),
        temperature: 0.5,
      })

      const jsonMatch = rawProblemText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        problems.push({
          id: `${topic.id}_easy_${Date.now()}_${i}`,
          problem: parsed.problem,
          answer: parsed.answer,
          hint: parsed.hint,
          solution: parsed.solution,
          difficulty: "easy",
          tags: [topic.id, "practice", "easy"],
          quality_score: 0.8,
          created_by: "groq",
          questionType: "Full Solution",
          mark: 2, // Easy questions get fewer marks
        })
      }
    } catch (error) {
      console.error("Error generating easy practice problem:", error)
    }
  }
  return problems
}

async function generateExamLevelProblems(topic: any, count: number) {
  const problems = []
  for (let i = 0; i < count; i++) {
    try {
      const { text: rawProblemText } = await generateText({
        model: google("gemini-pro"),
        prompt: prompts.examQuestion(topic, i % 2 === 0 ? "Multiple Choice" : "Full Solution"),
        temperature: 0.7,
      })

      const parsed = parseExamQuestionOutput(rawProblemText)

      if (parsed) {
        problems.push({
          id: `${topic.id}_exam_${Date.now()}_${i}`,
          problem: parsed.question,
          answer:
            parsed.questionType === "Multiple Choice" ? parsed.correctOption || "" : extractFinalAnswer(parsed.answer),
          hint: parsed.hint,
          solution: parsed.answer,
          difficulty: parsed.mark >= 5 ? "hard" : "medium",
          tags: [topic.id, "exam-level", parsed.questionType.toLowerCase().replace(" ", "-")],
          quality_score: 0.95,
          created_by: "gemini",
          questionType: parsed.questionType,
          mark: parsed.mark,
          options: parsed.options,
          correctOption: parsed.correctOption,
        })
      }
    } catch (error) {
      console.error("Error generating exam-level problem:", error)
    }
  }
  return problems
}

async function generateSummaryWithGemini(topic: any) {
  const summaryPrompt = prompts.contentGeneration.summary(topic)

  try {
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: summaryPrompt,
      temperature: 0.3,
    })

    return text
  } catch (error) {
    console.error("Error generating summary with Gemini:", error)
    return getDefaultSummary(topic)
  }
}

async function generateEasyExampleWithGemini(topic: any) {
  const examplePrompt = prompts.contentGeneration.example(topic)

  try {
    const { text: exampleText } = await generateText({
      model: google("gemini-pro"),
      prompt: examplePrompt,
      temperature: 0.3,
    })

    let example = { problem: "", solution: "", steps: [] }
    try {
      const exampleMatch = exampleText.match(/\{[\s\S]*\}/)
      if (exampleMatch) {
        example = JSON.parse(exampleMatch[0])
      }
    } catch (error) {
      console.error("Error parsing Gemini example JSON:", error)
    }
    return example
  } catch (error) {
    console.error("Error generating example with Gemini:", error)
    return getDefaultExample(topic)
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
    questionType: "Full Solution",
    mark: 4,
  }
}

function getDefaultExample(topic: any) {
  return {
    problem: "Example problem for " + topic.title,
    solution: "Solution steps would be shown here",
    steps: ["Step 1", "Step 2", "Step 3"],
  }
}

function getFallbackContent(topic: any) {
  // Enhanced fallback content with concise, well-spaced explanations
  const fallbackContents: { [key: string]: any } = {
    "limit-function": {
      explanation: `
        <h3>Key Concept</h3>
        <p>A <strong>limit</strong> describes what value a function approaches as the input gets close to a specific point. We write $\\lim_{x \\to a} f(x) = L$ to mean $f(x)$ approaches $L$ as $x$ approaches $a$.</p>
        
        <h4>Main Formula</h4>
        <p>$$\\lim_{x \\to a} f(x) = L$$</p>
        
        <h4>Simple Example</h4>
        <p><strong>Problem:</strong> Find $\\lim_{x \\to 2} (3x + 1)$</p>
        <p><strong>Solution:</strong> Since the function is continuous, we substitute: $3(2) + 1 = 7$</p>
      `,
      example: {
        problem: "Find $\\lim_{x \\to 1} (2x + 3)$",
        solution: "Direct substitution: $2(1) + 3 = 5$",
        steps: [
          "Identify that the function is continuous at $x = 1$",
          "Substitute $x = 1$: $2(1) + 3$",
          "Simplify: $2 + 3 = 5$",
        ],
      },
      practiceProblems: [
        {
          id: "limit_fallback_1",
          problem: "Find $\\lim_{x \\to 3} (x + 2)$",
          answer: "5",
          hint: "Since this is a polynomial, use direct substitution",
          solution: `STEP-BY-STEP SOLUTION:

Step 1: The function $f(x) = x + 2$ is a polynomial, so it's continuous everywhere.

Step 2: For continuous functions, we can use direct substitution: $\\lim_{x \\to 3} (x + 2) = 3 + 2$

Final Answer: 5`,
          difficulty: "easy",
          tags: ["limit-function", "easy"],
          quality_score: 0.8,
          created_by: "manual",
          questionType: "Full Solution",
          mark: 2,
        },
      ],
    },
  }

  return (
    fallbackContents[topic.id] || {
      explanation: `
        <h3>Key Concept</h3>
        <p>${topic.description}</p>
        
        <h4>Main Topic</h4>
        <p>This covers the fundamentals of ${topic.title}.</p>
      `,
      example: {
        problem: "Simple example for " + topic.title,
        solution: "Basic solution steps",
        steps: ["Step 1", "Step 2", "Step 3"],
      },
      practiceProblems: [
        {
          id: `${topic.id}_fallback_1`,
          problem: "Practice problem for " + topic.title,
          answer: "Answer",
          hint: "Helpful hint",
          solution: `STEP-BY-STEP SOLUTION:

Step 1: Apply the basic concepts.

Step 2: Solve systematically.

Final Answer: The solution.`,
          difficulty: "easy",
          tags: [topic.id],
          quality_score: 0.5,
          created_by: "manual",
          questionType: "Full Solution",
          mark: 2,
        },
      ],
    }
  )
}

function getDefaultSummary(topic: any) {
  return `
    <h3>Definition</h3>
    <p>${topic.description}</p>
    
    <h4>Key Formula</h4>
    <p>Main formula for ${topic.title}</p>
    
    <h4>Method</h4>
    <p>Basic technique for solving problems</p>
    
    <h4>Application</h4>
    <p>Used in various mathematical and real-world contexts.</p>
  `
}

function getEmergencyFallback() {
  return {
    explanation: `
      <h3>Content Loading</h3>
      <p>We're having trouble loading the full content right now. Please try refreshing the page.</p>
      
      <h4>Basic Information</h4>
      <p>This topic covers fundamental calculus concepts. Please check back shortly for detailed explanations.</p>
    `,
    summary: `
      <h3>Topic Summary</h3>
      <p>Content is being loaded. Please refresh the page to try again.</p>
    `,
    example: {
      problem: "Content is being loaded...",
      solution: "Please refresh the page to load the example.",
      steps: ["Refresh the page", "Wait for content to load", "Try again"],
    },
    practiceProblems: [
      {
        id: "emergency_fallback_1",
        problem: "Content is being loaded. Please refresh the page.",
        answer: "N/A",
        hint: "Try refreshing the page",
        solution: "Please refresh the page to load practice problems.",
        difficulty: "easy",
        tags: ["fallback"],
        quality_score: 0.1,
        created_by: "manual",
        questionType: "Full Solution",
        mark: 1,
      },
    ],
  }
}
