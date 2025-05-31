"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Upload, Settings, Home, GraduationCap } from "lucide-react"
import { usePathname } from "next/navigation"

export function BottomNavbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* App Name - Only visible on larger screens (but parent is md:hidden) */}
        {/* <Link href="/" className="hidden md:flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-foreground" />
          <span className="text-lg font-bold text-foreground">Calculus</span>
        </Link> */}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-around w-full">
          {" "}
          {/* THIS LINE IS UPDATED */}
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-2 rounded-md ${
                isActive("/") ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
              aria-label="Home"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1 hidden md:block">Home</span>
            </Button>
          </Link>
          <Link href="/chapter/functions-models">
            <Button
              variant={isActive("/chapter") || isActive("/topic") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-2 rounded-md ${
                isActive("/chapter") || isActive("/topic")
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              }`}
              aria-label="Learn"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs mt-1 hidden md:block">Learn</span>
            </Button>
          </Link>
          <Link href="/upload-epub">
            <Button
              variant={isActive("/upload-epub") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-2 rounded-md ${
                isActive("/upload-epub") ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
              aria-label="Upload EPUB"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs mt-1 hidden md:block">Upload</span>
            </Button>
          </Link>
          <Link href="/admin/content-management">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="icon"
              className={`flex flex-col items-center justify-center h-auto p-2 rounded-md ${
                isActive("/admin") ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
              aria-label="Admin"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1 hidden md:block">Admin</span>
            </Button>
          </Link>
          {/* Menu Button for Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col items-center justify-center h-auto p-2 rounded-md text-foreground hover:bg-muted"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1 hidden md:block">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-auto max-h-[80vh] overflow-y-auto rounded-t-xl bg-card border-t border-border"
            >
              <SheetHeader className="mb-4">
                <SheetTitle className="text-center flex items-center justify-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>Calculus Learning App</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { href: "/", label: "Home", icon: Home, activeCondition: isActive("/") },
                  {
                    href: "/chapter/functions-models",
                    label: "Learn",
                    icon: GraduationCap,
                    activeCondition: isActive("/chapter") || isActive("/topic"),
                  },
                  {
                    href: "/upload-epub",
                    label: "Upload EPUB",
                    icon: Upload,
                    activeCondition: isActive("/upload-epub"),
                  },
                  {
                    href: "/admin/content-management",
                    label: "Admin",
                    icon: Settings,
                    activeCondition: isActive("/admin"),
                  },
                ].map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant={item.activeCondition ? "default" : "outline"}
                      className={`w-full justify-start text-base h-auto py-3 px-4 ${item.activeCondition ? "bg-foreground text-background" : "border-border text-foreground hover:bg-muted"}`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
