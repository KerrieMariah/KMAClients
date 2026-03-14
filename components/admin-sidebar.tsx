"use client"

import {
  Users,
  FolderKanban,
  Globe,
  CreditCard,
  FileText,
  LogOut,
  ChevronUp,
  ArrowLeftRight,
  Package,
} from "lucide-react"
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
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const adminNav = [
  { title: "Clients", icon: Users, id: "clients" },
  { title: "Products", icon: Package, id: "products" },
  { title: "Projects", icon: FolderKanban, id: "projects" },
  { title: "Websites", icon: Globe, id: "websites" },
]

const detailsNav = [
  { title: "Billing", icon: CreditCard, id: "billing" },
  { title: "Documents", icon: FileText, id: "documents" },
]

export function AdminSidebar({
  activeSection,
  onNavigate,
  currentUser,
}: {
  activeSection: string
  onNavigate: (section: string) => void
  currentUser: { name: string; email: string }
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
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
            <span className="text-sm font-bold text-accent-foreground">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
              KMAClients
            </span>
            <span className="text-xs font-medium text-accent/80">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-widest text-[11px] font-medium">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onNavigate(item.id)}
                    className="h-9 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
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
            Details
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {detailsNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onNavigate(item.id)}
                    className="h-9 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2 px-2">
          <SidebarGroupContent>
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <ArrowLeftRight className="size-4" />
              <span>Client View</span>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-accent text-accent-foreground text-xs font-medium">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
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
