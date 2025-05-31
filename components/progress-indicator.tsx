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
  const safeProgress = {
    questionsAttempted: 0,
    questionsCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryLevel: 0,
    completed: false,
    score: 0,
    ...progress,
  }

  const accuracy =
    safeProgress.questionsAttempted > 0
      ? Math.round((safeProgress.questionsCorrect / safeProgress.questionsAttempted) * 100)
      : 0

  const getMasteryLabel = (level: number) => {
    if (typeof level !== "number" || isNaN(level)) return "Loading..."
    if (level >= 80) return "Mastered"
    if (level >= 60) return "Good Progress"
    if (level >= 40) return "Learning"
    return "Getting Started"
  }

  if (!showDetails) {
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">Progress: {safeProgress.masteryLevel}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-foreground" />
          <span className="text-sm text-foreground">Streak: {safeProgress.currentStreak}</span>
        </div>
        {safeProgress.completed && (
          <Badge variant="default" className="bg-foreground text-background w-fit ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <Trophy className="h-5 w-5" />
          <span>Your Progress</span>
          {safeProgress.completed && (
            <Badge variant="default" className="bg-foreground text-background ml-auto">
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
            <span className="text-sm font-bold text-foreground">
              {getMasteryLabel(safeProgress.masteryLevel)} ({safeProgress.masteryLevel}%)
            </span>
          </div>
          <Progress value={safeProgress.masteryLevel} className="h-3 bg-muted" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <Award className="h-4 w-4 text-foreground" />
              <span className="text-xs text-foreground font-medium">Correct</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{safeProgress.questionsCorrect}</div>
          </div>

          <div className="bg-muted p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <Target className="h-4 w-4 text-foreground" />
              <span className="text-xs text-foreground font-medium">Attempted</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{safeProgress.questionsAttempted}</div>
          </div>

          <div className="bg-muted p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <Zap className="h-4 w-4 text-foreground" />
              <span className="text-xs text-foreground font-medium">Current</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{safeProgress.currentStreak}</div>
          </div>

          <div className="bg-muted p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <TrendingUp className="h-4 w-4 text-foreground" />
              <span className="text-xs text-foreground font-medium">Best</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{safeProgress.bestStreak}</div>
          </div>
        </div>

        {/* Accuracy */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
            <span className="text-sm font-bold text-foreground">{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-2 bg-muted" />
        </div>

        {/* Streak Indicator */}
        {safeProgress.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-foreground text-background rounded-lg">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium">
              {safeProgress.currentStreak} question streak!
              {safeProgress.currentStreak >= 5 && " 🔥"}
              {safeProgress.currentStreak >= 10 && " Amazing!"}
            </span>
          </div>
        )}

        {/* Next Milestone */}
        {!safeProgress.completed && (
          <div className="text-center p-3 bg-muted rounded-lg border border-border">
            <div className="text-sm text-foreground">
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
}
