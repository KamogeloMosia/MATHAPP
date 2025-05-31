"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Upload, Zap, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function FAB() {
  const [isOpen, setIsOpen] = useState(false)

  const fabItems = [
    {
      icon: BookOpen,
      label: "Quick Study",
      href: "/chapter/functions-models",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Zap,
      label: "Practice",
      href: "/topic/limit-function",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: Upload,
      label: "Upload EPUB",
      href: "/upload-epub",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <div className="fixed bottom-24 right-4 z-50 md:hidden">
      <div className="flex flex-col-reverse items-end space-y-reverse space-y-3">
        {/* FAB Items */}
        {isOpen && (
          <>
            {fabItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "transform transition-all duration-300 ease-out",
                  isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95",
                )}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <Link href={item.href}>
                  <Button
                    size="lg"
                    className={cn("rounded-full shadow-lg text-white border-0 h-12 w-12 p-0", item.color)}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </Link>
              </div>
            ))}
          </>
        )}

        {/* Main FAB Button */}
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl border-0 h-14 w-14 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <Plus className="h-6 w-6 transition-transform duration-200" />
          )}
          <span className="sr-only">Quick Actions</span>
        </Button>
      </div>
    </div>
  )
}
