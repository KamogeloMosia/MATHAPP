import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client"

export const metadata: Metadata = {
  title: "Calculus Mastery - Minimal Learning Platform",
  description:
    "Master calculus with a clean, focused interface. AI-powered explanations, examples, and practice problems.",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'