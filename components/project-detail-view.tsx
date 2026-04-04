"use client"

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Pause,
  Zap,
  ExternalLink,
  FileText,
  StickyNote,
  Receipt,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
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

      {/* Description */}
      <p className="text-sm text-foreground leading-relaxed">
        {project.description}
      </p>

      {/* Timeline + Tech -- compact inline row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          Started {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          Est. completion {new Date(project.estimatedEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {project.technologies.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-[11px] font-normal text-muted-foreground border-border"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Goals */}
      {project.goals.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {"What we're working on"}
          </p>
          <ul className="flex flex-col gap-2.5">
            {project.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">
                  {goal}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invoices */}
      {documents.filter((d) => d.type === "invoice").length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Invoices
          </p>
          <div className="flex flex-wrap gap-2">
            {documents
              .filter((d) => d.type === "invoice")
              .map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-secondary transition-colors"
                >
                  <Receipt className="size-4 text-muted-foreground shrink-0" />
                  {doc.name}
                  <ExternalLink className="size-3.5 text-accent shrink-0" />
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.filter((d) => d.type !== "invoice").length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Documents
          </p>
          <div className="flex flex-col gap-1">
            {documents
              .filter((d) => d.type !== "invoice")
              .map((doc) => {
                const Wrapper = doc.fileUrl ? "a" : "div"
                const wrapperProps = doc.fileUrl
                  ? { href: doc.fileUrl, download: doc.name, target: "_blank" as const, rel: "noopener noreferrer" }
                  : {}
                return (
                  <Wrapper
                    key={doc.id}
                    {...wrapperProps}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/60 transition-colors cursor-pointer"
                  >
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{doc.name}</span>
                    {doc.fileUrl && <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />}
                  </Wrapper>
                )
              })}
          </div>
        </div>
      )}

      {project.notionUrl && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <StickyNote className="size-4" />
              Project Notes
            </div>
            <a
              href={project.notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <ExternalLink className="size-3" />
              Open in Notion
            </a>
          </div>
          <div
            className="rounded-xl overflow-hidden border border-border bg-white"
            style={{ colorScheme: "light" }}
          >
            <iframe
              src={project.notionUrl}
              title="Project Notes"
              className="w-full h-[800px] border-0"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
