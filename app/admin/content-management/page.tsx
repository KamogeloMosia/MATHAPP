"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Database, CheckCircle, AlertTriangle, TrendingUp, Download } from "lucide-react"

interface ContentStats {
  content_stats: {
    total_topics: number
    reviewed_topics: number
    avg_version: number
  }
  question_stats: {
    total_questions: number
    avg_quality: number
  }
  topics_needing_attention: string[]
  total_topics_available: number
}

export default function ContentManagementPage() {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/content-management")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
    setLoading(false)
  }

  const executeAction = async (action: string, params: any = {}) => {
    setProcessing(action)
    try {
      const response = await fetch("/api/admin/content-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      })

      const result = await response.json()
      if (result.success) {
        alert(`Success: ${result.message}`)
        fetchStats() // Refresh stats
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-muted-foreground">Loading content management dashboard...</div>
        </div>
      </div>
    )
  }

  const contentProgress = stats ? (stats.content_stats.total_topics / stats.total_topics_available) * 100 : 0
  const qualityProgress = stats ? (stats.content_stats.reviewed_topics / stats.content_stats.total_topics) * 100 : 0

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Management Dashboard</h1>
          <p className="text-muted-foreground">Manage and enhance calculus learning content</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.content_stats.total_topics || 0}</div>
              <div className="text-xs text-muted-foreground">of {stats?.total_topics_available || 0} available</div>
              <Progress value={contentProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.question_stats.total_questions || 0}</div>
              <div className="text-xs text-muted-foreground">
                Avg Quality: {((stats?.question_stats.avg_quality || 0) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quality Reviewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.content_stats.reviewed_topics || 0}</div>
              <div className="text-xs text-muted-foreground">{qualityProgress.toFixed(1)}% reviewed</div>
              <Progress value={qualityProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.topics_needing_attention.length || 0}</div>
              <div className="text-xs text-muted-foreground">topics require work</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                Enhance Questions
              </CardTitle>
              <CardDescription>Improve existing questions and generate new high-quality problems</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => executeAction("enhance_all_questions", { batch_size: 10 })}
                disabled={processing === "enhance_all_questions"}
                className="w-full"
              >
                {processing === "enhance_all_questions" ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Enhance All Questions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="h-5 w-5" />
                Generate Missing Content
              </CardTitle>
              <CardDescription>Create content for topics that don't have any yet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => executeAction("generate_missing_content")}
                disabled={processing === "generate_missing_content"}
                className="w-full"
              >
                {processing === "generate_missing_content" ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Generate Missing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5" />
                Review Quality
              </CardTitle>
              <CardDescription>Analyze and score content quality across all topics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => executeAction("review_quality")}
                disabled={processing === "review_quality"}
                className="w-full"
              >
                {processing === "review_quality" ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Review Quality
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Download className="h-5 w-5" />
                Backup Content
              </CardTitle>
              <CardDescription>Create a backup of all content and question banks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => executeAction("backup_content")}
                disabled={processing === "backup_content"}
                variant="outline"
                className="w-full"
              >
                {processing === "backup_content" ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <RefreshCw className="h-5 w-5" />
                Refresh Stats
              </CardTitle>
              <CardDescription>Update the dashboard with latest statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchStats} disabled={loading} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Topics Needing Attention */}
        {stats && stats.topics_needing_attention.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Topics Needing Attention
              </CardTitle>
              <CardDescription>These topics have low-quality questions or missing content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topics_needing_attention.map((topicId) => (
                  <Badge key={topicId} variant="outline" className="text-destructive border-destructive">
                    {topicId.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
