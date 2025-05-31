import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { stewartChapters, stewartTopics } from "@/lib/stewart-data"

export async function GET() {
  try {
    // Validate chapter completeness
    const missingTopics: string[] = []
    const incompleteChapters: string[] = []

    stewartChapters.forEach((chapter) => {
      const chapterTopics = stewartTopics.filter((topic) => topic.chapterId === chapter.id)

      if (chapterTopics.length === 0) {
        incompleteChapters.push(chapter.title)
      }

      if (chapterTopics.length < chapter.topics.length) {
        const missingCount = chapter.topics.length - chapterTopics.length
        missingTopics.push(`${chapter.title}: ${missingCount} topics missing`)
      }
    })

    let aiSuggestions = ""
    if (missingTopics.length > 0 || incompleteChapters.length > 0) {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `As an AI learning assistant, provide helpful suggestions to fix these calculus curriculum issues:

Missing/Incomplete Chapters: ${incompleteChapters.join(", ")}
Topics with gaps: ${missingTopics.join(", ")}

Provide 3-4 actionable suggestions for the developer to fix these issues. Be specific and helpful. Focus on curriculum completeness and learning progression.`,
      })
      aiSuggestions = text
    }

    return NextResponse.json({
      isComplete: missingTopics.length === 0 && incompleteChapters.length === 0,
      totalChapters: stewartChapters.length,
      totalTopics: stewartTopics.length,
      missingTopics,
      incompleteChapters,
      aiSuggestions:
        aiSuggestions || "All chapters and topics are properly configured! Your calculus curriculum is complete.",
      recommendations: aiSuggestions
        ? [
            "Review the stewart-data.ts file for missing topic definitions",
            "Ensure all chapter.topics arrays match actual available topics",
            "Consider adding placeholder content for missing topics",
            "Verify topic ordering and chapter relationships",
          ]
        : [],
    })
  } catch (error) {
    console.error("Error validating chapters:", error)
    return NextResponse.json({
      isComplete: false,
      error: "Failed to validate chapters",
      aiSuggestions: "Unable to generate suggestions at this time. Please check your chapter and topic data manually.",
    })
  }
}
