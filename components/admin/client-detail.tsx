"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Plus,
  FolderKanban,
  Globe,
  CreditCard,
  FileText,
  CalendarClock,
  Pencil,
  Trash2,
  ExternalLink,
  Phone,
  Check,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProjectForm } from "@/components/admin/project-form"
import { WebsiteForm } from "@/components/admin/website-form"
import { BillingItemForm } from "@/components/admin/billing-item-form"
import { DocumentForm } from "@/components/admin/document-form"

interface ClientDetailProps {
  client: {
    profile: {
      id: string
      fullName: string
      company: string
      avatarUrl: string | null
      isAdmin: boolean
      createdAt: string
      emergencyPhone: string | null
    }
    projects: any[]
    websites: any[]
    billingItems: any[]
    subscription: any | null
    documents: any[]
    bookings: any[]
  }
  onBack: () => void
  onRefresh: () => void
}

type FormType = "project" | "website" | "billing" | "document" | null
type EditingItem = any | null

export function ClientDetail({ client, onBack, onRefresh }: ClientDetailProps) {
  const [activeForm, setActiveForm] = useState<FormType>(null)
  const [editingItem, setEditingItem] = useState<EditingItem>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { profile, projects, websites, billingItems = [], documents, bookings } = client

  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(profile.emergencyPhone ?? "")
  const [savingPhone, setSavingPhone] = useState(false)

  const handleSavePhone = async () => {
    setSavingPhone(true)
    try {
      const res = await fetch("/api/admin/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.id, emergency_phone: phoneValue || null }),
      })
      if (!res.ok) throw new Error()
      setEditingPhone(false)
      onRefresh()
    } catch {
      alert("Failed to save")
    } finally {
      setSavingPhone(false)
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/${table}?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      onRefresh()
    } catch {
      alert("Failed to delete")
    } finally {
      setDeleting(null)
    }
  }

  const openEdit = (type: FormType, item: any) => {
    setEditingItem(item)
    setActiveForm(type)
  }

  const closeForm = () => {
    setActiveForm(null)
    setEditingItem(null)
  }

  const statusColor = (s: string) => {
    if (s === "online" || s === "active" || s === "completed" || s === "confirmed" || s === "paid") return "bg-success text-success-foreground"
    if (s === "offline" || s === "cancelled") return "bg-destructive/10 text-destructive"
    if (s === "maintenance" || s === "paused" || s === "past_due") return "bg-warning text-warning-foreground"
    if (s === "pending") return "bg-secondary text-secondary-foreground"
    return ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="mr-1 size-4" />
          Back
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
            {profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">{profile.fullName}</h1>
          {profile.company && <p className="text-sm text-muted-foreground">{profile.company}</p>}
          <p className="text-xs text-muted-foreground">Client since {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Projects", value: projects.length, icon: FolderKanban },
          { label: "Websites", value: websites.length, icon: Globe },
          { label: "Documents", value: documents.length, icon: FileText },
          { label: "Bookings", value: bookings.length, icon: CalendarClock },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="rounded-lg bg-secondary p-2">
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Phone */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="rounded-lg bg-destructive/10 p-2">
            <Phone className="size-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Priority Line</p>
            {editingPhone ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-8 text-sm max-w-[200px]"
                />
                <Button size="sm" variant="ghost" className="size-8 p-0" onClick={handleSavePhone} disabled={savingPhone}>
                  <Check className="size-4 text-success" />
                </Button>
                <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => { setEditingPhone(false); setPhoneValue(profile.emergencyPhone ?? "") }}>
                  <X className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {profile.emergencyPhone || "Not set"}
                </p>
                <Button size="sm" variant="ghost" className="size-6 p-0" onClick={() => setEditingPhone(true)}>
                  <Pencil className="size-3 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderKanban className="size-4" /> Projects
          </CardTitle>
          <Button size="sm" onClick={() => setActiveForm("project")} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 size-3" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No projects yet</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="size-10 rounded object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.stage ?? "Draft"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(p.status)}>{p.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit("project", p)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={deleting === p.id} onClick={() => handleDelete("projects", p.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Websites */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4" /> Websites
          </CardTitle>
          <Button size="sm" onClick={() => setActiveForm("website")} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 size-3" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {websites.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No websites yet</p>
          ) : (
            websites.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">{w.name}</p>
                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent">
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{w.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(w.status)}>{w.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit("website", w)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={deleting === w.id} onClick={() => handleDelete("websites", w.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Billing Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4" /> Billing
          </CardTitle>
          <Button size="sm" onClick={() => setActiveForm("billing")} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 size-3" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {billingItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No billing items yet</p>
          ) : (
            billingItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">{item.name || item.plan}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {item.type === "one_time" ? "One-time" : "Recurring"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${Number(item.price).toFixed(2)}
                    {item.type === "recurring" && `/${item.billing_cycle || "monthly"}`}
                    {item.features?.length > 0 && ` · ${item.features.length} features`}
                  </p>
                  {item.stripe_price_id && (
                    <p className="mt-0.5 text-xs text-accent">
                      {item.stripe_subscription_id
                        ? "Stripe active"
                        : item.status === "paid"
                          ? "Paid via Stripe"
                          : "Stripe price linked · awaiting payment"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={statusColor(item.status)}>{item.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit("billing", item)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={deleting === item.id} onClick={() => handleDelete("billing", item.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> Documents
          </CardTitle>
          <Button size="sm" onClick={() => setActiveForm("document")} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 size-3" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No documents yet</p>
          ) : (
            documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">{d.name}</p>
                    {d.file_url && (
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent">
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{d.type} {d.size && `-- ${d.size}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit("document", d)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={deleting === d.id} onClick={() => handleDelete("documents", d.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bookings (view only) */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" /> Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{b.call_type} call</p>
                  <p className="text-xs text-muted-foreground">{b.date} at {b.time}</p>
                </div>
                <Badge className={statusColor(b.status)}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Forms */}
      {activeForm === "project" && (
        <ProjectForm
          open
          onClose={closeForm}
          onSuccess={onRefresh}
          clientId={profile.id}
          project={editingItem}
        />
      )}
      {activeForm === "website" && (
        <WebsiteForm
          open
          onClose={closeForm}
          onSuccess={onRefresh}
          clientId={profile.id}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          website={editingItem}
        />
      )}
      {activeForm === "billing" && (
        <BillingItemForm
          open
          onClose={closeForm}
          onSuccess={onRefresh}
          clientId={profile.id}
          billingItem={editingItem}
        />
      )}
      {activeForm === "document" && (
        <DocumentForm
          open
          onClose={closeForm}
          onSuccess={onRefresh}
          clientId={profile.id}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          document={editingItem}
        />
      )}
    </div>
  )
}
