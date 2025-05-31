"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Zap, TrendingUp, Award, ChevronRight, Brain, CheckCircle2, BookOpen, PlayCircle } from "lucide-react"
import { stewartChapters, stewartTopics } from "@/lib/stewart-data"

interface DashboardStats {
  totalTopics: number
  completedTopics: number
  totalQuestionsAnswered: number // Renamed for clarity
  correctAnswers: number
  currentStreak: number
  bestStreak: number
  averageMastery: number
  lastStudiedTopic?: {
    id: string
    title: string
  }
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
    lastStudiedTopic: undefined, // No last studied topic initially
  })
  const [loading, setLoading] = useState(true) // Keep loading for initial effect if desired
  const [motivationalQuote, setMotivationalQuote] = useState("")

  const quotes = [
    "The journey of a thousand miles begins with a single step. Start your calculus adventure!",
    "Embrace the challenge. Every problem solved is a step towards mastery.",
    "Calculus is the art of thinking precisely. Sharpen your mind today.",
    "Don't watch the clock; do what it does. Keep going.",
    "The beautiful thing about learning is that no one can take it away from you.",
  ]

  useEffect(() => {
    // Simulate fetching initial (zeroed) stats or user data
    // In a real app, you'd fetch this from your backend
    const fetchInitialData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate short load
      // If there was a last studied topic, it would be set here
      // For now, it's undefined as metrics are reset.
      // Example: setStats(prev => ({ ...prev, lastStudiedTopic: { id: "limits-function", title: "The Limit of a Function" }}));
      setLoading(false)
    }
    fetchInitialData()
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  const getMotivationalMessage = () => {
    if (stats.averageMastery === 0 && stats.completedTopics === 0) {
      return "🚀 Ready to dive into calculus? Pick a chapter and let's begin!"
    }
    if (stats.currentStreak > 0) return `⚡ Keep that ${stats.currentStreak}-day streak going!`
    return "🎯 Every concept mastered brings you closer to your goal."
  }

  const firstUncompletedChapter =
    stewartChapters.find(
      (chapter) =>
        !stewartTopics
          .filter((t) => t.chapterId === chapter.id)
          .every((topic) =>
            // This logic would need actual progress data to be accurate
            // For now, just defaults to the first chapter if no progress
            stats.completedTopics > 0 ? Math.random() > 0.5 : false,
          ),
    ) || stewartChapters[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Loading Your Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Calculus Dashboard</h1>
          <p className="text-md text-muted-foreground max-w-xl mx-auto">{motivationalQuote}</p>
          <p className="text-lg font-medium text-foreground">{getMotivationalMessage()}</p>
        </header>

        {/* Main Call to Action / Continue Learning */}
        <section>
          <Card className="border-2 border-foreground shadow-lg">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-foreground">
                  {stats.lastStudiedTopic
                    ? `Continue with ${stats.lastStudiedTopic.title}`
                    : `Start Your Learning Journey`}
                </h2>
                <p className="text-muted-foreground">
                  {stats.lastStudiedTopic
                    ? `Pick up where you left off or explore a new concept.`
                    : `Select a chapter below to begin mastering calculus concepts.`}
                </p>
              </div>
              <Link
                href={
                  stats.lastStudiedTopic
                    ? `/topic/${stats.lastStudiedTopic.id}`
                    : `/chapter/${firstUncompletedChapter.id}`
                }
              >
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 w-full md:w-auto">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  {stats.lastStudiedTopic ? "Continue Learning" : "Start Chapter 1"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats - Simplified */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Target, label: "Topics Mastered", value: stats.completedTopics },
            { icon: CheckCircle2, label: "Correct Answers", value: stats.correctAnswers },
            { icon: Zap, label: "Current Streak", value: stats.currentStreak },
            { icon: TrendingUp, label: "Avg. Mastery", value: `${stats.averageMastery}%` },
          ].map((stat) => (
            <Card key={stat.label} className="border border-border hover:border-foreground/50 transition-colors">
              <CardContent className="p-5 text-center">
                <stat.icon className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                <div className="text-xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Progress Overview - Simplified */}
        {stats.totalTopics > 0 && (
          <section>
            <Card className="border border-border">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center space-x-2 text-base font-semibold">
                  <Brain className="h-5 w-5 text-muted-foreground" />
                  <span>Overall Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Chapter Completion</span>
                    <span className="text-sm font-medium text-foreground">
                      {stats.completedTopics} / {stats.totalTopics} Topics
                    </span>
                  </div>
                  <Progress value={(stats.completedTopics / stats.totalTopics) * 100} className="h-2.5 bg-muted" />
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Chapters Grid - Main Navigation */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Explore Chapters</h2>
            <Badge variant="outline" className="border-foreground text-foreground">
              {stewartChapters.length} Chapters
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stewartChapters.map((chapter) => (
              <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
                <Card className="border border-border hover:border-foreground/70 hover:shadow-md transition-all duration-200 group h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs">
                        Chapter {chapter.order}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <CardTitle className="text-md font-semibold leading-tight text-foreground group-hover:text-foreground/80 transition-colors">
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-2">{chapter.description}</p>
                  </CardContent>
                  <div className="p-4 border-t border-border mt-auto">
                    <Button variant="ghost" size="sm" className="w-full text-foreground hover:bg-muted">
                      View Chapter
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Final Encouragement */}
        <section className="text-center py-8">
          <Award className="h-10 w-10 mx-auto mb-3 text-foreground" />
          <h3 className="text-xl font-semibold text-foreground">Keep Practicing, Keep Growing!</h3>
          <p className="text-muted-foreground mt-1 max-w-lg mx-auto">
            The path to calculus mastery is built one problem at a time. You've got this!
          </p>
        </section>
      </div>
    </div>
  )
}
