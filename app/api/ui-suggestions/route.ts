import { type NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY =
  "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"

export async function POST(request: NextRequest) {
  try {
    const { screenType, userContext, currentLayout, deviceType } = await request.json()

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
            content: `You are an expert UI/UX designer specializing in educational applications. Provide specific, actionable design recommendations for optimal user experience.`,
          },
          {
            role: "user",
            content: `
Provide UI/UX recommendations for:

CONTEXT:
- Screen Type: ${screenType}
- Device: ${deviceType}
- User Context: ${JSON.stringify(userContext)}
- Current Layout: ${JSON.stringify(currentLayout)}

REQUIREMENTS:
- Mobile-first responsive design
- Accessibility compliance
- Educational app best practices
- Performance optimization
- User engagement optimization

Provide recommendations in JSON format:
{
  "layoutSuggestions": {
    "mobile": ["specific mobile layout recommendations"],
    "desktop": ["specific desktop layout recommendations"]
  },
  "componentRecommendations": [
    {
      "component": "component name",
      "purpose": "why needed",
      "implementation": "how to implement",
      "responsiveBehavior": "mobile/desktop differences"
    }
  ],
  "interactionPatterns": ["recommended interaction patterns"],
  "accessibilityImprovements": ["accessibility enhancements"],
  "performanceOptimizations": ["performance improvements"],
  "userEngagementFeatures": ["engagement enhancements"]
}
`,
          },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    return NextResponse.json(JSON.parse(data.choices[0].message.content))
  } catch (error) {
    console.error("Error getting UI suggestions:", error)
    return NextResponse.json({ error: "Failed to get UI suggestions" }, { status: 500 })
  }
}
