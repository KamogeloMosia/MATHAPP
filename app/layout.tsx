import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { BottomNavbar } from "@/components/bottom-navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stewart Calculus - Interactive Learning Platform",
  description:
    "Master calculus with AI-powered explanations, examples, and practice problems based on James Stewart's Calculus textbook.",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="min-h-screen pb-16">
          {/* pb-16 for bottom navbar */}
          {children}
        </div>
        <BottomNavbar />
      </body>
    </html>
  )
}
