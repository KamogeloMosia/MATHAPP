"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Upload, Settings, Home } from "lucide-react"

export function BottomNavbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App Name */}
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Calculus App</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center h-auto p-1">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Button>
          </Link>
          <Link href="/upload-epub">
            <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center h-auto p-1">
              <Upload className="h-5 w-5" />
              <span className="text-xs mt-1">Upload</span>
            </Button>
          </Link>
          <Link href="/admin/content-management">
            <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center h-auto p-1">
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Admin</span>
            </Button>
          </Link>

          {/* Menu Button for Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center h-auto p-1">
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-center">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 py-6">
                <Link href="/" className="text-lg font-medium hover:text-primary" prefetch={false}>
                  Home
                </Link>
                <Link
                  href="/chapter/functions-models"
                  className="text-lg font-medium hover:text-primary"
                  prefetch={false}
                >
                  Chapters
                </Link>
                <Link href="/upload-epub" className="text-lg font-medium hover:text-primary" prefetch={false}>
                  Upload EPUB
                </Link>
                <Link
                  href="/admin/content-management"
                  className="text-lg font-medium hover:text-primary"
                  prefetch={false}
                >
                  Admin Dashboard
                </Link>
                {/* Add more navigation links as needed */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
