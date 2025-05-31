"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, RefreshCw, Lightbulb, CheckCircle, Check, BookOpen, Target, Clock, Award } from "lucide-react"
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
    marks?: number
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
  const [backgroundLoading, setBackgroundLoading] = useState(false)
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
      setRetryCount(0)

      // If no content exists, start background generation
      if (!data.content || !data.cached) {
        setBackgroundLoading(true)
        // Background generation will happen automatically via the API
        setTimeout(() => setBackgroundLoading(false), 3000)
      }
    } catch (error) {
      console.error("Error fetching content:", error)
      setError("Failed to load content. Please check your connection and try again.")

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
      const correctAnswer = currentProblem.answer.toLowerCase().trim()
      const userAnswerLower = userAnswer.toLowerCase().trim()

      const correctNum = Number.parseFloat(correctAnswer)
      const userNum = Number.parseFloat(userAnswerLower)

      if (!Number.isNaN(correctNum) && !Number.isNaN(userNum)) {
        isCorrect = Math.abs(correctNum - userNum) < 0.01
      } else {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Topic Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested topic could not be found.</p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 md:p-8 rounded-lg text-center animate-bounce mx-4">
            <div className="text-4xl md:text-6xl mb-4">🎉</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">Streak Bonus!</div>
            <div className="text-base md:text-lg">Keep up the great work!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/chapter/${topic.chapterId}`}>
                <Button variant="outline" size="sm" className="shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Chapter</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {chapter?.title} - Section {topic.order}
                  </Badge>
                  {cached && (
                    <Badge variant="outline" className="text-xs text-primary border-primary">
                      Cached
                    </Badge>
                  )}
                  {backgroundLoading && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating
                    </Badge>
                  )}
                </div>
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{topic.title}</h1>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
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
            ))}
          </div>
        ) : error && !loading ? (
          <div className="text-center py-8 md:py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </div>
        ) : content ? (
          <>
            {/* Progress Indicator */}
            {progress && (
              <div className="md:hidden">
                <ProgressIndicator progress={progress} showDetails={false} />
              </div>
            )}
            {progress && (
              <div className="hidden md:block">
                <ProgressIndicator progress={progress} />
              </div>
            )}

            {/* Concept Overview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Concept Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm md:prose max-w-none text-muted-foreground">
                  <MathRenderer content={content.explanation} />
                </div>
              </CardContent>
            </Card>

            {/* Worked Example */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Worked Example</span>
                    {content.example.marks && (
                      <Badge variant="outline" className="ml-2">
                        <Award className="h-3 w-3 mr-1" />
                        {content.example.marks} marks
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateContent("example")}
                    disabled={regenerating === "example"}
                    className="shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "example" ? "animate-spin" : ""}`} />
                    {regenerating === "example" ? "Generating..." : "New Example"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Problem Statement */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      Q
                    </div>
                    <div className="font-semibold text-blue-900">Problem</div>
                  </div>
                  <div className="text-blue-800">
                    <MathRenderer content={content.example.problem} />
                  </div>
                </div>

                <Separator />

                {/* Solution Steps */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      S
                    </div>
                    <div className="font-semibold text-green-900">Solution</div>
                  </div>

                  <div className="space-y-4">
                    {content.example.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4"
                      >
                        <Badge variant="outline" className="shrink-0 w-fit bg-white border-green-300 text-green-700">
                          Step {index + 1}
                        </Badge>
                        <div className="flex-1 text-green-800">
                          <MathRenderer content={step} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practice Problem */}
            {content.practiceProblems.length > 0 && currentProblem && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <span>Practice Problem</span>
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {content.practiceProblems.length > 1 && (
                          <Badge variant="outline" className="text-xs">
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
                            <Award className="h-3 w-3 mr-1" />
                            {currentProblem.mark} marks
                          </Badge>
                        )}
                        {currentProblem.questionType && (
                          <Badge variant="outline" className="text-xs">
                            {currentProblem.questionType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateContent("practice")}
                      disabled={regenerating === "practice"}
                      className="shrink-0"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "practice" ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">
                        {regenerating === "practice" ? "Generating..." : "New Problem"}
                      </span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Problem Statement */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 md:p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        Q
                      </div>
                      <div className="font-semibold text-orange-900">Problem</div>
                      {currentProblem.mark && (
                        <div className="text-sm text-orange-700 ml-auto">[{currentProblem.mark} marks]</div>
                      )}
                    </div>
                    <div className="text-orange-800">
                      <MathRenderer content={currentProblem.problem} />
                    </div>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    {currentProblem.questionType === "Multiple Choice" && currentProblem.options ? (
                      <div className="space-y-3">
                        <div className="font-semibold text-foreground">Select your answer:</div>
                        <div className="space-y-2">
                          {currentProblem.options.map((option, index) => (
                            <label
                              key={index}
                              className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                name="mcq-option"
                                value={String.fromCharCode(97 + index)}
                                checked={selectedOption === String.fromCharCode(97 + index)}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                className="mt-1 text-primary"
                              />
                              <div className="flex-1">
                                <MathRenderer content={option} />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="font-semibold text-foreground">Your answer:</label>
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Enter your answer"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          onKeyPress={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={checkAnswer}
                        disabled={
                          (currentProblem.questionType === "Multiple Choice" && !selectedOption) ||
                          (currentProblem.questionType !== "Multiple Choice" && !userAnswer)
                        }
                        className="flex-1 md:flex-none"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Check Answer
                      </Button>

                      {currentProblem.hint && (
                        <Button variant="outline" size="default" onClick={() => setShowHint(!showHint)}>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          {showHint ? "Hide Hint" : "Hint"}
                        </Button>
                      )}

                      <Button variant="outline" size="default" onClick={() => setShowSolution(!showSolution)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {showSolution ? "Hide Solution" : "Solution"}
                      </Button>
                    </div>

                    {/* Navigation Buttons */}
                    {content.practiceProblems.length > 1 && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={selectPreviousProblem} className="flex-1">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={selectNextProblem} className="flex-1">
                          Next
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {feedback && (
                    <div
                      className={`p-4 rounded-lg border ${
                        feedback.includes("Correct")
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {feedback}
                    </div>
                  )}

                  {/* Hint */}
                  {showHint && currentProblem.hint && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <strong className="text-blue-800">Hint:</strong>
                      </div>
                      <div className="text-blue-700">
                        <MathRenderer content={currentProblem.hint} />
                      </div>
                    </div>
                  )}

                  {/* Answer */}
                  {showAnswer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <strong className="text-green-800">Answer:</strong>
                      </div>
                      <div className="text-green-700">
                        <MathRenderer content={currentProblem.answer} />
                      </div>
                    </div>
                  )}

                  {/* Complete Solution */}
                  {showSolution && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          S
                        </div>
                        <strong className="text-gray-800">Complete Solution:</strong>
                        {currentProblem.mark && (
                          <div className="text-sm text-gray-600 ml-auto">[{currentProblem.mark} marks]</div>
                        )}
                      </div>
                      <div className="text-gray-700">
                        <MathRenderer content={currentProblem.solution} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-8 md:py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">Failed to load content. Please try again.</p>
                <Button onClick={fetchContent} className="w-full">
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
