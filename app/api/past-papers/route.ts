import { type NextRequest, NextResponse } from "next/server"

// Mock database of past papers - in real app, this would be MongoDB
const pastPapers = [
  {
    id: "asma1b1-2023-nov",
    title: "ASMA1B1 November 2023",
    course: "Applied Mathematics 1B1",
    year: 2023,
    session: "November",
    duration: "3 hours",
    totalMarks: 100,
    difficulty: "medium",
    chapters: ["limits", "derivatives", "applications-derivatives"],
    questionCount: 8,
    createdAt: "2023-11-15T00:00:00Z",
  },
  {
    id: "mat01b1-2023-may",
    title: "MAT01B1 May 2023",
    course: "Mathematics 01B1",
    year: 2023,
    session: "May",
    duration: "3 hours",
    totalMarks: 100,
    difficulty: "hard",
    chapters: ["integration", "applications-integration", "differential-equations"],
    questionCount: 7,
    createdAt: "2023-05-20T00:00:00Z",
  },
  {
    id: "asma1b1-2022-nov",
    title: "ASMA1B1 November 2022",
    course: "Applied Mathematics 1B1",
    year: 2022,
    session: "November",
    duration: "3 hours",
    totalMarks: 100,
    difficulty: "medium",
    chapters: ["limits", "derivatives", "optimization"],
    questionCount: 8,
    createdAt: "2022-11-15T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const course = searchParams.get("course")
    const year = searchParams.get("year")
    const difficulty = searchParams.get("difficulty")

    let filteredPapers = pastPapers

    if (course) {
      filteredPapers = filteredPapers.filter((paper) => paper.course.toLowerCase().includes(course.toLowerCase()))
    }

    if (year) {
      filteredPapers = filteredPapers.filter((paper) => paper.year.toString() === year)
    }

    if (difficulty) {
      filteredPapers = filteredPapers.filter((paper) => paper.difficulty === difficulty)
    }

    return NextResponse.json({
      papers: filteredPapers,
      total: filteredPapers.length,
    })
  } catch (error) {
    console.error("Error fetching past papers:", error)
    return NextResponse.json({ error: "Failed to fetch past papers" }, { status: 500 })
  }
}
