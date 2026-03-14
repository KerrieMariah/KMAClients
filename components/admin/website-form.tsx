"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WebsiteFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  projects: { id: string; name: string }[]
  website?: {
    id: string
    name: string
    url: string
    status: string
    project_id: string | null
    uptime: number
    response_time: number
    visitors_total: number
    visitors_change: number
    bounce_rate: number
  } | null
}

export function WebsiteForm({ open, onClose, onSuccess, clientId, projects, website }: WebsiteFormProps) {
  const isEditing = !!website
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(website?.name ?? "")
  const [url, setUrl] = useState(website?.url ?? "")
  const [status, setStatus] = useState(website?.status ?? "online")
  const [projectId, setProjectId] = useState(website?.project_id ?? "none")
  const [uptime, setUptime] = useState(website?.uptime ?? 99.9)
  const [responseTime, setResponseTime] = useState(website?.response_time ?? 200)
  const [visitors, setVisitors] = useState(website?.visitors_total ?? 0)
  const [visitorsChange, setVisitorsChange] = useState(website?.visitors_change ?? 0)
  const [bounceRate, setBounceRate] = useState(website?.bounce_rate ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...(isEditing ? { id: website!.id } : { user_id: clientId }),
      name,
      url,
      status,
      project_id: projectId === "none" ? null : projectId,
      uptime,
      response_time: responseTime,
      visitors_total: visitors,
      visitors_change: visitorsChange,
      bounce_rate: bounceRate,
    }

    try {
      const res = await fetch("/api/admin/websites", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      onSuccess()
      onClose()
    } catch {
      alert("Failed to save website")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Website" : "Add Website"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Site Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Main Website" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>URL</Label>
              <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Uptime (%)</Label>
              <Input type="number" step="0.01" min="0" max="100" value={uptime} onChange={(e) => setUptime(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Response Time (ms)</Label>
              <Input type="number" min="0" value={responseTime} onChange={(e) => setResponseTime(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Total Visitors</Label>
              <Input type="number" min="0" value={visitors} onChange={(e) => setVisitors(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Visitor Change (%)</Label>
              <Input type="number" step="0.1" value={visitorsChange} onChange={(e) => setVisitorsChange(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Bounce Rate (%)</Label>
              <Input type="number" step="0.1" min="0" max="100" value={bounceRate} onChange={(e) => setBounceRate(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name || !url} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
