import { type NextRequest, NextResponse } from "next/server"

const DEEPSEEK_API_KEY = "sk-f159a48458714195879f9971af0d4121"
const OPENAI_API_KEY =
  "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"

export async function POST(request: NextRequest) {
  try {
    const { content, contentType, topic } = await request.json()

    // First validation with DeepSeek
    const deepseekValidation = await validateWithDeepSeek(content, contentType, topic)

    // Second validation with OpenAI
    const openaiValidation = await validateWithOpenAI(content, contentType, topic, deepseekValidation)

    return NextResponse.json({
      originalContent: content,
      deepseekValidation,
      openaiValidation,
      finalValidatedContent: openaiValidation.correctedContent,
      confidenceScore: Math.min(deepseekValidation.confidence, openaiValidation.confidence),
      recommendations: [...deepseekValidation.recommendations, ...openaiValidation.recommendations],
    })
  } catch (error) {
    console.error("Error validating content:", error)
    return NextResponse.json({ error: "Failed to validate content" }, { status: 500 })
  }
}

async function validateWithDeepSeek(content: string, contentType: string, topic: string) {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert calculus professor validating educational content for accuracy and pedagogical quality. Focus on mathematical correctness, clarity, and educational value.`,
        },
        {
          role: "user",
          content: `
Validate this ${contentType} for the calculus topic "${topic}":

${content}

Provide validation in JSON format:
{
  "isAccurate": boolean,
  "confidence": number (0-1),
  "mathematicalErrors": ["list of errors"],
  "pedagogicalIssues": ["list of teaching issues"],
  "recommendations": ["list of improvements"],
  "correctedContent": "improved version if needed"
}

Focus on:
- Mathematical accuracy and notation
- Clarity of explanation
- Appropriate difficulty level
- Pedagogical effectiveness
`,
        },
      ],
      temperature: 0.1,
    }),
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

async function validateWithOpenAI(content: string, contentType: string, topic: string, deepseekResult: any) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a senior calculus educator providing final validation and refinement of educational content. Your role is to ensure the highest quality and accuracy.`,
        },
        {
          role: "user",
          content: `
Review and refine this ${contentType} for "${topic}".

Original content:
${content}

DeepSeek's analysis:
${JSON.stringify(deepseekResult, null, 2)}

Provide final validation in JSON format:
{
  "isAccurate": boolean,
  "confidence": number (0-1),
  "finalIssues": ["remaining issues"],
  "recommendations": ["final recommendations"],
  "correctedContent": "final polished version",
  "qualityScore": number (0-10)
}

Ensure:
- Perfect mathematical accuracy
- Optimal pedagogical structure
- Clear, concise explanations
- Proper LaTeX formatting
`,
        },
      ],
      temperature: 0.1,
    }),
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
