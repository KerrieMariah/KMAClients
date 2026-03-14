"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DocumentRow {
  id: string
  name: string
  type: string
  size: string | null
  uploaded_at: string
  file_url: string | null
  user_id: string
  profiles: { full_name: string; company: string } | null
}

const typeStyle = (t: string) => {
  if (t === "contract") return "bg-accent/10 text-accent border-accent/20"
  if (t === "invoice") return "bg-success/10 text-success border-success/20"
  if (t === "proposal") return "bg-blue-500/10 text-blue-600 border-blue-500/20"
  if (t === "design") return "bg-purple-500/10 text-purple-600 border-purple-500/20"
  if (t === "report") return "bg-amber-500/10 text-amber-600 border-amber-500/20"
  return ""
}

export function AllDocuments({ onSelectClient }: { onSelectClient?: (id: string) => void }) {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch("/api/admin/data?type=documents")
      if (res.ok) setDocuments(await res.json())
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
        <h1 className="text-2xl font-serif font-semibold text-foreground">All Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">{documents.length} documents across all clients</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No documents yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <Card
              key={d.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onSelectClient?.(d.user_id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    {d.file_url && (
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.profiles?.full_name ?? "Unknown client"}
                    {d.profiles?.company ? ` · ${d.profiles.company}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className={typeStyle(d.type)}>{d.type}</Badge>
                {d.size && <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{d.size}</span>}
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                  {new Date(d.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
