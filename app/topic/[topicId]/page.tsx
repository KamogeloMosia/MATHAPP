"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Lightbulb, CheckCircle, Check } from "lucide-react"
import { MathRenderer } from "@/components/math-renderer"
import { ProgressIndicator } from "@/components/progress-indicator"
import { stewartTopics, stewartChapters } from "@/lib/stewart-data"

interface TopicPageProps {
  params: {
    topicId: string
  }
}

interface Content {
  explanation: string
  example: {
    problem: string
    solution: string
    steps: string[]
  }
  practiceProblems: {
    id: string
    problem: string
    answer: string
    hint?: string
    solution: string
    difficulty: string
    created_by: string
    questionType?: string
    mark?: number
    options?: string[]
    correctOption?: string
  }[]
}

interface UserProgress {
  questionsAttempted: number
  questionsCorrect: number
  currentStreak: number
  bestStreak: number
  masteryLevel: number
  completed: boolean
  score: number
}

export default function TopicPage({ params }: TopicPageProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const topic = stewartTopics.find((t) => t.id === params.topicId)
  const chapter = topic ? stewartChapters.find((c) => c.id === topic.chapterId) : null
  const currentProblem = content?.practiceProblems[selectedProblemIndex]

  useEffect(() => {
    fetchContent()
    fetchProgress()
  }, [params.topicId])

  const fetchContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/content/${params.topicId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setContent(data.content)
      setCached(data.cached)
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error fetching content:", error)
      setError("Failed to load content. Please check your connection and try again.")

      // Auto-retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          fetchContent()
        }, Math.pow(2, retryCount) * 1000)
      }
    }
    setLoading(false)
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/user-progress/${params.topicId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProgress(data.progress)
    } catch (error) {
      console.error("Error fetching progress:", error)
      // Set default progress if fetch fails
      setProgress({
        questionsAttempted: 0,
        questionsCorrect: 0,
        currentStreak: 0,
        bestStreak: 0,
        masteryLevel: 0,
        completed: false,
        score: 0,
      })
    }
  }

  const updateProgress = async (correct: boolean, questionId: string) => {
    try {
      const response = await fetch(`/api/user-progress/${params.topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correct, questionId }),
      })
      const data = await response.json()
      setProgress(data.progress)

      if (correct && data.levelUp) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const checkAnswer = () => {
    if (!currentProblem) return

    let isCorrect = false
    const userResponse = currentProblem.questionType === "Multiple Choice" ? selectedOption : userAnswer.trim()

    if (currentProblem.questionType === "Multiple Choice") {
      isCorrect = selectedOption === currentProblem.correctOption
    } else {
      // For full solution questions, check if the answer matches (with some tolerance for numerical answers)
      const correctAnswer = currentProblem.answer.toLowerCase().trim()
      const userAnswerLower = userAnswer.toLowerCase().trim()

      // Try numerical comparison first
      const correctNum = Number.parseFloat(correctAnswer)
      const userNum = Number.parseFloat(userAnswerLower)

      if (!Number.isNaN(correctNum) && !Number.isNaN(userNum)) {
        isCorrect = Math.abs(correctNum - userNum) < 0.01
      } else {
        // String comparison for non-numerical answers
        isCorrect = correctAnswer === userAnswerLower
      }
    }

    if (isCorrect) {
      setFeedback("🎉 Correct! Well done!")
      setShowAnswer(true)
    } else {
      setFeedback(`❌ Incorrect. The correct answer is ${currentProblem.answer}. Review the solution to learn.`)
      setShowSolution(true)
    }

    // Update progress
    updateProgress(isCorrect, currentProblem.id)
  }

  const regenerateContent = async (type: "example" | "practice") => {
    setRegenerating(type)
    try {
      const response = await fetch(`/api/regenerate/${params.topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const data = await response.json()

      if (content) {
        if (type === "example") {
          setContent({ ...content, example: data.content })
        } else {
          const updatedProblems = [data.content, ...content.practiceProblems]
          setContent({ ...content, practiceProblems: updatedProblems })
          setSelectedProblemIndex(0)
        }
      }

      resetQuestionState()
    } catch (error) {
      console.error("Error regenerating content:", error)
    }
    setRegenerating(null)
  }

  const selectNextProblem = () => {
    if (content && content.practiceProblems.length > 0) {
      setSelectedProblemIndex((prev) => (prev + 1) % content.practiceProblems.length)
      resetQuestionState()
    }
  }

  const selectPreviousProblem = () => {
    if (content && content.practiceProblems.length > 0) {
      setSelectedProblemIndex((prev) => (prev - 1 + content.practiceProblems.length) % content.practiceProblems.length)
      resetQuestionState()
    }
  }

  const resetQuestionState = () => {
    setShowAnswer(false)
    setShowHint(false)
    setShowSolution(false)
    setUserAnswer("")
    setSelectedOption("")
    setFeedback(null)
  }

  if (!topic) {
    return <div>Topic not found</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600">Streak Bonus!</div>
            <div className="text-lg">Keep up the great work!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/chapter/${topic.chapterId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Chapter
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary">
                    {chapter?.title} - Section {topic.order}
                  </Badge>
                  {cached && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Cached Content
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : error && !loading ? ( // Removed the trailing backslash here
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 font-semibold mb-2">Error Loading Content</div>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setRetryCount(0)
                    fetchContent()
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
                {retryCount > 0 && <p className="text-xs text-red-600">Retry attempt {retryCount}/3</p>}
              </div>
            </div>
          </div>
        ) : content ? (
          <div className="space-y-8">
            {/* Progress Indicator */}
            {progress && <ProgressIndicator progress={progress} />}

            {/* Concept Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <span>Concept Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-muted-foreground">
                  <MathRenderer content={content.explanation} />
                </div>
              </CardContent>
            </Card>

            {/* Simple Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span>Simple Example (For Learning)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateContent("example")}
                    disabled={regenerating === "example"}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "example" ? "animate-spin" : ""}`} />
                    {regenerating === "example" ? "Generating..." : "New Example"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="font-semibold mb-2 text-foreground">Problem:</div>
                  <MathRenderer content={content.example.problem} />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold mb-3 text-foreground">Solution Steps:</div>
                  <ol className="space-y-2">
                    {content.example.steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Badge variant="outline" className="mt-1 text-xs">
                          {index + 1}
                        </Badge>
                        <MathRenderer content={step} />
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Practice Problem */}
            {content.practiceProblems.length > 0 && currentProblem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-foreground">
                    <div className="flex items-center space-x-2">
                      <span>Practice Problem</span>
                      {content.practiceProblems.length > 1 && (
                        <Badge variant="outline">
                          {selectedProblemIndex + 1} of {content.practiceProblems.length}
                        </Badge>
                      )}
                      {currentProblem.difficulty && (
                        <Badge
                          variant={
                            currentProblem.difficulty === "easy"
                              ? "secondary"
                              : currentProblem.difficulty === "medium"
                                ? "outline"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {currentProblem.difficulty}
                        </Badge>
                      )}
                      {currentProblem.mark && (
                        <Badge variant="outline" className="text-xs">
                          {currentProblem.mark} marks
                        </Badge>
                      )}
                      {currentProblem.questionType && (
                        <Badge variant="outline" className="text-xs">
                          {currentProblem.questionType}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateContent("practice")}
                      disabled={regenerating === "practice"}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "practice" ? "animate-spin" : ""}`} />
                      {regenerating === "practice" ? "Generating..." : "New Problem"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
                    <div className="font-semibold mb-2 text-foreground">Problem:</div>
                    <MathRenderer content={currentProblem.problem} />
                  </div>

                  {/* Answer Input */}
                  {currentProblem.questionType === "Multiple Choice" && currentProblem.options ? (
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">Select your answer:</div>
                      {currentProblem.options.map((option, index) => (
                        <label key={index} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mcq-option"
                            value={String.fromCharCode(97 + index)} // a, b, c, d, e
                            checked={selectedOption === String.fromCharCode(97 + index)}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="text-primary"
                          />
                          <span>
                            <MathRenderer content={option} />
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="font-semibold text-foreground">Your answer:</label>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className="w-full px-3 py-2 border rounded-md"
                        onKeyPress={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={checkAnswer}
                      disabled={
                        (currentProblem.questionType === "Multiple Choice" && !selectedOption) ||
                        (currentProblem.questionType !== "Multiple Choice" && !userAnswer)
                      }
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Check Answer
                    </Button>

                    {currentProblem.hint && (
                      <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {showSolution ? "Hide Solution" : "Show Solution"}
                    </Button>

                    {content.practiceProblems.length > 1 && (
                      <>
                        <Button variant="outline" size="sm" onClick={selectPreviousProblem}>
                          Previous Problem
                        </Button>
                        <Button variant="outline" size="sm" onClick={selectNextProblem}>
                          Next Problem
                        </Button>
                      </>
                    )}
                  </div>

                  {feedback && (
                    <div
                      className={`p-3 rounded-md ${
                        feedback.includes("Correct")
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {feedback}
                    </div>
                  )}

                  {showHint && currentProblem.hint && (
                    <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                      <strong>💡 Hint:</strong> <MathRenderer content={currentProblem.hint} />
                    </div>
                  )}

                  {showAnswer && (
                    <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                      <strong>✅ Answer:</strong> <MathRenderer content={currentProblem.answer} />
                    </div>
                  )}

                  {showSolution && (
                    <div className="bg-gray-50 p-4 rounded-md border-l-4 border-gray-400">
                      <div className="font-semibold mb-2 text-foreground">📝 Complete Solution:</div>
                      <MathRenderer content={currentProblem.solution} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load content. Please try again.</p>
            <Button onClick={fetchContent} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
