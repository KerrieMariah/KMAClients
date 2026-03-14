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
import { FileUpload } from "@/components/admin/file-upload"

interface DocumentFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  projects: { id: string; name: string }[]
  document?: {
    id: string
    name: string
    type: string
    size: string | null
    file_url: string | null
    project_id: string | null
  } | null
}

export function DocumentForm({ open, onClose, onSuccess, clientId, projects, document: doc }: DocumentFormProps) {
  const isEditing = !!doc
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(doc?.name ?? "")
  const [type, setType] = useState(doc?.type ?? "proposal")
  const [size, setSize] = useState(doc?.size ?? "")
  const [fileUrl, setFileUrl] = useState(doc?.file_url ?? "")
  const [projectId, setProjectId] = useState(doc?.project_id ?? "none")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...(isEditing ? { id: doc!.id } : { user_id: clientId }),
      name,
      type,
      size: size || null,
      file_url: fileUrl || null,
      project_id: projectId === "none" ? null : projectId,
    }

    try {
      const res = await fetch("/api/admin/documents", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      onSuccess()
      onClose()
    } catch {
      alert("Failed to save document")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Document" : "Add Document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Document Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Project Proposal v2" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              <Label>File Size</Label>
              <Input placeholder="2.4 MB" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
          </div>

          <FileUpload
            label="Document File"
            value={fileUrl}
            onChange={setFileUrl}
            bucket="documents"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : isEditing ? "Update" : "Add Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
