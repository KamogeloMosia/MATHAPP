"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  Check,
  BookOpen,
  Target,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
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

      if (!data.content || !data.cached) {
        setBackgroundLoading(true)
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
      setFeedback("✓ Correct! Well done!")
      setShowAnswer(true)
    } else {
      setFeedback(`✗ Incorrect. The correct answer is ${currentProblem.answer}. Review the solution to learn.`)
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
        <Card className="w-full max-w-md border border-border">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Topic Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested topic could not be found.</p>
            <Link href="/">
              <Button className="bg-foreground text-background hover:bg-foreground/90">Return Home</Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white text-black p-8 rounded-lg text-center animate-bounce mx-4 shadow-2xl border-2 border-black">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-2xl font-bold">Streak Bonus!</div>
            <div className="text-lg">Keep the momentum going!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/chapter/${topic.chapterId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-foreground text-foreground text-xs">
                    {chapter?.title} - Section {topic.order}
                  </Badge>
                  {cached && (
                    <Badge variant="outline" className="border-foreground text-foreground text-xs">
                      Cached
                    </Badge>
                  )}
                  {backgroundLoading && (
                    <Badge variant="outline" className="border-foreground text-foreground text-xs">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Loading
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Progress */}
          {!loading && progress && (
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <ProgressIndicator progress={progress} />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* Mobile Progress */}
            {!loading && progress && (
              <div className="lg:hidden mb-6">
                <ProgressIndicator progress={progress} showDetails={false} />
              </div>
            )}

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border">
                    <CardHeader className="border-b border-border">
                      <div className="animate-pulse">
                        <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
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
              <div className="text-center py-12">
                <Card className="max-w-md mx-auto border border-border">
                  <CardContent className="p-6">
                    <div className="text-foreground font-semibold mb-2">Error Loading Content</div>
                    <p className="text-muted-foreground text-sm mb-4">{error}</p>
                    <Button
                      onClick={() => {
                        setRetryCount(0)
                        fetchContent()
                      }}
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : content ? (
              <div className="space-y-8">
                {/* Concept Overview */}
                <Card className="border border-border">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <BookOpen className="h-5 w-5" />
                      <span>Concept Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <MathRenderer content={content.explanation} />
                    </div>
                  </CardContent>
                </Card>

                {/* Worked Example */}
                <Card className="border border-border">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Target className="h-5 w-5" />
                        <span>Worked Example</span>
                        {content.example.marks && (
                          <Badge variant="outline" className="border-foreground text-foreground ml-2">
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
                        className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "example" ? "animate-spin" : ""}`} />
                        New Example
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Problem Statement */}
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                          Q
                        </div>
                        <div className="font-semibold text-foreground">Problem</div>
                      </div>
                      <div className="text-foreground">
                        <MathRenderer content={content.example.problem} />
                      </div>
                    </div>

                    {/* Solution Steps */}
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                          S
                        </div>
                        <div className="font-semibold text-foreground">Solution</div>
                      </div>

                      <div className="space-y-4">
                        {content.example.steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-border">
                            <Badge variant="outline" className="shrink-0 border-foreground text-foreground">
                              Step {index + 1}
                            </Badge>
                            <div className="flex-1 text-foreground">
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
                  <Card className="border border-border">
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <CardTitle className="flex items-center space-x-2 text-foreground">
                            <Clock className="h-5 w-5" />
                            <span>Practice Problem</span>
                          </CardTitle>
                          <div className="flex gap-2">
                            {content.practiceProblems.length > 1 && (
                              <Badge variant="outline" className="border-foreground text-foreground text-xs">
                                {selectedProblemIndex + 1} of {content.practiceProblems.length}
                              </Badge>
                            )}
                            {currentProblem.mark && (
                              <Badge variant="outline" className="border-foreground text-foreground text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {currentProblem.mark} marks
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateContent("practice")}
                          disabled={regenerating === "practice"}
                          className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === "practice" ? "animate-spin" : ""}`} />
                          New Problem
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Problem Statement */}
                      <div className="p-6 border-b border-border">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                            Q
                          </div>
                          <div className="font-semibold text-foreground">Problem</div>
                          {currentProblem.mark && (
                            <div className="text-sm text-muted-foreground ml-auto">[{currentProblem.mark} marks]</div>
                          )}
                        </div>
                        <div className="text-foreground">
                          <MathRenderer content={currentProblem.problem} />
                        </div>
                      </div>

                      {/* Answer Input */}
                      <div className="p-6 space-y-4">
                        {currentProblem.questionType === "Multiple Choice" && currentProblem.options ? (
                          <div className="space-y-3">
                            <div className="font-semibold text-foreground">Select your answer:</div>
                            <div className="space-y-2">
                              {currentProblem.options.map((option, index) => (
                                <label
                                  key={index}
                                  className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                                    selectedOption === String.fromCharCode(97 + index)
                                      ? "bg-foreground text-background border-foreground"
                                      : "border-border hover:bg-muted"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="mcq-option"
                                    value={String.fromCharCode(97 + index)}
                                    checked={selectedOption === String.fromCharCode(97 + index)}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                    className="mt-1"
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
                              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-foreground focus:border-foreground bg-background text-foreground"
                              onKeyPress={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                            />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <Button
                            onClick={checkAnswer}
                            disabled={
                              (currentProblem.questionType === "Multiple Choice" && !selectedOption) ||
                              (currentProblem.questionType !== "Multiple Choice" && !userAnswer)
                            }
                            className="bg-foreground text-background hover:bg-foreground/90"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Check
                          </Button>

                          {currentProblem.hint && (
                            <Button
                              variant="outline"
                              onClick={() => setShowHint(!showHint)}
                              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Hint
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => setShowSolution(!showSolution)}
                            className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Solution
                          </Button>

                          {content.practiceProblems.length > 1 && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={selectPreviousProblem}
                                className="flex-1 border-foreground text-foreground hover:bg-foreground hover:text-background"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={selectNextProblem}
                                className="flex-1 border-foreground text-foreground hover:bg-foreground hover:text-background"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Feedback */}
                        {feedback && (
                          <div
                            className={`p-4 rounded-lg border ${
                              feedback.includes("Correct")
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-foreground"
                            }`}
                          >
                            {feedback}
                          </div>
                        )}

                        {/* Hint */}
                        {showHint && currentProblem.hint && (
                          <div className="bg-muted border border-border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-foreground" />
                              <strong className="text-foreground">Hint:</strong>
                            </div>
                            <div className="text-foreground">
                              <MathRenderer content={currentProblem.hint} />
                            </div>
                          </div>
                        )}

                        {/* Answer */}
                        {showAnswer && (
                          <div className="bg-foreground text-background border border-foreground rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-4 w-4" />
                              <strong>Answer:</strong>
                            </div>
                            <div>
                              <MathRenderer content={currentProblem.answer} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Complete Solution */}
                      {showSolution && (
                        <div className="p-6 bg-muted border-t border-border">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                              S
                            </div>
                            <strong className="text-foreground">Complete Solution:</strong>
                            {currentProblem.mark && (
                              <div className="text-sm text-muted-foreground ml-auto">[{currentProblem.mark} marks]</div>
                            )}
                          </div>
                          <div className="text-foreground">
                            <MathRenderer content={currentProblem.solution} />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Study Tip */}
                <div className="bg-muted border border-border rounded-lg p-4 text-sm text-foreground flex items-start space-x-3">
                  <Info className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Study Tip</p>
                    <p className="text-muted-foreground">
                      Practice regularly with different problem types to build mastery. Try to solve problems without
                      looking at the solution first.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Card className="max-w-md mx-auto border border-border">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">Failed to load content. Please try again.</p>
                    <Button
                      onClick={fetchContent}
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
