import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stewart Calculus - Interactive Learning Platform",
  description:
    "Master calculus with AI-powered explanations, examples, and practice problems based on James Stewart's Calculus textbook.",
  generator: "v0.dev",
}

import RootLayout from "./page"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout children={children} />
}


import './globals.css'