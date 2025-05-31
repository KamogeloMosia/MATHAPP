"use client"

import React from "react"
import { Montserrat } from "next/font/google"
import "./globals.css" // Ensure globals.css is imported
import { BottomNavbar } from "@/components/bottom-navbar"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <html lang="en" className={montserrat.className}>
          <body className="bg-background text-foreground">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-md mx-auto text-center">
                <div className="bg-card border border-destructive p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    We encountered an unexpected error. Please refresh the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </body>
        </html>
      )
    }
    return this.props.children
  }
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.className}>
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          <div className="min-h-screen pb-20 md:pb-16">{children}</div>
          <BottomNavbar />
        </ErrorBoundary>
      </body>
    </html>
  )
}
