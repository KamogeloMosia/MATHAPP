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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Chapter {chapter.order}</Badge>
                    <h1 className="text-xl font-bold text-gray-900">{chapter.title}</h1>
                  </div>
                  <p className="text-sm text-gray-600">{chapter.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chapter Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Chapter Overview</h2>
          <p className="text-gray-700 mb-6">{chapter.description}</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-blue-900">Topics Covered</div>
              <div className="text-blue-700">{chapterTopics.length} sections</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-semibold text-green-900">Learning Method</div>
              <div className="text-green-700">Interactive examples & practice</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="font-semibold text-purple-900">Content Type</div>
              <div className="text-purple-700">AI-generated & cached</div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapterTopics.map((topic, index) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Section {topic.order}</Badge>
                    <div className="text-xs text-gray-500">
                      {index + 1} of {chapterTopics.length}
                    </div>
                  </div>
                  <CardTitle className="text-base leading-tight">{topic.title}</CardTitle>
                  <CardDescription className="text-sm">{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Click to explore</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
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
