"use client"

import { useState } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { ProjectsView } from "@/components/projects-view"
import { ProjectDetailView } from "@/components/project-detail-view"
import { WebsitesView } from "@/components/websites-view"
import { SubscriptionView } from "@/components/subscription-view"
import { DocumentsView } from "@/components/documents-view"
import { BookingView } from "@/components/booking-view"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type {
  Project,
  Website,
  Subscription,
  Document,
  BillingItem,
} from "@/lib/mock-data"

export type PortalData = {
  currentUser: {
    id: string
    email: string
    name: string
    company: string
    avatar: string
    isAdmin?: boolean
  }
  projects: Project[]
  websites: Website[]
  billingItems: BillingItem[]
  subscription: Subscription | null
  documents: Document[]
}

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  websites: "Website Status",
  billing: "Billing",
  subscription: "Billing",
  documents: "Documents",
  booking: "Book a Call",
}

export function ClientPortal({ data }: { data: PortalData }) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    setSelectedProjectId(null)
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setActiveSection("projects")
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
  }

  const selectedProject = selectedProjectId
    ? data.projects.find((p) => p.id === selectedProjectId)
    : null

  const renderContent = () => {
    if (activeSection === "projects" && selectedProjectId) {
      return (
        <ProjectDetailView
          project={data.projects.find((p) => p.id === selectedProjectId)!}
          documents={data.documents.filter((d) => d.projectId === selectedProjectId)}
          onBack={handleBackToProjects}
        />
      )
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardView
            currentUser={data.currentUser}
            projects={data.projects}
            websites={data.websites}
            subscription={data.subscription}
            billingItems={data.billingItems}
            documents={data.documents}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
          />
        )
      case "projects":
        return (
          <ProjectsView
            projects={data.projects}
            onSelectProject={handleSelectProject}
          />
        )
      case "websites":
        return <WebsitesView websites={data.websites} />
      case "billing":
      case "subscription":
        return <SubscriptionView billingItems={data.billingItems} onNavigate={handleNavigate} />
      case "documents":
        return (
          <DocumentsView
            documents={data.documents}
            projects={data.projects}
          />
        )
      case "booking":
        return <BookingView />
      default:
        return (
          <DashboardView
            currentUser={data.currentUser}
            projects={data.projects}
            websites={data.websites}
            subscription={data.subscription}
            billingItems={data.billingItems}
            documents={data.documents}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
          />
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentUser={data.currentUser}
      />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <SidebarTrigger className="text-foreground" />
          <Separator orientation="vertical" className="h-5 bg-border" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {selectedProjectId ? (
                  <BreadcrumbLink
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => handleNavigate("projects")}
                  >
                    Projects
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-sm font-medium text-foreground">
                    {sectionTitles[activeSection] || "Dashboard"}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {selectedProjectId && selectedProject && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-medium text-foreground">
                      {selectedProject.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
