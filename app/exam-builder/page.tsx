"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { AdaptiveCard } from "@/components/adaptive-card"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Clock, Target, Zap, Brain, CheckCircle2, Sparkles, FileText } from "lucide-react"
import { stewartTopics } from "@/lib/stewart-data"

interface ExamBuilderState {
  selectedTopics: string[]
  difficulty: string
  duration: number
  totalMarks: number
  paperType: string
  learnerLevel: string
  focusAreas: string[]
  examStyle: string
}

export default function ExamBuilderPage() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [examConfig, setExamConfig] = useState<ExamBuilderState>({
    selectedTopics: [],
    difficulty: "medium",
    duration: 120,
    totalMarks: 100,
    paperType: "ASMA1B1",
    learnerLevel: "intermediate",
    focusAreas: [],
    examStyle: "mixed",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [uiSuggestions, setUiSuggestions] = useState<any>(null)
  const [step, setStep] = useState(1)
  const totalSteps = 4

  useEffect(() => {
    fetchUISuggestions()
  }, [])

  const fetchUISuggestions = async () => {
    try {
      const response = await fetch("/api/ui-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenType: "exam-builder",
          userContext: { examConfig },
          currentLayout: "multi-step-form",
          deviceType: isMobile ? "mobile" : "desktop",
        }),
      })
      const suggestions = await response.json()
      setUiSuggestions(suggestions)
    } catch (error) {
      console.error("Error fetching UI suggestions:", error)
    }
  }

  const generateExamPaper = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-exam-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examConfig),
      })

      if (response.ok) {
        const examData = await response.json()
        // Navigate to generated exam or show success
        console.log("Generated exam:", examData)
      }
    } catch (error) {
      console.error("Error generating exam:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateConfig = (key: keyof ExamBuilderState, value: any) => {
    setExamConfig((prev) => ({ ...prev, [key]: value }))
  }

  const toggleTopic = (topicId: string) => {
    setExamConfig((prev) => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter((id) => id !== topicId)
        : [...prev.selectedTopics, topicId],
    }))
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ResponsiveLayout mobileLayout="stack" desktopLayout="grid">
            <AdaptiveCard title="Select Topics" priority="high" className="md:col-span-2">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose the calculus topics you want to focus on in your exam.
                </p>
                <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
                  {stewartTopics.slice(0, 12).map((topic) => (
                    <div
                      key={topic.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        examConfig.selectedTopics.includes(topic.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <Checkbox checked={examConfig.selectedTopics.includes(topic.id)} onChange={() => {}} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{topic.title}</p>
                        <p className="text-xs text-muted-foreground truncate">Chapter {topic.order}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AdaptiveCard>

            <AdaptiveCard title="Quick Stats" priority="medium" mobileCompact>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selected Topics</span>
                  <Badge variant="secondary">{examConfig.selectedTopics.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Time</span>
                  <span className="text-sm font-medium">{examConfig.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Marks</span>
                  <span className="text-sm font-medium">{examConfig.totalMarks}</span>
                </div>
              </div>
            </AdaptiveCard>
          </ResponsiveLayout>
        )

      case 2:
        return (
          <ResponsiveLayout mobileLayout="stack" desktopLayout="split">
            <AdaptiveCard title="Exam Configuration" priority="high">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paperType">Paper Type</Label>
                    <Select value={examConfig.paperType} onValueChange={(value) => updateConfig("paperType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASMA1B1">ASMA1B1</SelectItem>
                        <SelectItem value="MAT01B1">MAT01B1</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="learnerLevel">Your Level</Label>
                    <Select
                      value={examConfig.learnerLevel}
                      onValueChange={(value) => updateConfig("learnerLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Difficulty Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["easy", "medium", "hard"].map((level) => (
                      <Button
                        key={level}
                        variant={examConfig.difficulty === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateConfig("difficulty", level)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Duration: {examConfig.duration} minutes</Label>
                  <Slider
                    value={[examConfig.duration]}
                    onValueChange={(value) => updateConfig("duration", value[0])}
                    max={240}
                    min={60}
                    step={15}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Total Marks: {examConfig.totalMarks}</Label>
                  <Slider
                    value={[examConfig.totalMarks]}
                    onValueChange={(value) => updateConfig("totalMarks", value[0])}
                    max={150}
                    min={50}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </div>
            </AdaptiveCard>

            <AdaptiveCard title="Exam Preview" priority="medium">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Exam Will Include:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• {Math.ceil(examConfig.selectedTopics.length * 0.3)} Quick concept questions</li>
                    <li>• {Math.ceil(examConfig.selectedTopics.length * 0.5)} Problem-solving questions</li>
                    <li>• {Math.floor(examConfig.selectedTopics.length * 0.2)} Advanced applications</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <p className="text-sm font-medium">{examConfig.duration} min</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-sm font-medium">{examConfig.totalMarks} marks</p>
                  </div>
                </div>
              </div>
            </AdaptiveCard>
          </ResponsiveLayout>
        )

      case 3:
        return (
          <ResponsiveLayout mobileLayout="stack" desktopLayout="grid">
            <AdaptiveCard title="Focus Areas" priority="high" className="md:col-span-2">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select specific areas you want to emphasize in your exam.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Conceptual Understanding",
                    "Problem Solving",
                    "Real-world Applications",
                    "Mathematical Proofs",
                    "Computational Skills",
                    "Graph Analysis",
                  ].map((area) => (
                    <div
                      key={area}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        examConfig.focusAreas.includes(area)
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                      onClick={() => {
                        const newFocusAreas = examConfig.focusAreas.includes(area)
                          ? examConfig.focusAreas.filter((f) => f !== area)
                          : [...examConfig.focusAreas, area]
                        updateConfig("focusAreas", newFocusAreas)
                      }}
                    >
                      <Checkbox checked={examConfig.focusAreas.includes(area)} onChange={() => {}} />
                      <span className="text-sm font-medium">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AdaptiveCard>

            <AdaptiveCard title="AI Recommendations" priority="low">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Smart Suggestions</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Based on your selections, consider adding integration by parts</p>
                  <p>• Your difficulty level suggests including optimization problems</p>
                  <p>• Time allocation: 40% concepts, 60% applications</p>
                </div>
              </div>
            </AdaptiveCard>
          </ResponsiveLayout>
        )

      case 4:
        return (
          <ResponsiveLayout mobileLayout="stack" desktopLayout="split">
            <AdaptiveCard title="Final Review" priority="high">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Exam Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Topics: {examConfig.selectedTopics.length}</p>
                      <p className="font-medium">Duration: {examConfig.duration} min</p>
                      <p className="font-medium">Marks: {examConfig.totalMarks}</p>
                    </div>
                    <div>
                      <p className="font-medium">Type: {examConfig.paperType}</p>
                      <p className="font-medium">Level: {examConfig.learnerLevel}</p>
                      <p className="font-medium">Difficulty: {examConfig.difficulty}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Selected Topics:</h5>
                  <div className="flex flex-wrap gap-2">
                    {examConfig.selectedTopics.map((topicId) => {
                      const topic = stewartTopics.find((t) => t.id === topicId)
                      return (
                        <Badge key={topicId} variant="secondary" className="text-xs">
                          {topic?.title}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {examConfig.focusAreas.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Focus Areas:</h5>
                    <div className="flex flex-wrap gap-2">
                      {examConfig.focusAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AdaptiveCard>

            <AdaptiveCard title="Generate Exam" priority="high">
              <div className="space-y-4">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h4 className="font-semibold mb-2">Ready to Generate!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your personalized exam will be created using advanced AI validation.
                  </p>
                </div>

                <Button
                  onClick={generateExamPaper}
                  disabled={isGenerating || examConfig.selectedTopics.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Generating Exam...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate My Exam
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  <p>✓ AI-validated content</p>
                  <p>✓ Personalized difficulty</p>
                  <p>✓ Comprehensive marking scheme</p>
                </div>
              </div>
            </AdaptiveCard>
          </ResponsiveLayout>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">AI Exam Builder</h1>
          <p className="text-muted-foreground">Create personalized calculus exams tailored to your learning needs</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Previous
          </Button>
          <Button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            disabled={step === totalSteps || (step === 1 && examConfig.selectedTopics.length === 0)}
          >
            {step === totalSteps ? "Review" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
