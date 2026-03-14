"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Pause,
  Zap,
  Target,
  ExternalLink,
  FileText,
  StickyNote,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project, Document } from "@/lib/mock-data"
import Image from "next/image"

const statusConfig = {
  active: {
    icon: Zap,
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  "in-progress": {
    icon: Clock,
    label: "In Progress",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "bg-muted text-muted-foreground border-border",
  },
  paused: {
    icon: Pause,
    label: "Paused",
    className: "bg-warning/10 text-warning-foreground border-warning/20",
  },
}

export function ProjectDetailView({
  project,
  documents,
  onBack,
}: {
  project: Project
  documents: Document[]
  onBack: () => void
}) {
  const config = statusConfig[project.status]
  const StatusIcon = config.icon

  const [notionUrl, setNotionUrl] = useState(project.notionUrl || "")
  const [isEmbedded, setIsEmbedded] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Projects
        </Button>

        <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6">
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-card tracking-tight">
                {project.name}
              </h1>
              <Badge variant="secondary" className={config.className}>
                <StatusIcon className="mr-1 size-3" />
                {config.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={project.progress} className="flex-1 h-2" />
          <span className="text-lg font-semibold text-foreground shrink-0">
            {project.progress}%
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <Target className="size-4" />
                {"What We're Working On"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {project.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <CheckCircle2 className="size-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">
                      {goal}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <StickyNote className="size-4" />
                Project Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEmbedded ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect your Notion page to view project notes and documentation directly here.
                  </p>
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-secondary/50 p-5">
                    <Label className="text-sm font-medium text-foreground">
                      Notion Page URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://notion.site/your-page..."
                        value={notionUrl}
                        onChange={(e) => setNotionUrl(e.target.value)}
                        className="bg-card border-border text-foreground"
                      />
                      <Button
                        onClick={() => {
                          if (notionUrl) setIsEmbedded(true)
                        }}
                        disabled={!notionUrl}
                        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Embed
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste a public Notion page URL to embed it below.
                    </p>
                  </div>
                  {project.notionUrl && (
                    <a
                      href={project.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      <ExternalLink className="size-4" />
                      Open project notes in Notion
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Embedded from Notion</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setIsEmbedded(false)}
                    >
                      Remove embed
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <iframe
                      src={notionUrl}
                      title="Notion Project Notes"
                      className="w-full h-[600px] border-0"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Calendar className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Clock className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Completion</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(project.estimatedEnd).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="text-xs font-normal text-foreground border-border bg-secondary/50"
                >
                  {tech}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {documents.length > 0 ? (
                documents.map((doc) => {
                  const Wrapper = doc.fileUrl ? "a" : "div"
                  const wrapperProps = doc.fileUrl
                    ? { href: doc.fileUrl, download: doc.name, target: "_blank" as const, rel: "noopener noreferrer" }
                    : {}
                  return (
                    <Wrapper
                      key={doc.id}
                      {...wrapperProps}
                      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{doc.size}</p>
                      </div>
                    </Wrapper>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No documents for this project yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
