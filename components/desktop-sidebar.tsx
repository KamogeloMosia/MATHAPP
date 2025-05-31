"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar" // Assuming sidebar components are in ui/sidebar
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Home, Upload, Settings, GraduationCap, PanelLeft, PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  isCollapsed: boolean
}) => (
  <SidebarMenuItem>
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start h-10",
        isActive && "bg-foreground text-background",
        isCollapsed && "justify-center px-0",
      )}
      title={label} // Tooltip for collapsed state
    >
      <Link href={href}>
        <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    </Button>
  </SidebarMenuItem>
)

export function DesktopSidebar() {
  const pathname = usePathname()
  const { state: sidebarState, toggleSidebar, open } = useSidebar()
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
    <Sidebar
      collapsible="icon"
      className="hidden md:flex flex-col bg-card shadow-md h-screen fixed left-0 top-0 z-40" // Added shadow-md
      // Removed border-r border-border for "no border" look
    >
      <SidebarHeader className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-foreground" />
            <span className="text-xl font-bold text-foreground">Calculus</span>
          </Link>
        )}
        {/* SidebarTrigger is usually outside, but we can have a toggle inside too */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-foreground">
          {open ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        </Button>
      </SidebarHeader>
      <SidebarContent asChild className="flex-1">
        <ScrollArea>
          <SidebarMenu className="p-2 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
              />
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">{/* Can add user profile or settings shortcut here */}</SidebarFooter>
    </Sidebar>
  )
}

// You'll need to wrap your layout with SidebarProvider
// Example: app/client.tsx
// import { SidebarProvider } from "@/components/ui/sidebar";
// <SidebarProvider defaultOpen={true}> ... </SidebarProvider>
