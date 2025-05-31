"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Zap, TrendingUp, Award, ChevronRight, Clock, Brain, CheckCircle2 } from "lucide-react"
import { stewartChapters, stewartTopics } from "@/lib/stewart-data"

interface DashboardStats {
  totalTopics: number
  completedTopics: number
  totalQuestions: number
  correctAnswers: number
  currentStreak: number
  bestStreak: number
  averageMastery: number
  recentActivity: {
    topicId: string
    topicTitle: string
    score: number
    date: string
  }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [motivationalQuote, setMotivationalQuote] = useState("")

  const quotes = [
    "Mathematics is not about numbers, equations, or algorithms: it is about understanding.",
    "The only way to learn mathematics is to do mathematics.",
    "In mathematics, you don't understand things. You just get used to them.",
    "Mathematics is the music of reason.",
    "Pure mathematics is, in its way, the poetry of logical ideas.",
    "Mathematics is the language with which God has written the universe.",
  ]

  useEffect(() => {
    fetchDashboardStats()
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Simulate fetching dashboard stats
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalTopics: stewartTopics.length,
        completedTopics: Math.floor(stewartTopics.length * 0.3), // 30% completed
        totalQuestions: 156,
        correctAnswers: 89,
        currentStreak: 7,
        bestStreak: 15,
        averageMastery: 67,
        recentActivity: [
          {
            topicId: "limit-function",
            topicTitle: "The Limit of a Function",
            score: 85,
            date: "Today",
          },
          {
            topicId: "derivatives-rates-change",
            topicTitle: "Derivatives and Rates of Change",
            score: 92,
            date: "Yesterday",
          },
          {
            topicId: "chain-rule",
            topicTitle: "The Chain Rule",
            score: 78,
            date: "2 days ago",
          },
        ],
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
    setLoading(false)
  }

  const getMotivationalMessage = () => {
    if (!stats) return "Welcome back!"

    if (stats.currentStreak >= 10) return "🔥 You're on fire! Keep the streak alive!"
    if (stats.currentStreak >= 5) return "⚡ Great momentum! You're building strong habits!"
    if (stats.averageMastery >= 80) return "🎯 Excellent mastery! You're becoming a calculus expert!"
    if (stats.averageMastery >= 60) return "📈 Good progress! Keep pushing forward!"
    return "🚀 Ready to master some calculus today?"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Calculus Mastery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{motivationalQuote}</p>
          <div className="text-xl font-medium text-foreground">{getMotivationalMessage()}</div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-foreground" />
                <div className="text-2xl font-bold text-foreground">{stats.completedTopics}</div>
                <div className="text-sm text-muted-foreground">Topics Mastered</div>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-foreground" />
                <div className="text-2xl font-bold text-foreground">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-foreground" />
                <div className="text-2xl font-bold text-foreground">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-foreground" />
                <div className="text-2xl font-bold text-foreground">{stats.averageMastery}%</div>
                <div className="text-sm text-muted-foreground">Avg Mastery</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Overview */}
        {stats && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Learning Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-bold">
                    {Math.round((stats.completedTopics / stats.totalTopics) * 100)}%
                  </span>
                </div>
                <Progress value={(stats.completedTopics / stats.totalTopics) * 100} className="h-3 bg-muted" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Question Accuracy</span>
                  <span className="text-sm font-bold">
                    {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%
                  </span>
                </div>
                <Progress value={(stats.correctAnswers / stats.totalQuestions) * 100} className="h-3 bg-muted" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats.recentActivity.map((activity, index) => (
                <Link key={index} href={`/topic/${activity.topicId}`}>
                  <div className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{activity.topicTitle}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-foreground text-foreground">
                          {activity.score}%
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Chapters Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Chapters</h2>
            <Badge variant="outline" className="border-foreground text-foreground">
              {stewartChapters.length} Chapters
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stewartChapters.map((chapter) => (
              <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
                <Card className="border border-border hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-foreground text-foreground">
                        Chapter {chapter.order}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <CardTitle className="text-lg leading-tight text-foreground group-hover:text-foreground/80 transition-colors">
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{chapter.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{chapter.topics.length} topics</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-foreground rounded-full"></div>
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="border border-border bg-foreground text-background">
          <CardContent className="p-8 text-center space-y-4">
            <Award className="h-12 w-12 mx-auto text-background" />
            <h3 className="text-2xl font-bold">Ready to Practice?</h3>
            <p className="text-background/80 max-w-md mx-auto">
              Choose a topic and start solving problems. Every question brings you closer to mastery.
            </p>
            <Link href="/chapter/functions-models">
              <Button
                variant="outline"
                size="lg"
                className="bg-background text-foreground border-background hover:bg-background/90"
              >
                Start Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
