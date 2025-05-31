import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen } from "lucide-react"
import { stewartChapters, stewartTopics } from "@/lib/stewart-data"
import { notFound } from "next/navigation"

interface ChapterPageProps {
  params: {
    chapterId: string
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const chapter = stewartChapters.find((c) => c.id === params.chapterId)

  if (!chapter) {
    notFound()
  }

  const chapterTopics = stewartTopics.filter((topic) => topic.chapterId === chapter.id)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Chapters
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Chapter {chapter.order}</Badge>
                    <h1 className="text-xl font-bold text-foreground">{chapter.title}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">{chapter.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chapter Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Chapter Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{chapter.description}</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-secondary p-4 rounded-lg">
                <div className="font-semibold text-primary">Topics Covered</div>
                <div className="text-foreground">{chapterTopics.length} sections</div>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <div className="font-semibold text-primary">Learning Method</div>
                <div className="text-foreground">Interactive examples & practice</div>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <div className="font-semibold text-primary">Content Type</div>
                <div className="text-foreground">AI-generated & cached</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapterTopics.map((topic, index) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Section {topic.order}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {index + 1} of {chapterTopics.length}
                    </div>
                  </div>
                  <CardTitle className="text-base leading-tight text-foreground">{topic.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Click to explore</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <div>
            {chapter.order > 1 && (
              <Link href={`/chapter/${stewartChapters[chapter.order - 2]?.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Chapter
                </Button>
              </Link>
            )}
          </div>
          <div>
            {chapter.order < stewartChapters.length && (
              <Link href={`/chapter/${stewartChapters[chapter.order]?.id}`}>
                <Button variant="outline">
                  Next Chapter
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
