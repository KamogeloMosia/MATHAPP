import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { paperType, difficulty, chapters, questionCount } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
You are an expert university calculus exam setter creating a realistic past paper for ${paperType} (ASMA1B1/MAT01B1 style).

Generate a complete exam paper with the following specifications:
- Paper Type: ${paperType}
- Difficulty: ${difficulty}
- Chapters to include: ${chapters.join(", ")}
- Total Questions: ${questionCount}
- Time Limit: ${questionCount <= 10 ? "2 hours" : "3 hours"}
- Total Marks: ${questionCount * 6} marks

EXAM PAPER STRUCTURE:
1. **Section A: Multiple Choice (30% of marks)**
   - ${Math.ceil(questionCount * 0.3)} questions
   - 3-4 marks each
   - Cover basic concepts and quick calculations

2. **Section B: Structured Questions (70% of marks)**
   - ${Math.floor(questionCount * 0.7)} questions
   - 6-10 marks each
   - Multi-part questions testing deeper understanding

QUESTION REQUIREMENTS:
- Follow James Stewart's Calculus notation and style
- Include proper LaTeX mathematical notation
- Realistic exam difficulty matching university standards
- Clear marking schemes for each part
- Progressive difficulty within each question
- Cover key concepts from specified chapters

FORMATTING REQUIREMENTS:
Return a JSON object with this exact structure:
{
  "paperInfo": {
    "title": "University of [Name] - ${paperType}",
    "course": "Calculus I",
    "duration": "X hours",
    "totalMarks": X,
    "instructions": [
      "Answer ALL questions",
      "Show all working clearly",
      "Calculators are permitted",
      "Formula sheet provided"
    ]
  },
  "sectionA": {
    "title": "Section A: Multiple Choice Questions",
    "instructions": "Choose the best answer for each question",
    "questions": [
      {
        "questionNumber": 1,
        "marks": 3,
        "question": "Question text with LaTeX",
        "options": {
          "a": "Option A",
          "b": "Option B", 
          "c": "Option C",
          "d": "Option D",
          "e": "Option E"
        },
        "correctAnswer": "b",
        "solution": "Brief explanation of correct answer",
        "topic": "Chapter/Topic name"
      }
    ]
  },
  "sectionB": {
    "title": "Section B: Structured Questions", 
    "instructions": "Answer all parts of each question",
    "questions": [
      {
        "questionNumber": 1,
        "totalMarks": 8,
        "topic": "Chapter/Topic name",
        "parts": [
          {
            "part": "a",
            "marks": 3,
            "question": "Part (a) question with LaTeX",
            "solution": "Detailed step-by-step solution",
            "markingScheme": ["1 mark for setup", "2 marks for calculation"]
          },
          {
            "part": "b", 
            "marks": 5,
            "question": "Part (b) question with LaTeX",
            "solution": "Detailed step-by-step solution",
            "markingScheme": ["2 marks for method", "3 marks for correct answer"]
          }
        ]
      }
    ]
  }
}

SPECIFIC TOPIC GUIDELINES:
- **Limits**: Include epsilon-delta, squeeze theorem, continuity
- **Derivatives**: Chain rule, implicit differentiation, related rates
- **Applications**: Optimization, curve sketching, motion problems  
- **Integration**: Substitution, by parts, partial fractions
- **Series**: Convergence tests, Taylor/Maclaurin series
- **Differential Equations**: Separable, linear first-order

Make this feel like a real university exam that students would encounter.
`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the JSON response
    let pastPaper
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        pastPaper = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No valid JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse generated paper" }, { status: 500 })
    }

    // Add metadata
    pastPaper.metadata = {
      generatedAt: new Date().toISOString(),
      generatedBy: "gemini-1.5-flash",
      paperType,
      difficulty,
      chapters,
      questionCount,
    }

    return NextResponse.json(pastPaper)
  } catch (error) {
    console.error("Error generating past paper:", error)
    return NextResponse.json({ error: "Failed to generate past paper" }, { status: 500 })
  }
}
