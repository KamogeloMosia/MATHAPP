"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Upload, Settings, Home, GraduationCap } from "lucide-react"
import { usePathname } from "next/navigation"

export function BottomNavbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* App Name - Only visible on larger screens */}
        <Link href="/" className="hidden md:flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Calculus App</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-around w-full md:justify-end md:w-auto md:space-x-1">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center justify-center h-auto p-1"
            >
              <Home className={`h-5 w-5 ${isActive("/") ? "text-primary-foreground" : ""}`} />
              <span className="text-xs mt-1">Home</span>
            </Button>
          </Link>

          <Link href="/chapter/functions-models">
            <Button
              variant={isActive("/chapter") || isActive("/topic") ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center justify-center h-auto p-1"
            >
              <GraduationCap
                className={`h-5 w-5 ${isActive("/chapter") || isActive("/topic") ? "text-primary-foreground" : ""}`}
              />
              <span className="text-xs mt-1">Learn</span>
            </Button>
          </Link>

          <Link href="/upload-epub">
            <Button
              variant={isActive("/upload-epub") ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center justify-center h-auto p-1"
            >
              <Upload className={`h-5 w-5 ${isActive("/upload-epub") ? "text-primary-foreground" : ""}`} />
              <span className="text-xs mt-1">Upload</span>
            </Button>
          </Link>

          <Link href="/admin/content-management">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="icon"
              className="flex flex-col items-center justify-center h-auto p-1"
            >
              <Settings className={`h-5 w-5 ${isActive("/admin") ? "text-primary-foreground" : ""}`} />
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
            <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto rounded-t-xl">
              <SheetHeader>
                <SheetTitle className="text-center flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Calculus Learning App</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6">
                <Link
                  href="/"
                  className={`flex items-center p-3 rounded-lg border ${isActive("/") ? "bg-primary/10 border-primary text-primary" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700"}`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Home</span>
                </Link>

                <Link
                  href="/chapter/functions-models"
                  className={`flex items-center p-3 rounded-lg border ${isActive("/chapter") ? "bg-primary/10 border-primary text-primary" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700"}`}
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Chapters</span>
                </Link>

                <Link
                  href="/upload-epub"
                  className={`flex items-center p-3 rounded-lg border ${isActive("/upload-epub") ? "bg-primary/10 border-primary text-primary" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700"}`}
                >
                  <Upload className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Upload EPUB</span>
                </Link>

                <Link
                  href="/admin/content-management"
                  className={`flex items-center p-3 rounded-lg border ${isActive("/admin") ? "bg-primary/10 border-primary text-primary" : "border-gray-200 hover:bg-gray-50 dark:border-gray-700"}`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Admin</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
