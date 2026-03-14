"use client"

import { useState } from "react"
import { Users, Plus, Search, Building2, FolderKanban, Loader2, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Client {
  id: string
  fullName: string
  company: string
  avatarUrl: string | null
  isAdmin: boolean
  projectCount: number
  subscription: string
  subscriptionStatus: string
  createdAt: string
}

export function ClientTable({
  clients,
  onSelectClient,
  onRefresh,
}: {
  clients: Client[]
  onSelectClient: (id: string) => void
  onRefresh: () => void
}) {
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteCompany, setInviteCompany] = useState("")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteResult, setInviteResult] = useState<{ message: string; tempPassword: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = clients.filter((c) =>
    !c.isAdmin &&
    (c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()))
  )

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteResult(null)

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          company: inviteCompany,
          password: invitePassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to invite")
      setInviteResult({ message: data.message, tempPassword: data.tempPassword })
      onRefresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to invite client")
    } finally {
      setInviting(false)
    }
  }

  const handleCopyPassword = async (pw: string) => {
    await navigator.clipboard.writeText(pw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeInviteDialog = () => {
    setInviteOpen(false)
    setInviteEmail("")
    setInviteName("")
    setInviteCompany("")
    setInvitePassword("")
    setInviteResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} client{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 size-4" />
          Invite Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">No clients yet</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Invite your first client to get started</p>
            <Button onClick={() => setInviteOpen(true)} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 size-4" />
              Invite Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-accent/30"
              onClick={() => onSelectClient(client.id)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                    {client.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{client.fullName}</p>
                  {client.company && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                      <Building2 className="size-3" />
                      {client.company}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FolderKanban className="size-3.5" />
                    <span>{client.projectCount} project{client.projectCount !== 1 ? "s" : ""}</span>
                  </div>
                  <Badge
                    variant={client.subscriptionStatus === "active" ? "default" : "secondary"}
                    className={client.subscriptionStatus === "active" ? "bg-success text-success-foreground" : ""}
                  >
                    {client.subscription}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={() => closeInviteDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New Client</DialogTitle>
          </DialogHeader>
          {inviteResult ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="text-sm font-medium text-foreground">Client account created</p>
                <p className="mt-1 text-sm text-muted-foreground">Share these credentials with your client:</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{inviteEmail}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">{inviteResult.tempPassword}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPassword(inviteResult.tempPassword)}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={closeInviteDialog} className="w-full">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="client@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={inviteCompany} onChange={(e) => setInviteCompany(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>
                  Password
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(leave blank to auto-generate)</span>
                </Label>
                <Input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Set a password for this client"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeInviteDialog}>Cancel</Button>
                <Button type="submit" disabled={inviting || !inviteEmail} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {inviting ? <><Loader2 className="mr-2 size-4 animate-spin" />Creating...</> : "Create Account"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
