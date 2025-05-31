import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET() {
  try {
    const { text: motivationalMessage } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate an encouraging, motivational message for a calculus student. Make it personal, inspiring, and focused on growth mindset. Keep it under 50 words and make it feel like a supportive mentor is speaking directly to them.`,
    })

    const { text: studyTip } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Give a practical, actionable study tip for learning calculus effectively. Focus on techniques that work, be specific, and keep it under 40 words. Make it sound like advice from an experienced tutor.`,
    })

    const { text: encouragement } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Write a brief, energetic encouragement for someone about to start studying calculus. Make it exciting and confidence-building. Under 30 words.`,
    })

    // Generate a random challenge
    const challenges = [
      {
        id: "daily-streak",
        title: "Daily Streak Challenge",
        description: "Answer 5 questions correctly today to earn bonus points!",
        type: "daily" as const,
        pointsReward: 50,
        requirements: { questionsCorrect: 5 },
        isCompleted: false,
      },
      {
        id: "topic-master",
        title: "Topic Master",
        description: "Complete any topic with 90% mastery for extra rewards!",
        type: "bonus" as const,
        pointsReward: 100,
        requirements: { topicsCompleted: 1 },
        isCompleted: false,
      },
      {
        id: "quick-learner",
        title: "Quick Learner",
        description: "Answer 3 questions in a row correctly - no mistakes!",
        type: "bonus" as const,
        pointsReward: 75,
        requirements: { questionsCorrect: 3 },
        isCompleted: false,
      },
    ]

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]

    const coachData = {
      motivationalMessage: motivationalMessage.trim(),
      studyTip: studyTip.trim(),
      encouragement: encouragement.trim(),
      currentChallenge: randomChallenge,
      nextRecommendation: {
        type: "chapter",
        id: "functions-models",
        title: "Functions and Models",
        reason: "Perfect starting point to build your calculus foundation!",
      },
    }

    return NextResponse.json(coachData)
  } catch (error) {
    console.error("Error generating AI coach content:", error)

    // Fallback content
    return NextResponse.json({
      motivationalMessage: "Every expert was once a beginner. Your calculus journey starts with a single step forward!",
      studyTip: "Practice a little every day rather than cramming. Consistency beats intensity in mathematics.",
      encouragement: "You've got this! Let's make calculus your superpower today!",
      currentChallenge: {
        id: "daily-streak",
        title: "Daily Streak Challenge",
        description: "Answer 5 questions correctly today to earn bonus points!",
        type: "daily",
        pointsReward: 50,
        requirements: { questionsCorrect: 5 },
        isCompleted: false,
      },
      nextRecommendation: {
        type: "chapter",
        id: "functions-models",
        title: "Functions and Models",
        reason: "Perfect starting point to build your calculus foundation!",
      },
    })
  }
}
