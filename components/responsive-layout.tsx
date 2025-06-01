"use client"

import type React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  mobileLayout?: "stack" | "grid" | "carousel"
  desktopLayout?: "sidebar" | "grid" | "split"
}

export function ResponsiveLayout({
  children,
  className,
  mobileLayout = "stack",
  desktopLayout = "grid",
}: ResponsiveLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
  const isDesktop = useMediaQuery("(min-width: 1025px)")

  const getLayoutClasses = () => {
    if (isMobile) {
      switch (mobileLayout) {
        case "stack":
          return "flex flex-col space-y-4"
        case "grid":
          return "grid grid-cols-1 gap-4"
        case "carousel":
          return "flex overflow-x-auto space-x-4 snap-x snap-mandatory"
        default:
          return "flex flex-col space-y-4"
      }
    }

    if (isTablet) {
      return "grid grid-cols-2 gap-6"
    }

    if (isDesktop) {
      switch (desktopLayout) {
        case "sidebar":
          return "grid grid-cols-12 gap-8"
        case "grid":
          return "grid grid-cols-3 gap-6"
        case "split":
          return "grid grid-cols-2 gap-8"
        default:
          return "grid grid-cols-3 gap-6"
      }
    }

    return "grid grid-cols-1 gap-4"
  }

  return <div className={cn(getLayoutClasses(), className)}>{children}</div>
}
