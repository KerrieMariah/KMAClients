"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  project?: {
    id: string
    name: string
    description: string
    status: string
    progress: number
    start_date: string | null
    estimated_end: string | null
    technologies: string[]
    image_url: string | null
    goals: string[]
    notion_url: string | null
  } | null
}

export function ProjectForm({ open, onClose, onSuccess, clientId, project }: ProjectFormProps) {
  const isEditing = !!project
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(project?.name ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [status, setStatus] = useState(project?.status ?? "active")
  const [progress, setProgress] = useState(project?.progress ?? 0)
  const [startDate, setStartDate] = useState(project?.start_date ?? "")
  const [estimatedEnd, setEstimatedEnd] = useState(project?.estimated_end ?? "")
  const [techInput, setTechInput] = useState("")
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies ?? [])
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "")
  const [goalsText, setGoalsText] = useState((project?.goals ?? []).join("\n"))
  const [notionUrl, setNotionUrl] = useState(project?.notion_url ?? "")

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const goals = goalsText.split("\n").map(g => g.trim()).filter(Boolean)
    const payload = {
      ...(isEditing ? { id: project!.id } : { user_id: clientId }),
      name,
      description,
      status,
      progress,
      start_date: startDate || null,
      estimated_end: estimatedEnd || null,
      technologies,
      image_url: imageUrl || null,
      goals,
      notion_url: notionUrl || null,
    }

    try {
      const res = await fetch("/api/admin/projects", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      onSuccess()
      onClose()
    } catch {
      alert("Failed to save project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Project Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="E-commerce Redesign" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description of the project..." />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Progress ({progress}%)</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Estimated End</Label>
              <Input type="date" value={estimatedEnd} onChange={(e) => setEstimatedEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="flex gap-2">
              <Input
                placeholder="React, Node.js, etc."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTech() } }}
              />
              <Button type="button" variant="outline" onClick={handleAddTech}>Add</Button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {technologies.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {t}
                    <button type="button" onClick={() => setTechnologies(technologies.filter(x => x !== t))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <FileUpload label="Cover Image" value={imageUrl} onChange={setImageUrl} bucket="project-images" accept="image/*" />

          <div className="space-y-2">
            <Label>Goals (one per line)</Label>
            <Textarea value={goalsText} onChange={(e) => setGoalsText(e.target.value)} rows={4} placeholder={"Redesign homepage\nBuild checkout flow\nIntegrate payment gateway"} />
          </div>

          <div className="space-y-2">
            <Label>Notion Page URL</Label>
            <Input type="url" placeholder="https://notion.site/your-page" value={notionUrl} onChange={(e) => setNotionUrl(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : isEditing ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
