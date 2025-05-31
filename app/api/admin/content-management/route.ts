import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { stewartTopics } from "@/lib/stewart-data"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("stewart-calculus")

    // Get content statistics
    const contentStats = await db
      .collection("content")
      .aggregate([
        {
          $group: {
            _id: null,
            total_topics: { $sum: 1 },
            reviewed_topics: { $sum: { $cond: ["$quality_reviewed", 1, 0] } },
            avg_version: { $avg: "$version" },
          },
        },
      ])
      .toArray()

    // Get question bank statistics
    const questionStats = await db
      .collection("question_bank")
      .aggregate([
        {
          $unwind: "$questions",
        },
        {
          $group: {
            _id: null,
            total_questions: { $sum: 1 },
            avg_quality: { $avg: "$questions.quality_score" },
            by_difficulty: {
              $push: "$questions.difficulty",
            },
            by_ai_model: {
              $push: "$questions.created_by",
            },
          },
        },
      ])
      .toArray()

    // Get topics needing attention
    const topicsNeedingAttention = await db
      .collection("question_bank")
      .find({
        $or: [{ questions: { $size: 0 } }, { "questions.quality_score": { $lt: 0.7 } }],
      })
      .toArray()

    return NextResponse.json({
      content_stats: contentStats[0] || { total_topics: 0, reviewed_topics: 0, avg_version: 0 },
      question_stats: questionStats[0] || { total_questions: 0, avg_quality: 0 },
      topics_needing_attention: topicsNeedingAttention.map((t) => t.topicId),
      total_topics_available: stewartTopics.length,
    })
  } catch (error) {
    console.error("Error getting content management stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, topicId, batch_size = 5 } = await request.json()
    const client = await clientPromise
    const db = client.db("stewart-calculus")

    let result = { success: false, message: "", details: {} }

    switch (action) {
      case "enhance_all_questions":
        result = await enhanceAllQuestions(db, batch_size)
        break

      case "generate_missing_content":
        result = await generateMissingContent(db)
        break

      case "review_quality":
        result = await reviewContentQuality(db, topicId)
        break

      case "backup_content":
        result = await backupContent(db)
        break

      default:
        result = { success: false, message: "Unknown action" }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in content management:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function enhanceAllQuestions(db: any, batchSize: number) {
  const questionBanks = await db.collection("question_bank").find({}).toArray()
  let enhanced = 0
  let errors = 0

  for (const bank of questionBanks.slice(0, batchSize)) {
    try {
      const response = await fetch(`/api/questions/enhance/${bank.topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enhance_existing: true, add_new: true, target_count: 15 }),
      })

      if (response.ok) {
        enhanced++
      } else {
        errors++
      }
    } catch (error) {
      errors++
    }
  }

  return {
    success: true,
    message: `Enhanced questions for ${enhanced} topics`,
    details: { enhanced, errors, processed: enhanced + errors },
  }
}

async function generateMissingContent(db: any) {
  const existingContent = await db.collection("content").find({}).toArray()
  const existingTopicIds = new Set(existingContent.map((c) => c.topicId))

  const missingTopics = stewartTopics.filter((topic) => !existingTopicIds.has(topic.id))
  let generated = 0

  for (const topic of missingTopics.slice(0, 10)) {
    // Limit batch size
    try {
      // This would trigger content generation
      const response = await fetch(`/api/content/${topic.id}`)
      if (response.ok) {
        generated++
      }
    } catch (error) {
      console.error(`Error generating content for ${topic.id}:`, error)
    }
  }

  return {
    success: true,
    message: `Generated content for ${generated} missing topics`,
    details: { generated, total_missing: missingTopics.length },
  }
}

async function reviewContentQuality(db: any, topicId?: string) {
  const filter = topicId ? { topicId } : {}
  const content = await db.collection("content").find(filter).toArray()

  let reviewed = 0
  for (const item of content) {
    // Simple quality check based on content length and structure
    const hasGoodExplanation = item.explanation && item.explanation.length > 200
    const hasExample = item.example && item.example.problem && item.example.solution
    const hasPracticeProblems = item.practiceProblems && item.practiceProblems.length > 0

    const qualityScore = (hasGoodExplanation ? 0.4 : 0) + (hasExample ? 0.3 : 0) + (hasPracticeProblems ? 0.3 : 0)

    await db.collection("content").updateOne(
      { _id: item._id },
      {
        $set: {
          quality_reviewed: true,
          quality_score: qualityScore,
          last_reviewed: new Date(),
        },
      },
    )
    reviewed++
  }

  return {
    success: true,
    message: `Reviewed quality for ${reviewed} content items`,
    details: { reviewed },
  }
}

async function backupContent(db: any) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

  const content = await db.collection("content").find({}).toArray()
  const questionBanks = await db.collection("question_bank").find({}).toArray()

  await db.collection("content_backups").insertOne({
    backup_date: new Date(),
    backup_id: `backup_${timestamp}`,
    content,
    question_banks: questionBanks,
  })

  return {
    success: true,
    message: `Created backup with ${content.length} content items and ${questionBanks.length} question banks`,
    details: { backup_id: `backup_${timestamp}` },
  }
}
