"use client"

import { useState, useEffect } from "react"
import { Loader2, FolderKanban } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PROJECT_STAGES } from "@/lib/mock-data"

interface ProjectRow {
  id: string
  name: string
  status: string
  stage: string | null
  start_date: string | null
  estimated_end: string | null
  technologies: string[]
  user_id: string
  profiles: { full_name: string; company: string } | null
}

const statusStyle = (s: string) => {
  if (s === "completed") return "bg-success/10 text-success border-success/20"
  if (s === "in-progress") return "bg-accent/10 text-accent border-accent/20"
  if (s === "paused") return "bg-warning/10 text-warning-foreground border-warning/20"
  return "bg-secondary text-secondary-foreground"
}

export function AllProjects({ onSelectClient }: { onSelectClient?: (id: string) => void }) {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch("/api/admin/data?type=projects")
      if (res.ok) setProjects(await res.json())
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">All Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">{projects.length} projects across all clients</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No projects yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onSelectClient?.(p.user_id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <Badge variant="outline" className={statusStyle(p.status)}>{p.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.profiles?.full_name ?? "Unknown client"}
                    {p.profiles?.company ? ` · ${p.profiles.company}` : ""}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {PROJECT_STAGES.find((s) => s.value === p.stage)?.label ?? "Draft"}
                </span>
                {p.start_date && (
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(p.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
