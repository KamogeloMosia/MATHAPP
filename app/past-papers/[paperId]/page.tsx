"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MathRenderer } from "@/components/math-renderer"
import { ArrowLeft, Clock, Target, FileText, Download, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"

interface PastPaper {
  id: string
  paperInfo: {
    title: string
    course: string
    duration: string
    totalMarks: number
    instructions: string[]
  }
  sectionA: {
    title: string
    instructions: string
    questions: Array<{
      questionNumber: number
      marks: number
      question: string
      options: {
        a: string
        b: string
        c: string
        d: string
        e: string
      }
      correctAnswer: string
      solution: string
      topic: string
    }>
  }
  sectionB: {
    title: string
    instructions: string
    questions: Array<{
      questionNumber: number
      totalMarks: number
      topic: string
      parts: Array<{
        part: string
        marks: number
        question: string
        solution: string
        markingScheme: string[]
      }>
    }>
  }
  metadata: {
    generatedAt: string
    difficulty: string
    estimatedTime: string
  }
}

export default function PastPaperPage() {
  const params = useParams()
  const paperId = params.paperId as string

  const [paper, setPaper] = useState<PastPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSolutions, setShowSolutions] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPaper()
  }, [paperId])

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/past-papers/${paperId}`)
      const data = await response.json()
      setPaper(data)
    } catch (error) {
      console.error("Error fetching paper:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const getAnswerStatus = (questionId: string, correctAnswer: string) => {
    const selected = selectedAnswers[questionId]
    if (!selected) return null
    return selected === correctAnswer ? "correct" : "incorrect"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-lg text-muted-foreground">Loading past paper...</p>
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-foreground">Paper not found</h2>
          <p className="text-muted-foreground">The requested past paper could not be loaded.</p>
          <Link href="/past-papers">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Papers
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <Link href="/past-papers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Papers
            </Button>
          </Link>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">{paper.paperInfo.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{paper.paperInfo.course}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSolutions(!showSolutions)}>
                    {showSolutions ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Solutions
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Solutions
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{paper.paperInfo.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span>{paper.paperInfo.totalMarks} marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{paper.metadata.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>AI Generated</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {paper.paperInfo.instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </header>

        {/* Section A: Multiple Choice */}
        <section>
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{paper.sectionA.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{paper.sectionA.instructions}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {paper.sectionA.questions.map((question) => {
                const questionId = `mcq-${question.questionNumber}`
                const answerStatus = getAnswerStatus(questionId, question.correctAnswer)

                return (
                  <div key={question.questionNumber} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {question.questionNumber}</Badge>
                          <Badge variant="secondary">{question.marks} marks</Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.topic}
                          </Badge>
                        </div>
                        <div className="text-foreground">
                          <MathRenderer content={question.question} />
                        </div>
                      </div>
                      {answerStatus && (
                        <div className="ml-4">
                          {answerStatus === "correct" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 ml-4">
                      {Object.entries(question.options).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => handleAnswerSelect(questionId, key)}
                          className={`text-left p-3 rounded-lg border transition-colors ${
                            selectedAnswers[questionId] === key
                              ? answerStatus === "correct"
                                ? "border-green-500 bg-green-50 dark:bg-green-950"
                                : answerStatus === "incorrect"
                                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                                  : "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : showSolutions && key === question.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-950"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          <span className="font-medium">({key}) </span>
                          <MathRenderer content={value} />
                        </button>
                      ))}
                    </div>

                    {showSolutions && (
                      <div className="ml-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Correct Answer: ({question.correctAnswer})</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <MathRenderer content={question.solution} />
                        </div>
                      </div>
                    )}

                    <Separator />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>

        {/* Section B: Structured Questions */}
        <section>
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{paper.sectionB.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{paper.sectionB.instructions}</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {paper.sectionB.questions.map((question) => (
                <div key={question.questionNumber} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Question {question.questionNumber}</Badge>
                    <Badge variant="secondary">{question.totalMarks} marks</Badge>
                    <Badge variant="outline" className="text-xs">
                      {question.topic}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {question.parts.map((part) => (
                      <div key={part.part} className="ml-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">({part.part})</span>
                          <Badge variant="outline" className="text-xs">
                            {part.marks} marks
                          </Badge>
                        </div>

                        <div className="text-foreground ml-6">
                          <MathRenderer content={part.question} />
                        </div>

                        {showSolutions && (
                          <div className="ml-6 space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <h5 className="font-medium text-sm mb-2 text-green-600">Solution:</h5>
                              <div className="text-sm">
                                <MathRenderer content={part.solution} />
                              </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <h5 className="font-medium text-sm mb-2 text-blue-600">Marking Scheme:</h5>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {part.markingScheme.map((mark, index) => (
                                  <li key={index}>• {mark}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
