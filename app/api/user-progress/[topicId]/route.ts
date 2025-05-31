import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("stewart-calculus")
    const userId = "default-user"

    let progress
    try {
      progress = (await Promise.race([
        db.collection("user_progress").findOne({ userId, topicId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000)),
      ])) as any
    } catch (dbError) {
      console.error("Database error fetching progress:", dbError)
      progress = null
    }

    if (!progress) {
      // Create initial progress record
      progress = {
        userId,
        topicId,
        completed: false,
        score: 0,
        lastAccessed: new Date(),
        questionsAttempted: 0,
        questionsCorrect: 0,
        currentStreak: 0,
        bestStreak: 0,
        masteryLevel: 0,
      }

      try {
        await db.collection("user_progress").insertOne(progress)
      } catch (insertError) {
        console.error("Error creating progress record:", insertError)
        // Continue with in-memory progress
      }
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Critical error in progress API:", error)

    // Return default progress on any error
    const defaultProgress = {
      userId: "default-user",
      topicId: params.topicId,
      completed: false,
      score: 0,
      lastAccessed: new Date(),
      questionsAttempted: 0,
      questionsCorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      masteryLevel: 0,
    }

    return NextResponse.json({ progress: defaultProgress })
  }
}

export async function POST(request: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const { topicId } = params

    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const { correct, questionId } = requestData

    if (typeof correct !== "boolean") {
      return NextResponse.json({ error: "Invalid correct value" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("stewart-calculus")
    const userId = "default-user"

    // Get current progress with timeout
    let progress
    try {
      progress = (await Promise.race([
        db.collection("user_progress").findOne({ userId, topicId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000)),
      ])) as any
    } catch (dbError) {
      console.error("Database error:", dbError)
      progress = null
    }

    if (!progress) {
      progress = {
        userId,
        topicId,
        completed: false,
        score: 0,
        lastAccessed: new Date(),
        questionsAttempted: 0,
        questionsCorrect: 0,
        currentStreak: 0,
        bestStreak: 0,
        masteryLevel: 0,
      }
    }

    // Update progress calculations with safety checks
    progress.questionsAttempted = Math.max(0, (progress.questionsAttempted || 0) + 1)
    progress.lastAccessed = new Date()

    if (correct) {
      progress.questionsCorrect = Math.max(0, (progress.questionsCorrect || 0) + 1)
      progress.currentStreak = Math.max(0, (progress.currentStreak || 0) + 1)
      progress.bestStreak = Math.max(progress.bestStreak || 0, progress.currentStreak)
    } else {
      progress.currentStreak = 0
    }

    // Calculate mastery level with safety checks
    if (progress.questionsAttempted > 0) {
      progress.masteryLevel = Math.round((progress.questionsCorrect / progress.questionsAttempted) * 100)
    } else {
      progress.masteryLevel = 0
    }

    // Update score
    progress.score = (progress.questionsCorrect || 0) + Math.floor((progress.bestStreak || 0) / 3)

    // Mark as completed if criteria met
    if (progress.masteryLevel >= 80 && progress.questionsCorrect >= 5) {
      progress.completed = true
    }

    // Update in database with error handling
    try {
      await db.collection("user_progress").updateOne({ userId, topicId }, { $set: progress }, { upsert: true })
    } catch (updateError) {
      console.error("Error updating progress:", updateError)
      // Continue with calculated progress even if save fails
    }

    const levelUp = correct && progress.currentStreak > 0 && progress.currentStreak % 5 === 0
    const masteryAchieved = progress.completed && progress.masteryLevel >= 80

    return NextResponse.json({
      progress,
      levelUp,
      masteryAchieved,
    })
  } catch (error) {
    console.error("Critical error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
