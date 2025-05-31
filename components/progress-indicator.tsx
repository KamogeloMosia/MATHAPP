"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap, CheckCircle } from "lucide-react"

interface ProgressIndicatorProps {
  progress: {
    questionsAttempted: number
    questionsCorrect: number
    currentStreak: number
    bestStreak: number
    masteryLevel: number
    completed: boolean
    score: number
  }
  showDetails?: boolean
}

export function ProgressIndicator({ progress, showDetails = true }: ProgressIndicatorProps) {
  // Ensure progress has all required fields with defaults
  const safeProgress = {
    questionsAttempted: 0,
    questionsCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryLevel: 0,
    completed: false,
    score: 0,
    ...progress, // Override with actual progress if available
  }

  const accuracy =
    safeProgress.questionsAttempted > 0
      ? Math.round((safeProgress.questionsCorrect / safeProgress.questionsAttempted) * 100)
      : 0

  try {
    const getMasteryColor = (level: number) => {
      if (typeof level !== "number" || isNaN(level)) return "text-gray-600"
      if (level >= 80) return "text-green-600"
      if (level >= 60) return "text-yellow-600"
      return "text-red-600"
    }

    const getMasteryLabel = (level: number) => {
      if (typeof level !== "number" || isNaN(level)) return "Loading..."
      if (level >= 80) return "Mastered"
      if (level >= 60) return "Good Progress"
      if (level >= 40) return "Learning"
      return "Getting Started"
    }

    if (!showDetails) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Progress: {safeProgress.masteryLevel}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Streak: {safeProgress.currentStreak}</span>
          </div>
          {safeProgress.completed && (
            <Badge variant="default" className="bg-green-600 w-fit">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Your Progress</span>
            {safeProgress.completed && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Mastered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mastery Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Mastery Level</span>
              <span className={`text-sm font-bold ${getMasteryColor(safeProgress.masteryLevel)}`}>
                {getMasteryLabel(safeProgress.masteryLevel)} ({safeProgress.masteryLevel}%)
              </span>
            </div>
            <Progress value={safeProgress.masteryLevel} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{safeProgress.questionsCorrect}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-muted-foreground">{safeProgress.questionsAttempted}</div>
              <div className="text-xs text-muted-foreground">Attempted</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-500">{safeProgress.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{safeProgress.bestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
              <span className="text-sm font-bold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          {/* Streak Indicator */}
          {safeProgress.currentStreak > 0 && (
            <div className="flex items-center justify-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {safeProgress.currentStreak} question streak!
                {safeProgress.currentStreak >= 5 && " 🔥"}
                {safeProgress.currentStreak >= 10 && " Amazing!"}
              </span>
            </div>
          )}

          {/* Next Milestone */}
          {!safeProgress.completed && (
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                {safeProgress.masteryLevel < 80 ? (
                  <>Need {80 - safeProgress.masteryLevel}% more to master this topic</>
                ) : (
                  <>Almost there! Answer {Math.max(0, 5 - safeProgress.questionsCorrect)} more correctly to complete</>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error in ProgressIndicator:", error)
    return <div>Error displaying progress.</div>
  }
}
