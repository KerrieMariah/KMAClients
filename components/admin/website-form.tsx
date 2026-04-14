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
    ga_property_id: string | null
    gsc_site_url: string | null
  } | null
}

export function WebsiteForm({ open, onClose, onSuccess, clientId, projects, website }: WebsiteFormProps) {
  const isEditing = !!website
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(website?.name ?? "")
  const [url, setUrl] = useState(website?.url ?? "")
  const [status, setStatus] = useState(website?.status ?? "online")
  const [projectId, setProjectId] = useState(website?.project_id ?? "none")
  const [gaPropertyId, setGaPropertyId] = useState(website?.ga_property_id ?? "")
  const [gscSiteUrl, setGscSiteUrl] = useState(website?.gsc_site_url ?? "")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...(isEditing ? { id: website!.id } : { user_id: clientId }),
      name,
      url,
      status,
      project_id: projectId === "none" ? null : projectId,
      ga_property_id: gaPropertyId || null,
      gsc_site_url: gscSiteUrl || null,
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
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analytics Integrations</p>
            <div className="space-y-2">
              <Label>GA4 Property ID</Label>
              <Input value={gaPropertyId} onChange={(e) => setGaPropertyId(e.target.value)} placeholder="properties/123456789" />
            </div>
            <div className="space-y-2">
              <Label>Search Console Site URL</Label>
              <Input value={gscSiteUrl} onChange={(e) => setGscSiteUrl(e.target.value)} placeholder="sc-domain:example.com or https://example.com/" />
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
