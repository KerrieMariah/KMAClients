"use client"

import { CheckCircle2, Clock, Pause, Zap, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Project } from "@/lib/mock-data"
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

export function ProjectsView({
  projects,
  onSelectProject,
}: {
  projects: Project[]
  onSelectProject: (projectId: string) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
          Projects
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Track progress across all your active and completed projects.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {projects.map((project) => {
          const config = statusConfig[project.status]
          const StatusIcon = config.icon

          return (
            <Card
              key={project.id}
              className="border-border bg-card shadow-none hover:shadow-sm transition-shadow cursor-pointer group"
              onClick={() => onSelectProject(project.id)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-40 sm:h-auto sm:w-48 shrink-0 overflow-hidden rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-medium text-foreground">
                            {project.name}
                          </h3>
                          <Badge variant="secondary" className={config.className}>
                            <StatusIcon className="mr-1 size-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl">
                          {project.description}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            <span>
                              Started{" "}
                              {new Date(project.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-border">|</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>
                              Est. completion{" "}
                              {new Date(project.estimatedEnd).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-[11px] font-normal text-muted-foreground border-border bg-background"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-2xl font-semibold text-foreground">
                          {project.progress}%
                        </span>
                        <span className="text-xs text-muted-foreground">Complete</span>
                        <ArrowRight className="mt-2 size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
