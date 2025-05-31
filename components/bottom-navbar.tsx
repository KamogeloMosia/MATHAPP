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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* App Name - Only visible on larger screens */}
        <Link href="/" className="hidden md:flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-foreground" />
          <span className="text-lg font-bold text-foreground">Calculus</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-around w-full md:justify-end md:w-auto md:space-x-1">
          <Link href="/">
            <Button
              variant={isActive("/") && !isActive("/chapter") && !isActive("/topic") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-1 ${
                isActive("/") && !isActive("/chapter") && !isActive("/topic")
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Button>
          </Link>

          <Link href="/chapter/functions-models">
            <Button
              variant={isActive("/chapter") || isActive("/topic") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-1 ${
                isActive("/chapter") || isActive("/topic")
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs mt-1">Learn</span>
            </Button>
          </Link>

          <Link href="/upload-epub">
            <Button
              variant={isActive("/upload-epub") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-1 ${
                isActive("/upload-epub") ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs mt-1">Upload</span>
            </Button>
          </Link>

          <Link href="/admin/content-management">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-1 ${
                isActive("/admin") ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Admin</span>
            </Button>
          </Link>

          {/* Menu Button for Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col items-center justify-center h-auto p-1 text-foreground hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-auto max-h-[80vh] overflow-y-auto rounded-t-xl bg-card border-t border-border"
            >
              <SheetHeader>
                <SheetTitle className="text-center flex items-center justify-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>Calculus Learning App</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6">
                <Link
                  href="/"
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    isActive("/") && !isActive("/chapter") && !isActive("/topic")
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Home</span>
                </Link>

                <Link
                  href="/chapter/functions-models"
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    isActive("/chapter") || isActive("/topic")
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Chapters</span>
                </Link>

                <Link
                  href="/upload-epub"
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    isActive("/upload-epub")
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <Upload className="h-5 w-5 mr-3" />
                  <span className="text-base font-medium">Upload EPUB</span>
                </Link>

                <Link
                  href="/admin/content-management"
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    isActive("/admin")
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
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
