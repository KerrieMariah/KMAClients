"use client"

import { useState, useEffect } from "react"
import { Loader2, Globe, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WebsiteRow {
  id: string
  name: string
  url: string
  status: string
  uptime: number
  response_time: number
  user_id: string
  profiles: { full_name: string; company: string } | null
}

const statusStyle = (s: string) => {
  if (s === "online") return "bg-success/10 text-success border-success/20"
  if (s === "offline") return "bg-destructive/10 text-destructive border-destructive/20"
  return "bg-warning/10 text-warning-foreground border-warning/20"
}

export function AllWebsites({ onSelectClient }: { onSelectClient?: (id: string) => void }) {
  const [websites, setWebsites] = useState<WebsiteRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch("/api/admin/data?type=websites")
      if (res.ok) setWebsites(await res.json())
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
        <h1 className="text-2xl font-serif font-semibold text-foreground">All Websites</h1>
        <p className="text-sm text-muted-foreground mt-1">{websites.length} websites across all clients</p>
      </div>

      {websites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No websites yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {websites.map((w) => (
            <Card
              key={w.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onSelectClient?.(w.user_id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                    <Badge variant="outline" className={statusStyle(w.status)}>{w.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">{w.url}</p>
                    <a
                      href={w.url.startsWith("http") ? w.url : `https://${w.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-muted-foreground">
                    {w.profiles?.full_name ?? "Unknown"}
                    {w.profiles?.company ? ` · ${w.profiles.company}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden md:block">
                  <p className="text-sm font-medium text-foreground">{Number(w.uptime).toFixed(1)}%</p>
                  <p className="text-[11px] text-muted-foreground">uptime</p>
                </div>
                <div className="text-right shrink-0 hidden md:block">
                  <p className="text-sm font-medium text-foreground">{w.response_time}ms</p>
                  <p className="text-[11px] text-muted-foreground">response</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
