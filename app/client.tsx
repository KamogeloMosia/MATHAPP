"use client"

import React from "react"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { BottomNavbar } from "@/components/bottom-navbar"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { Fab } from "@/components/fab"
import {
  SidebarProvider, // Assuming this is the correct import path
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile" // Assuming you have this hook

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

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
                <div className="bg-card p-6 rounded-lg shadow-md">
                  {" "}
                  {/* Added shadow-md */}
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
  const isMobile = useIsMobile() // Hook to detect mobile state

  // Get initial sidebar state from cookie or default to true (open) for desktop
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => {
    if (typeof window !== "undefined") {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sidebar:state="))
        ?.split("=")[1]
      return cookieValue === "true"
    }
    return true // Default open for SSR/desktop
  })

  const handleSidebarChange = (open: boolean) => {
    setIsSidebarOpen(open)
    // Persist to cookie if needed, as shown in shadcn sidebar docs
    if (typeof window !== "undefined") {
      document.cookie = `sidebar:state=${open}; path=/; max-age=${60 * 60 * 24 * 7}`
    }
  }

  return (
    <html lang="en" className={montserrat.className}>
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          <SidebarProvider open={isMobile ? false : isSidebarOpen} onOpenChange={handleSidebarChange}>
            <div className="flex min-h-screen">
              {!isMobile && <DesktopSidebar />}
              <main
                className={`flex-1 transition-all duration-300 ease-in-out ${
                  !isMobile && isSidebarOpen ? "md:ml-[16rem]" : "md:ml-[3rem]" // Adjust based on your sidebar widths
                } pb-20 md:pb-0`} // Padding for bottom nav on mobile
              >
                {children}
              </main>
            </div>
            {isMobile && <BottomNavbar />}
            {isMobile && <Fab />}
          </SidebarProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
