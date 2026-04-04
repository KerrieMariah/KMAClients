"use client"

import {
  LayoutDashboard,
  FolderKanban,
  Globe,
  CreditCard,
  FileText,
  Phone,
  LogOut,
  ChevronUp,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mainNav = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Projects", icon: FolderKanban, id: "projects" },
  { title: "Website Status", icon: Globe, id: "websites" },
]

const manageNav = [
  { title: "Billing", icon: CreditCard, id: "billing" },
  { title: "Documents", icon: FileText, id: "documents" },
]

export function AppSidebar({
  activeSection,
  onNavigate,
  currentUser,
}: {
  activeSection: string
  onNavigate: (section: string) => void
  currentUser: { name: string; email: string; avatar: string; isAdmin?: boolean }
}) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-extrabold text-accent tracking-wider">KMA</span>
              <span className="text-[12px] font-medium text-white tracking-[0.2em] uppercase">Clients</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-widest text-[11px] font-medium">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onNavigate(item.id)}
                    className="h-9 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-widest text-[11px] font-medium">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onNavigate(item.id)}
                    className="h-9 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser.isAdmin && (
          <SidebarGroup className="mt-2 px-2">
            <SidebarGroupContent>
              <Link
                href="/admin"
                className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Shield className="size-4" />
                <span>Admin Panel</span>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-2 px-2">
          <SidebarGroupContent>
            <button
              onClick={() => onNavigate("booking")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === "booking"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "bg-sidebar-primary/80 text-sidebar-primary-foreground hover:bg-sidebar-primary"
              }`}
            >
              <Phone className="size-4" />
              <span>Book a Call</span>
            </button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                  {currentUser.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {currentUser.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/50">
                  {currentUser.email}
                </span>
              </div>
              <ChevronUp className="size-4 text-sidebar-foreground/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
