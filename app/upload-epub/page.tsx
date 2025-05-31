"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Upload } from "lucide-react"
import Link from "next/link"

export default function UploadEpubPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [processedChapters, setProcessedChapters] = useState<any[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setMessage(null)
      setProcessedChapters([])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedFile) {
      setMessage("Please select an EPUB file to upload.")
      return
    }

    setProcessing(true)
    setMessage("Processing EPUB... This may take a moment as AI generates content.")
    setProcessedChapters([])

    const formData = new FormData()
    formData.append("epubFile", selectedFile)

    try {
      // Note: In this v0 environment, the actual file content won't be sent
      // to the simulated backend. The backend will use mock data.
      // In a real app, you'd send the formData.
      const response = await fetch("/api/process-epub", {
        method: "POST",
        // For actual file upload, you'd use: body: formData,
        // For this simulation, we'll just send an empty body as the mock parser doesn't need it.
        body: formData, // Sending filename for logging purposes in mock
        // headers: {
        //   "Content-Type": "application/json", // Important for the mock API to receive JSON
        // },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setProcessedChapters(data.processedChapters || [])
      } else {
        setMessage(`Error: ${data.error || "Something went wrong."}`)
      }
    } catch (error) {
      console.error("Client-side error during EPUB upload:", error)
      setMessage("An unexpected error occurred. Please try again.")
    } finally {
      setProcessing(false)
      setSelectedFile(null) // Clear selected file after processing
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-foreground">Upload EPUB for Calculus Content</CardTitle>
          <CardDescription>Upload an EPUB file to generate summaries and practice problems using AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="epubFile">EPUB File</Label>
              <Input id="epubFile" type="file" accept=".epub" onChange={handleFileChange} />
              {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={processing || !selectedFile}>
              {processing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {processing ? "Processing..." : "Upload and Process"}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md ${
                message.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              {message}
            </div>
          )}

          {processedChapters.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Processed Chapters:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {processedChapters.map((chapter, index) => (
                  <li key={index}>
                    <strong>{chapter.chapterTitle}</strong> (Summary: {chapter.summaryLength} chars, Questions:{" "}
                    {chapter.questionCount})
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                You can now view this content by querying the `epub_content` collection in your MongoDB database. A
                dedicated UI to browse uploaded EPUB content would be a great next step!
              </p>
              <Link href="/admin/content-management">
                <Button variant="outline" className="mt-4 w-full">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
