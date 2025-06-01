"use client"

import { useState } from "react"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface AdaptiveCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  mobileCompact?: boolean
  priority?: "high" | "medium" | "low"
  collapsible?: boolean
}

export function AdaptiveCard({
  title,
  children,
  className,
  mobileCompact = false,
  priority = "medium",
  collapsible = false,
}: AdaptiveCardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getPriorityClasses = () => {
    if (!isMobile) return ""

    switch (priority) {
      case "high":
        return "order-1"
      case "medium":
        return "order-2"
      case "low":
        return "order-3 hidden sm:block"
      default:
        return ""
    }
  }

  const getCardClasses = () => {
    const baseClasses = "shadow-sm border-0 transition-all duration-200"
    const mobileClasses = isMobile && mobileCompact ? "p-2" : ""
    const priorityClasses = getPriorityClasses()

    return cn(baseClasses, mobileClasses, priorityClasses, className)
  }

  return (
    <Card className={getCardClasses()}>
      {title && (
        <CardHeader className={cn("pb-3", isMobile && mobileCompact && "pb-2 px-3 py-2")}>
          <CardTitle
            className={cn(
              "text-lg font-semibold",
              isMobile && "text-base",
              collapsible && "cursor-pointer flex items-center justify-between",
            )}
            onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
          >
            {title}
            {collapsible && isMobile && <span className="text-sm">{isCollapsed ? "+" : "−"}</span>}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={cn("p-6", isMobile && mobileCompact && "p-3", collapsible && isCollapsed && isMobile && "hidden")}
      >
        {children}
      </CardContent>
    </Card>
  )
}
