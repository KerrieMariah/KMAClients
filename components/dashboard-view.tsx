"use client"

import { useState, useEffect } from "react"
import {
  FolderKanban,
  Globe,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Phone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { Project, Website, Subscription, Document, BillingItem } from "@/lib/mock-data"
import Image from "next/image"

export function DashboardView({
  currentUser,
  projects,
  websites,
  subscription,
  billingItems = [],
  documents,
  onNavigate,
  onSelectProject,
}: {
  currentUser: { name: string }
  projects: Project[]
  websites: Website[]
  subscription: Subscription | null
  billingItems?: BillingItem[]
  documents: Document[]
  onNavigate: (section: string) => void
  onSelectProject: (projectId: string) => void
}) {
  const activeProjects = projects.filter((p) => p.status !== "completed")
  const onlineCount = websites.filter((w) => w.status === "online").length
  const recentDocs = documents.slice(0, 3)

  const [greeting, setGreeting] = useState("Welcome")
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          {greeting}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground tracking-tight text-balance">
          {currentUser.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {"Here's an overview of your projects and services."}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onNavigate("projects")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <FolderKanban className="size-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-foreground">{activeProjects.length}</p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onNavigate("websites")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
              <Globe className="size-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-foreground">
                {onlineCount}/{websites.length}
              </p>
              <p className="text-xs text-muted-foreground">Sites Online</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onNavigate("billing")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="size-5 text-accent" />
            </div>
            <div className="min-w-0 overflow-hidden">
              {billingItems.length > 0 ? (
                <>
                  <p className="text-2xl font-semibold text-foreground">{billingItems.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {billingItems.filter(i => i.status === "active" || i.status === "paid").length} active
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-foreground truncate">{subscription?.plan ?? "No Plan"}</p>
                  <p className="text-xs text-muted-foreground">{subscription ? `$${subscription.price}/mo` : "Not set up"}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => onNavigate("documents")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <FileText className="size-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-foreground">{documents.length}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground uppercase tracking-wider">
              Active Projects
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate("projects")}
            >
              View all
              <ArrowRight className="ml-1 size-3" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {activeProjects.length === 0 ? (
              <Card className="border-border bg-card shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <FolderKanban className="size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No active projects yet</p>
                </CardContent>
              </Card>
            ) : (
              activeProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer group"
                  onClick={() => onSelectProject(project.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Project image */}
                      <div className="relative w-28 shrink-0 overflow-hidden rounded-l-xl">
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {project.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={
                              project.status === "in-progress"
                                ? "bg-accent/10 text-accent border-accent/20 shrink-0"
                                : "bg-success/10 text-success border-success/20 shrink-0"
                            }
                          >
                            {project.status === "in-progress" ? (
                              <Clock className="mr-1 size-3" />
                            ) : (
                              <CheckCircle2 className="mr-1 size-3" />
                            )}
                            {project.status}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Progress value={project.progress} className="flex-1 h-1.5" />
                          <span className="text-xs font-semibold text-foreground shrink-0">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Recent Docs + Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground uppercase tracking-wider">
              Recent Documents
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate("documents")}
            >
              View all
              <ArrowRight className="ml-1 size-3" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {recentDocs.length === 0 ? (
              <Card className="border-border bg-card shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="size-8 text-muted-foreground/30" />
                  <p className="mt-2 text-xs text-muted-foreground">No documents yet</p>
                </CardContent>
              </Card>
            ) : (
              recentDocs.map((doc) => (
                <Card key={doc.id} className="border-border bg-card shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{doc.size}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick actions */}
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              <Button
                className="justify-start h-11 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                onClick={() => onNavigate("booking")}
              >
                <Phone className="mr-2 size-4" />
                Book a Call
              </Button>
              <Button
                variant="outline"
                className="justify-start h-10 border-border text-foreground hover:bg-secondary"
                onClick={() => onNavigate("billing")}
              >
                <CreditCard className="mr-2 size-4 text-muted-foreground" />
                Manage billing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
