"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Clock, Target, Plus, Search, Download, Eye, Calendar, BookOpen, Sparkles, Zap } from "lucide-react"
import { stewartChapters } from "@/lib/stewart-data"

interface PastPaper {
  id: string
  title: string
  course: string
  year: number
  session: string
  duration: string
  totalMarks: number
  difficulty: "easy" | "medium" | "hard"
  chapters: string[]
  questionCount: number
  createdAt: string
}

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [filteredPapers, setFilteredPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  // Generate paper form state
  const [generateForm, setGenerateForm] = useState({
    paperType: "ASMA1B1",
    difficulty: "medium",
    questionCount: 8,
    selectedChapters: [] as string[],
  })

  useEffect(() => {
    fetchPastPapers()
  }, [])

  useEffect(() => {
    filterPapers()
  }, [papers, searchTerm, selectedCourse, selectedYear, selectedDifficulty])

  const fetchPastPapers = async () => {
    try {
      const response = await fetch("/api/past-papers")
      const data = await response.json()
      setPapers(data.papers)
    } catch (error) {
      console.error("Error fetching past papers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPapers = () => {
    let filtered = papers

    if (searchTerm) {
      filtered = filtered.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.course.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCourse) {
      filtered = filtered.filter((paper) => paper.course === selectedCourse)
    }

    if (selectedYear) {
      filtered = filtered.filter((paper) => paper.year.toString() === selectedYear)
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((paper) => paper.difficulty === selectedDifficulty)
    }

    setFilteredPapers(filtered)
  }

  const generatePastPaper = async () => {
    if (generateForm.selectedChapters.length === 0) {
      alert("Please select at least one chapter")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-past-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperType: generateForm.paperType,
          difficulty: generateForm.difficulty,
          chapters: generateForm.selectedChapters,
          questionCount: generateForm.questionCount,
        }),
      })

      if (response.ok) {
        const newPaper = await response.json()
        // In a real app, you'd save this to the database and refresh the list
        alert("Past paper generated successfully!")
        setShowGenerateDialog(false)
        // Reset form
        setGenerateForm({
          paperType: "ASMA1B1",
          difficulty: "medium",
          questionCount: 8,
          selectedChapters: [],
        })
      } else {
        throw new Error("Failed to generate paper")
      }
    } catch (error) {
      console.error("Error generating past paper:", error)
      alert("Failed to generate past paper. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-lg text-muted-foreground">Loading past papers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Past Papers Collection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practice with realistic exam papers generated using AI. Perfect preparation for ASMA1B1 and MAT01B1 exams.
          </p>
        </header>

        {/* Controls */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="Applied Mathematics 1B1">ASMA1B1</SelectItem>
                  <SelectItem value="Mathematics 01B1">MAT01B1</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate New Paper */}
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Generate Past Paper
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paperType">Paper Type</Label>
                  <Select
                    value={generateForm.paperType}
                    onValueChange={(value) => setGenerateForm((prev) => ({ ...prev, paperType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASMA1B1">ASMA1B1</SelectItem>
                      <SelectItem value="MAT01B1">MAT01B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={generateForm.difficulty}
                    onValueChange={(value) => setGenerateForm((prev) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Select
                    value={generateForm.questionCount.toString()}
                    onValueChange={(value) =>
                      setGenerateForm((prev) => ({ ...prev, questionCount: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Questions</SelectItem>
                      <SelectItem value="8">8 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select Chapters</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto mt-2">
                    {stewartChapters.slice(0, 8).map((chapter) => (
                      <div key={chapter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={chapter.id}
                          checked={generateForm.selectedChapters.includes(chapter.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGenerateForm((prev) => ({
                                ...prev,
                                selectedChapters: [...prev.selectedChapters, chapter.id],
                              }))
                            } else {
                              setGenerateForm((prev) => ({
                                ...prev,
                                selectedChapters: prev.selectedChapters.filter((id) => id !== chapter.id),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={chapter.id} className="text-sm">
                          {chapter.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={generatePastPaper} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Paper
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Papers Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="shadow-md border-0 hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {paper.course}
                  </Badge>
                  <Badge className={getDifficultyColor(paper.difficulty)}>{paper.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {paper.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{paper.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{paper.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {paper.session} {paper.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{paper.questionCount} questions</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/past-papers/${paper.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Paper
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No papers found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or generate a new paper.</p>
          </div>
        )}
      </div>
    </div>
  )
}
