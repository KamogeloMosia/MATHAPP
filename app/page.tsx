"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Users } from "lucide-react"
import { stewartChapters } from "@/lib/stewart-data"

declare global {
  interface Window {
    MathJax: any
  }
}

interface TopicProgress {
  attempted: number
  correct: number
  currentLevel: number
  mastered: boolean
}

interface UserProgress {
  [key: string]: TopicProgress
}

const calculusTopics = [
  {
    id: "limits",
    title: "Limits and Continuity",
    description: "Foundation of calculus - understanding limits, continuity, and the behavior of functions",
    prerequisite: null,
    color: "bg-blue-500",
  },
  {
    id: "derivatives",
    title: "Derivatives",
    description: "Rate of change and slope - differentiation rules and techniques",
    prerequisite: null, // Changed from "limits" to null
    color: "bg-green-500",
  },
  {
    id: "derivative-applications",
    title: "Applications of Derivatives",
    description: "Optimization, related rates, curve sketching, and real-world applications",
    prerequisite: null, // Changed from "derivatives" to null
    color: "bg-purple-500",
  },
  {
    id: "integrals",
    title: "Integrals",
    description: "Antiderivatives and the fundamental theorem of calculus",
    prerequisite: null, // Changed from "derivative-applications" to null
    color: "bg-orange-500",
  },
  {
    id: "integral-applications",
    title: "Applications of Integrals",
    description: "Area, volume, work, and other applications of integration",
    prerequisite: null, // Changed from "integrals" to null
    color: "bg-red-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stewart Calculus</h1>
                <p className="text-sm text-gray-600">Interactive Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Adaptive Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Master Calculus with James Stewart</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore comprehensive calculus concepts with AI-generated explanations, worked examples, and practice
            problems. Each topic builds upon previous knowledge to create a complete learning experience.
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stewartChapters.map((chapter) => (
            <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Chapter {chapter.order}</Badge>
                    <div className="text-sm text-gray-500">{chapter.topics.length} topics</div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{chapter.title}</CardTitle>
                  <CardDescription className="text-sm">{chapter.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Topics include:</div>
                    <div className="flex flex-wrap gap-1">
                      {chapter.topics.slice(0, 3).map((topicId) => (
                        <Badge key={topicId} variant="outline" className="text-xs">
                          {topicId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                      {chapter.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{chapter.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Our Platform?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Comprehensive Content</h4>
              <p className="text-sm text-gray-600">
                Complete coverage of James Stewart's Calculus textbook with detailed explanations and examples.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">AI-Generated Problems</h4>
              <p className="text-sm text-gray-600">
                Fresh practice problems and examples generated on-demand, cached for optimal performance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Interactive Learning</h4>
              <p className="text-sm text-gray-600">
                Step-by-step solutions, hints, and the ability to regenerate content for varied practice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Topic Learning Component
function TopicLearning({
  topicId,
  userProgress,
  setUserProgress,
  onBack,
}: {
  topicId: string
  userProgress: UserProgress
  setUserProgress: (progress: UserProgress) => void
  onBack: () => void
}) {
  const [currentProblem, setCurrentProblem] = useState<any>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [showSolution, setShowSolution] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [problemHistory, setProblemHistory] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [topicSummary, setTopicSummary] = useState<string>("")
  const [mathLoaded, setMathLoaded] = useState(false)

  const topic = calculusTopics.find((t) => t.id === topicId)
  const progress = userProgress[topicId] || { attempted: 0, correct: 0, currentLevel: 1, mastered: false }

  useEffect(() => {
    generateNewProblem()
    generateTopicSummary()
  }, [topicId])

  const generateTopicSummary = async () => {
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, level: progress.currentLevel }),
      })
      const data = await response.json()
      setTopicSummary(data.summary)
    } catch (error) {
      console.error("Error generating summary:", error)
      setTopicSummary(getTopicExplanation(topicId))
    }
  }

  const generateNewProblem = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, level: progress.currentLevel }),
      })
      const data = await response.json()
      setCurrentProblem(data.problem)
    } catch (error) {
      console.error("Error generating problem:", error)
      // Fallback to static problems
      const problem = generateStaticProblem(topicId, progress.currentLevel)
      setCurrentProblem(problem)
    }
    setIsGenerating(false)
    setUserAnswer("")
    setShowSolution(false)
    setShowHint(false)
    setFeedback(null)
  }

  const checkAnswer = () => {
    const tolerance = currentProblem.tolerance || 0.01
    const userNum = Number.parseFloat(userAnswer)
    const correctNum = Number.parseFloat(currentProblem.answer.toString())

    const isCorrect = Math.abs(userNum - correctNum) < tolerance

    const newProgress = { ...progress }
    newProgress.attempted += 1

    if (isCorrect) {
      newProgress.correct += 1
      setFeedback("🎉 Correct! Well done!")

      // Check if should level up
      if (newProgress.correct % 2 === 0 && newProgress.currentLevel < 5) {
        newProgress.currentLevel += 1
        setFeedback("🎉 Correct! You've leveled up!")
      }

      // Check if mastered (10 correct answers)
      if (newProgress.correct >= 10) {
        newProgress.mastered = true
        setFeedback("🏆 Congratulations! You've mastered this topic!")
      }
    } else {
      setFeedback(
        `❌ Incorrect. The correct answer is ${currentProblem.answer}. Try again or view the solution to learn.`,
      )
      setShowSolution(true)
    }

    setUserProgress({
      ...userProgress,
      [topicId]: newProgress,
    })

    setProblemHistory([
      ...problemHistory,
      {
        problem: currentProblem,
        userAnswer,
        correct: isCorrect,
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            ← Back to Topics
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{topic?.title}</h1>
            <Badge variant="secondary">Level {progress.currentLevel}</Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="font-semibold">{progress.correct}/10 mastered</div>
          </div>
        </div>

        {/* Topic Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Concept Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {topicSummary ? (
                <MathRenderer content={topicSummary} />
              ) : (
                <div className="animate-pulse">Loading AI-generated summary...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Problem */}
        {currentProblem && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Practice Problem</CardTitle>
              <CardDescription>
                Level {progress.currentLevel} • Problem {progress.attempted + 1}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg bg-gray-50 p-4 rounded-lg border">
                <MathRenderer content={currentProblem.question} />
              </div>

              <div className="flex gap-4">
                <input
                  type="number"
                  step="any"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                />
                <Button onClick={checkAnswer} disabled={!userAnswer || isGenerating}>
                  Check Answer
                </Button>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-md ${
                    feedback.includes("Correct") || feedback.includes("mastered") || feedback.includes("leveled")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {feedback}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)}>
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </Button>
                <Button variant="outline" size="sm" onClick={generateNewProblem} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "New Problem"}
                </Button>
              </div>

              {showHint && (
                <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                  <strong>💡 Hint:</strong> <MathRenderer content={currentProblem.hint} />
                </div>
              )}

              {showSolution && (
                <div className="bg-gray-50 p-4 rounded-md border-l-4 border-gray-400">
                  <div className="mb-2">
                    <strong>📝 Solution:</strong>
                  </div>
                  <MathRenderer content={currentProblem.solution} />
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <strong>✅ Answer:</strong> <MathRenderer content={`${currentProblem.answer}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{progress.attempted}</div>
                <div className="text-sm text-gray-600">Attempted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{progress.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {progress.attempted > 0 ? Math.round((progress.correct / progress.attempted) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{progress.currentLevel}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Mastery Progress</span>
                <span>{Math.min(progress.correct, 10)}/10</span>
              </div>
              <Progress value={Math.min((progress.correct / 10) * 100, 100)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced Math Renderer Component
function MathRenderer({ content }: { content: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [renderedContent, setRenderedContent] = useState("")

  useEffect(() => {
    // Load MathJax configuration and library
    if (!window.MathJax) {
      // Configure MathJax before loading
      window.MathJax = {
        tex: {
          inlineMath: [
            ["$", "$"],
            ["$$", "$$"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
          processEscapes: true,
          processEnvironments: true,
        },
        options: {
          skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
          ignoreHtmlClass: "tex2jax_ignore",
          processHtmlClass: "tex2jax_process",
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
            setIsLoaded(true)
          },
        },
      }

      // Load MathJax script
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
      script.async = true
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && content) {
      // Process the content and trigger MathJax rendering
      setRenderedContent(content)

      // Use a timeout to ensure DOM is updated before MathJax processes
      setTimeout(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise()
            .then(() => {
              // MathJax rendering complete
            })
            .catch((err: any) => console.error("MathJax rendering error:", err))
        }
      }, 100)
    }
  }, [content, isLoaded])

  if (!isLoaded) {
    return <div className="animate-pulse bg-gray-200 h-6 rounded"></div>
  }

  return <div className="math-content leading-relaxed" dangerouslySetInnerHTML={{ __html: renderedContent }} />
}

// Fallback static problem generator
function generateStaticProblem(topicId: string, level: number) {
  const problems = {
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
    ],
    derivatives: [
      {
        question: "Find the derivative of $f(x) = 3x^2 + 2x - 1$. What is $f'(2)$?",
        answer: 14,
        tolerance: 0.01,
        hint: "Use the power rule: $(x^n)' = nx^{n-1}$",
        solution: "$f'(x) = 6x + 2$. Therefore, $f'(2) = 6(2) + 2 = 14$",
      },
    ],
  }

  const topicProblems = problems[topicId as keyof typeof problems] || problems.limits
  const baseIndex = Math.floor(Math.random() * topicProblems.length)
  return topicProblems[baseIndex]
}

// Static topic explanations with LaTeX
function getTopicExplanation(topicId: string) {
  const explanations = {
    limits: `
      <h3>Limits and Continuity</h3>
      <p><strong>Limits</strong> are fundamental to calculus and describe the behavior of a function as the input approaches a particular value. The limit of $f(x)$ as $x$ approaches $a$ is written as:</p>
      
      $$\\lim_{x \\to a} f(x) = L$$
      
      <p>This means that $f(x)$ gets arbitrarily close to $L$ as $x$ gets arbitrarily close to $a$.</p>
      
      <h4>Key Properties:</h4>
      <ul>
        <li><strong>Sum Rule:</strong> $\\lim_{x \\to a} [f(x) + g(x)] = \\lim_{x \\to a} f(x) + \\lim_{x \\to a} g(x)$</li>
        <li><strong>Product Rule:</strong> $\\lim_{x \\to a} [f(x) \\cdot g(x)] = \\lim_{x \\to a} f(x) \\cdot \\lim_{x \\to a} g(x)$</li>
        <li><strong>Quotient Rule:</strong> $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{\\lim_{x \\to a} f(x)}{\\lim_{x \\to a} g(x)}$ (if denominator ≠ 0)</li>
      </ul>
    `,
    derivatives: `
      <h3>Derivatives</h3>
      <p><strong>Derivatives</strong> measure the instantaneous rate of change of a function. The derivative of $f(x)$ is defined as:</p>
      
      $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
      
      <h4>Essential Rules:</h4>
      <ul>
        <li><strong>Power Rule:</strong> $(x^n)' = nx^{n-1}$</li>
        <li><strong>Product Rule:</strong> $(fg)' = f'g + fg'$</li>
        <li><strong>Quotient Rule:</strong> $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$</li>
        <li><strong>Chain Rule:</strong> $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$</li>
      </ul>
    `,
  }

  return explanations[topicId as keyof typeof explanations] || explanations.limits
}
