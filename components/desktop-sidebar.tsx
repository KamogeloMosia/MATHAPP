"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Home, Upload, Settings, GraduationCap, PanelLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function DesktopSidebar() {
  const pathname = usePathname()
  const { state: sidebarState, toggleSidebar } = useSidebar()
  const isCollapsed = sidebarState === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/chapter/functions-models", icon: GraduationCap, label: "Learn Calculus" },
    { href: "/upload-epub", icon: Upload, label: "Upload EPUB" },
    { href: "/admin/content-management", icon: Settings, label: "Admin Panel" },
  ]

  return (
    <Sidebar collapsible="icon" className="hidden md:flex flex-col bg-card shadow-lg h-screen fixed left-0 top-0 z-40">
      <SidebarHeader className="p-4 flex items-center justify-between border-b border-border/50">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Calculus</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-foreground">
          <PanelLeft className="h-5 w-5" />
        </Button>
      </SidebarHeader>

      <SidebarContent asChild className="flex-1">
        <ScrollArea>
          <SidebarMenu className="p-2 space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={isCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full justify-start h-10 transition-colors",
                    isActive(item.href) && "bg-primary text-primary-foreground",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scholar</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
