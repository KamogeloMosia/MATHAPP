import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react"
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
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-foreground text-foreground hover:bg-muted">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-foreground" />
                <div>
                  <Badge variant="secondary" className="text-xs mb-1">
                    Chapter {chapter.order}
                  </Badge>
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{chapter.title}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-10">
        <Card className="mb-8 border border-border">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-xl text-foreground">Chapter Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <p className="text-muted-foreground">{chapter.description}</p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted p-3 rounded-md border border-border">
                <div className="font-medium text-foreground">Topics Covered</div>
                <div className="text-muted-foreground">{chapterTopics.length} sections</div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <div className="font-medium text-foreground">Learning Method</div>
                <div className="text-muted-foreground">Interactive examples & practice</div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <div className="font-medium text-foreground">Content Type</div>
                <div className="text-muted-foreground">AI-generated & cached</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {chapterTopics.map((topic, index) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <Card className="h-full border border-border hover:border-foreground/70 hover:shadow-md transition-all duration-200 group flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="border-foreground text-foreground text-xs">
                      Section {topic.order}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-md font-semibold leading-tight text-foreground group-hover:text-foreground/80 transition-colors">
                    {topic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4 flex-grow">
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                    {topic.description}
                  </CardDescription>
                </CardContent>
                <div className="p-4 border-t border-border mt-auto">
                  <Button variant="ghost" size="sm" className="w-full text-foreground hover:bg-muted">
                    Explore Topic
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Navigation */}
        <nav className="mt-10 flex justify-between">
          <div>
            {chapter.order > 1 && stewartChapters[chapter.order - 2] && (
              <Link href={`/chapter/${stewartChapters[chapter.order - 2].id}`}>
                <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Chapter
                </Button>
              </Link>
            )}
          </div>
          <div>
            {chapter.order < stewartChapters.length && stewartChapters[chapter.order] && (
              <Link href={`/chapter/${stewartChapters[chapter.order].id}`}>
                <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
                  Next Chapter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </main>
    </div>
  )
}
