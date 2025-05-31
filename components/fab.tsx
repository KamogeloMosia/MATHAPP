"use client"

import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"
import Link from "next/link"

export function Fab() {
  // Determine the appropriate link, e.g., to the first chapter or a continue learning feature
  const fabLink = "/chapter/functions-models" // Placeholder

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      {" "}
      {/* Hidden on md and up */}
      <Button
        asChild
        size="lg"
        className="rounded-full h-14 w-14 p-0 shadow-lg bg-foreground text-background hover:bg-foreground/90"
        aria-label="Start Learning"
      >
        <Link href={fabLink}>
          <PlayCircle className="h-7 w-7" />
        </Link>
      </Button>
    </div>
  )
}
