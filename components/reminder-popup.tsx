"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MathRenderer } from "@/components/math-renderer"
import { X, Brain, Clock, Lightbulb, Star, CheckCircle2 } from "lucide-react"

interface ReminderQuestion {
  question: string
  answer: string
  explanation: string
  topic: string
  timeEstimate: string
  encouragement: string
  mnemonic: string
}

interface ReminderPopupProps {
  isOpen: boolean
  onClose: () => void
  question: ReminderQuestion | null
}

export function ReminderPopup({ isOpen, onClose, question }: ReminderPopupProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isAnswered, setIsAnswered] = useState(false)

  useEffect(() => {
    if (isOpen && !showAnswer) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen, showAnswer])

  useEffect(() => {
    if (isOpen) {
      setShowAnswer(false)
      setTimeLeft(30)
      setIsAnswered(false)
    }
  }, [isOpen])

  if (!isOpen || !question) return null

  const handleShowAnswer = () => {
    setShowAnswer(true)
    setIsAnswered(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Quick Brain Boost!</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {question.topic}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{question.timeEstimate}</span>
            </div>
            {!showAnswer && (
              <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Question */}
          <div className="bg-white/70 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <MathRenderer content={question.question} />
          </div>

          {/* Answer Section */}
          {showAnswer ? (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Answer:</span>
                </div>
                <MathRenderer content={question.answer} />
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">Memory Trick:</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">{question.mnemonic}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
              </div>

              <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Well Done!</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{question.encouragement}</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Take your time to think, then reveal the answer!</p>
              <Button
                onClick={handleShowAnswer}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Show Answer
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isAnswered && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
              >
                Got it! ✓
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1 text-muted-foreground hover:bg-muted">
              {isAnswered ? "Close" : "Skip for now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
