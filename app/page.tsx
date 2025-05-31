"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Target,
  Zap,
  ChevronRight,
  Brain,
  BookOpen,
  Star,
  Trophy,
  Flame,
  Gift,
  AlertTriangle,
  Sparkles,
  Rocket,
  Crown,
  Coffee,
  Heart,
} from "lucide-react"
import { stewartChapters, stewartTopics } from "@/lib/stewart-data"
import type { AICoach } from "@/lib/types"

interface DashboardStats {
  totalTopics: number
  completedTopics: number
  totalQuestionsAnswered: number
  correctAnswers: number
  currentStreak: number
  bestStreak: number
  averageMastery: number
  totalPoints: number
  level: number
  experiencePoints: number
  studyStreak: number
  lastStudiedTopic?: {
    id: string
    title: string
  }
}

interface ValidationResult {
  isComplete: boolean
  totalChapters: number
  totalTopics: number
  missingTopics: string[]
  incompleteChapters: string[]
  aiSuggestions: string
  recommendations: string[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTopics: stewartTopics.length,
    completedTopics: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageMastery: 0,
    totalPoints: 0,
    level: 1,
    experiencePoints: 0,
    studyStreak: 0,
    lastStudiedTopic: undefined,
  })

  const [aiCoach, setAiCoach] = useState<AICoach | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChallenge, setShowChallenge] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      try {
        // Fetch AI coach data
        const coachResponse = await fetch("/api/ai-coach")
        if (coachResponse.ok) {
          const coachData = await coachResponse.json()
          setAiCoach(coachData)
        }

        // Validate chapters
        const validationResponse = await fetch("/api/validate-chapters")
        if (validationResponse.ok) {
          const validationData = await validationResponse.json()
          setValidation(validationData)
        }

        // Simulate some user progress for demo
        await new Promise((resolve) => setTimeout(resolve, 800))

        setStats((prev) => ({
          ...prev,
          totalPoints: 1250,
          level: 3,
          experiencePoints: 750,
          studyStreak: 5,
          currentStreak: 3,
          bestStreak: 8,
          correctAnswers: 47,
          totalQuestionsAnswered: 62,
          completedTopics: 4,
          averageMastery: 78,
        }))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getMotivationalMessage = () => {
    if (stats.studyStreak > 7) return "🔥 You're on fire! This streak is incredible!"
    if (stats.level >= 5) return "🚀 You're becoming a calculus master!"
    if (stats.totalPoints > 1000) return "⭐ Over 1000 points! You're crushing it!"
    return "💪 Every step forward is progress. Keep going!"
  }

  const getLevelProgress = () => {
    const pointsForNextLevel = stats.level * 500
    const currentLevelPoints = stats.experiencePoints % 500
    return (currentLevelPoints / pointsForNextLevel) * 100
  }

  const firstUncompletedChapter = stewartChapters[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="relative">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-yellow-500 animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Preparing your personalized dashboard...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header with Theme Toggle */}
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Welcome Back, Scholar!
            </h1>
            <p className="text-muted-foreground">Ready to conquer calculus today?</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Validation Alert */}
        {validation && !validation.isComplete && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="space-y-2">
              <p className="font-medium text-orange-800 dark:text-orange-200">Curriculum Issues Detected</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">{validation.aiSuggestions}</p>
              {validation.recommendations.length > 0 && (
                <ul className="text-xs text-orange-600 dark:text-orange-400 list-disc list-inside space-y-1">
                  {validation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section with AI Coach */}
        {aiCoach && (
          <section className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 shadow-xl border-0">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          AI Coach
                        </Badge>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{aiCoach.encouragement}</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">{aiCoach.motivationalMessage}</p>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Coffee className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-foreground">Today's Study Tip</p>
                          <p className="text-sm text-muted-foreground">{aiCoach.studyTip}</p>
                        </div>
                      </div>
                    </div>

                    <Link href={`/chapter/${firstUncompletedChapter.id}`}>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Rocket className="h-5 w-5 mr-2" />
                        Start Learning Journey
                      </Button>
                    </Link>
                  </div>

                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                            <Trophy className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-900">{stats.level}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stats.totalPoints}</p>
                          <p className="text-sm text-muted-foreground">Total Points</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Challenge Section */}
        {aiCoach?.currentChallenge && (
          <section>
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{aiCoach.currentChallenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{aiCoach.currentChallenge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-bold text-amber-600">{aiCoach.currentChallenge.pointsReward} pts</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Accept Challenge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: Target,
              label: "Topics Mastered",
              value: stats.completedTopics,
              color: "text-green-600",
              bgColor: "bg-green-50 dark:bg-green-950",
            },
            {
              icon: Flame,
              label: "Study Streak",
              value: `${stats.studyStreak} days`,
              color: "text-orange-600",
              bgColor: "bg-orange-50 dark:bg-orange-950",
            },
            {
              icon: Zap,
              label: "Current Streak",
              value: stats.currentStreak,
              color: "text-blue-600",
              bgColor: "bg-blue-50 dark:bg-blue-950",
            },
            {
              icon: Heart,
              label: "Accuracy",
              value: `${Math.round((stats.correctAnswers / Math.max(stats.totalQuestionsAnswered, 1)) * 100)}%`,
              color: "text-pink-600",
              bgColor: "bg-pink-50 dark:bg-pink-950",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`${stat.bgColor} border-0 shadow-md hover:shadow-lg transition-all duration-200`}
            >
              <CardContent className="p-5 text-center">
                <stat.icon className={`h-7 w-7 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Level Progress */}
        <section>
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span>Level {stats.level} Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.experiencePoints} XP</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Next Level</span>
                  <span className="text-sm font-medium text-foreground">{Math.round(getLevelProgress())}%</span>
                </div>
                <Progress value={getLevelProgress()} className="h-3 bg-muted" />
              </div>
              <p className="text-sm text-muted-foreground text-center">{getMotivationalMessage()}</p>
            </CardContent>
          </Card>
        </section>

        {/* Chapters Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Explore Chapters</h2>
            <Badge variant="outline" className="border-foreground text-foreground">
              {stewartChapters.length} Chapters
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stewartChapters.map((chapter, index) => (
              <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
                <Card className="shadow-md border-0 hover:shadow-xl transition-all duration-300 group h-full flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        Chapter {chapter.order}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-md font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{chapter.description}</p>
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                  <div className="p-4 mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Start Chapter
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Final Encouragement */}
        <section className="text-center py-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Your Calculus Adventure Awaits!</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every problem solved, every concept mastered, brings you closer to mathematical excellence. The journey of
              a thousand derivatives begins with a single limit!
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
