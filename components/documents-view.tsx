"use client"

import { useState } from "react"
import {
  FileText,
  FileSignature,
  Receipt,
  BarChart3,
  Palette,
  Download,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Document, Project } from "@/lib/mock-data"

const typeConfig: Record<string, { icon: typeof FileText; label: string; className: string }> = {
  contract: { icon: FileSignature, label: "Contract", className: "bg-primary/10 text-primary" },
  proposal: { icon: FileText, label: "Proposal", className: "bg-accent/10 text-accent" },
  invoice: { icon: Receipt, label: "Invoice", className: "bg-success/10 text-success" },
  report: { icon: BarChart3, label: "Report", className: "bg-warning/10 text-warning-foreground" },
  design: { icon: Palette, label: "Design", className: "bg-accent/10 text-accent" },
}

export function DocumentsView({
  documents,
  projects,
}: {
  documents: Document[]
  projects: Project[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filterType || doc.type === filterType
    return matchesSearch && matchesType
  })

  const types = Array.from(new Set(documents.map((d) => d.type)))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
          Documents
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Access all contracts, proposals, reports, and project files.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="h-10 pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(null)}
            className={
              filterType === null
                ? "bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-secondary"
            }
          >
            All
          </Button>
          {types.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-secondary"
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filteredDocs.length === 0 ? (
          <Card className="border-border bg-card shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No documents found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocs.map((doc) => {
            const config = typeConfig[doc.type] || typeConfig.report
            const TypeIcon = config.icon
            const project = projects.find((p) => p.id === doc.projectId)

            return (
              <Card key={doc.id} className="border-border bg-card shadow-none hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
                    <TypeIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                      <span className="text-xs text-border">|</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {project && (
                        <>
                          <span className="text-xs text-border">|</span>
                          <span className="text-xs text-muted-foreground truncate">{project.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="hidden sm:flex border-border text-muted-foreground text-xs">
                    {config.label}
                  </Badge>
                  {doc.fileUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a href={doc.fileUrl} download={doc.name} target="_blank" rel="noopener noreferrer">
                        <Download className="size-4" />
                        <span className="sr-only">Download {doc.name}</span>
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground/40 cursor-not-allowed"
                      disabled
                    >
                      <Download className="size-4" />
                      <span className="sr-only">No file available</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
