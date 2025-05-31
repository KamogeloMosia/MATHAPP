"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Eye, EyeOff, Lightbulb, CheckCircle } from "lucide-react"
import { MathRenderer } from "@/components/math-renderer"
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
    problem: string
    answer: string
    hint?: string
    solution: string
    difficulty: string
    created_by: string
  }[]
}

export default function TopicPage({ params }: TopicPageProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)

  const topic = stewartTopics.find((t) => t.id === params.topicId)
  const chapter = topic ? stewartChapters.find((c) => c.id === topic.chapterId) : null

  useEffect(() => {
    fetchContent()
  }, [params.topicId])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/${params.topicId}`)
      const data = await response.json()
      setContent(data.content)
      setCached(data.cached)
    } catch (error) {
      console.error("Error fetching content:", error)
    }
    setLoading(false)
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
          // Keep existing problems but add the new one at the beginning
          const updatedProblems = [data.content, ...content.practiceProblems]
          setContent({ ...content, practiceProblems: updatedProblems })
          setSelectedProblemIndex(0) // Select the new problem
        }
      }

      // Reset visibility states
      setShowAnswer(false)
      setShowHint(false)
      setShowSolution(false)
    } catch (error) {
      console.error("Error regenerating content:", error)
    }
    setRegenerating(null)
  }

  const selectNextProblem = () => {
    if (content && content.practiceProblems.length > 0) {
      setSelectedProblemIndex((prev) => (prev + 1) % content.practiceProblems.length)
      setShowAnswer(false)
      setShowHint(false)
      setShowSolution(false)
    }
  }

  const selectPreviousProblem = () => {
    if (content && content.practiceProblems.length > 0) {
      setSelectedProblemIndex((prev) => (prev - 1 + content.practiceProblems.length) % content.practiceProblems.length)
      setShowAnswer(false)
      setShowHint(false)
      setShowSolution(false)
    }
  }

  if (!topic) {
    return <div>Topic not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Cached Content
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{topic.title}</h1>
                <p className="text-sm text-gray-600">{topic.description}</p>
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
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : content ? (
          <div className="space-y-8">
            {/* Concept Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Concept Explanation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <MathRenderer content={content.explanation} />
                </div>
              </CardContent>
            </Card>

            {/* Worked Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Worked Example</span>
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
                  <div className="font-semibold mb-2">Problem:</div>
                  <MathRenderer content={content.example.problem} />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold mb-3">Solution Steps:</div>
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

                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="font-semibold mb-2">Complete Solution:</div>
                  <MathRenderer content={content.example.solution} />
                </div>
              </CardContent>
            </Card>

            {/* Practice Problem */}
            {content.practiceProblems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>Practice Problem</span>
                      {content.practiceProblems.length > 1 && (
                        <Badge variant="outline">
                          {selectedProblemIndex + 1} of {content.practiceProblems.length}
                        </Badge>
                      )}
                      {content.practiceProblems[selectedProblemIndex].difficulty && (
                        <Badge
                          variant={
                            content.practiceProblems[selectedProblemIndex].difficulty === "easy"
                              ? "secondary"
                              : content.practiceProblems[selectedProblemIndex].difficulty === "medium"
                                ? "outline"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {content.practiceProblems[selectedProblemIndex].difficulty}
                        </Badge>
                      )}
                      {content.practiceProblems[selectedProblemIndex].created_by && (
                        <Badge variant="outline" className="text-xs">
                          {content.practiceProblems[selectedProblemIndex].created_by}
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
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="font-semibold mb-2">Try this problem:</div>
                    <MathRenderer content={content.practiceProblems[selectedProblemIndex].problem} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAnswer(!showAnswer)}>
                      {showAnswer ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showAnswer ? "Hide Answer" : "Show Answer"}
                    </Button>

                    {content.practiceProblems[selectedProblemIndex].hint && (
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

                  {showHint && content.practiceProblems[selectedProblemIndex].hint && (
                    <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                      <strong>💡 Hint:</strong>{" "}
                      <MathRenderer content={content.practiceProblems[selectedProblemIndex].hint} />
                    </div>
                  )}

                  {showAnswer && (
                    <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                      <strong>✅ Answer:</strong>{" "}
                      <MathRenderer content={content.practiceProblems[selectedProblemIndex].answer} />
                    </div>
                  )}

                  {showSolution && (
                    <div className="bg-gray-50 p-4 rounded-md border-l-4 border-gray-400">
                      <div className="font-semibold mb-2">📝 Complete Solution:</div>
                      <MathRenderer content={content.practiceProblems[selectedProblemIndex].solution} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load content. Please try again.</p>
            <Button onClick={fetchContent} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
