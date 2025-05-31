"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap, CheckCircle, Award, TrendingUp } from "lucide-react"

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
      if (typeof level !== "number" || isNaN(level)) return "text-gray-600 dark:text-gray-400"
      if (level >= 80) return "text-green-600 dark:text-green-400"
      if (level >= 60) return "text-yellow-600 dark:text-yellow-400"
      return "text-red-600 dark:text-red-400"
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
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Progress: {safeProgress.masteryLevel}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Streak: {safeProgress.currentStreak}</span>
          </div>
          {safeProgress.completed && (
            <Badge variant="default" className="bg-green-600 w-fit ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      )
    }

    return (
      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 pb-4 border-b border-border/20">
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Your Progress</span>
            {safeProgress.completed && (
              <Badge variant="default" className="bg-green-600 ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Mastered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {/* Mastery Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Mastery Level</span>
              <span className={`text-sm font-bold ${getMasteryColor(safeProgress.masteryLevel)}`}>
                {getMasteryLabel(safeProgress.masteryLevel)} ({safeProgress.masteryLevel}%)
              </span>
            </div>
            <Progress value={safeProgress.masteryLevel} className="h-3 bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center justify-between mb-1">
                <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Correct</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{safeProgress.questionsCorrect}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700/30">
              <div className="flex items-center justify-between mb-1">
                <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Attempted</span>
              </div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {safeProgress.questionsAttempted}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30">
              <div className="flex items-center justify-between mb-1">
                <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {safeProgress.currentStreak}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Best</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{safeProgress.bestStreak}</div>
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
              <span className="text-sm font-bold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2 bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Streak Indicator */}
          {safeProgress.currentStreak > 0 && (
            <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
              <Zap className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {safeProgress.currentStreak} question streak!
                {safeProgress.currentStreak >= 5 && " 🔥"}
                {safeProgress.currentStreak >= 10 && " Amazing!"}
              </span>
            </div>
          )}

          {/* Next Milestone */}
          {!safeProgress.completed && (
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <div className="text-sm text-blue-700 dark:text-blue-300">
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
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800/30">
        Error displaying progress. Please refresh the page.
      </div>
    )
  }
}
