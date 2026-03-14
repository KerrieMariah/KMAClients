"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Archive, Loader2, Package, Repeat, Zap, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
} from "@/components/ui/dialog"

interface Product {
  id: string
  name: string
  description: string | null
  type: "one_time" | "recurring"
  price: number
  currency: string
  interval: string | null
  interval_count: number
  features: string[]
  stripe_product_id: string | null
  stripe_price_id: string | null
  is_active: boolean
  created_at: string
}

function formatPrice(price: number, type: string, interval: string | null, intervalCount: number) {
  const amount = `$${Number(price).toFixed(2)}`
  if (type === "one_time") return `${amount} one-time`
  if (interval === "quarter") return `${amount}/quarter`
  if (interval === "year") return `${amount}/year`
  if (intervalCount > 1) return `${amount} every ${intervalCount} months`
  return `${amount}/month`
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"one_time" | "recurring">("recurring")
  const [price, setPrice] = useState(0)
  const [interval, setInterval] = useState<string>("month")
  const [intervalCount, setIntervalCount] = useState(1)
  const [featuresText, setFeaturesText] = useState("")
  const [autoCreateStripe, setAutoCreateStripe] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/products?all=true")
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const resetForm = () => {
    setName("")
    setDescription("")
    setType("recurring")
    setPrice(0)
    setInterval("month")
    setIntervalCount(1)
    setFeaturesText("")
    setAutoCreateStripe(true)
    setEditingProduct(null)
  }

  const openCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description ?? "")
    setType(product.type)
    setPrice(Number(product.price))
    setInterval(product.interval ?? "month")
    setIntervalCount(product.interval_count)
    setFeaturesText((product.features ?? []).join("\n"))
    setAutoCreateStripe(false)
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean)
    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name,
      description,
      type,
      price,
      interval: type === "recurring" ? interval : null,
      interval_count: type === "recurring" ? intervalCount : 1,
      features,
      auto_create_stripe: !editingProduct && autoCreateStripe,
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await fetchProducts()
      setFormOpen(false)
      resetForm()
    } catch {
      alert("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this product? It won't be available for new assignments.")) return
    setArchiving(id)
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      await fetchProducts()
    } catch {
      alert("Failed to archive product")
    } finally {
      setArchiving(null)
    }
  }

  const activeProducts = products.filter(p => p.is_active)
  const archivedProducts = products.filter(p => !p.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create reusable products to assign to clients as billing items.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1 size-4" /> New Product
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : activeProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No products yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first product to start assigning billing items to clients.
            </p>
            <Button onClick={openCreate} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-1 size-4" /> Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeProducts.map((product) => (
            <Card key={product.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${product.type === "one_time" ? "bg-accent/10" : "bg-success/10"}`}>
                      {product.type === "one_time" ? (
                        <DollarSign className="size-4 text-accent" />
                      ) : (
                        <Repeat className="size-4 text-success" />
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {product.type === "one_time" ? "One-time" : "Recurring"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xl font-semibold text-foreground">
                  {formatPrice(product.price, product.type, product.interval, product.interval_count)}
                </p>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                {product.features.length > 0 && (
                  <p className="text-xs text-muted-foreground">{product.features.length} features included</p>
                )}
                {product.stripe_price_id && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <Zap className="size-3" /> Stripe linked
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                    <Pencil className="mr-1 size-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={archiving === product.id}
                    onClick={() => handleArchive(product.id)}
                  >
                    <Archive className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {archivedProducts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Archived</h3>
          <div className="space-y-2">
            {archivedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border border-border p-3 opacity-60">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(product.price, product.type, product.interval, product.interval_count)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Archived</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={() => { setFormOpen(false); resetForm() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update this product template."
                : "Create a reusable product that you can assign to any client."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Monthly Hosting" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Web hosting with SSL and daily backups" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "one_time" | "recurring")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </div>
            </div>

            {type === "recurring" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Interval</Label>
                  <Select value={interval} onValueChange={setInterval}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interval Count</Label>
                  <Input
                    type="number"
                    min="1"
                    value={intervalCount}
                    onChange={(e) => setIntervalCount(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Usually 1. Set to 3 with monthly = every 3 months.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                rows={3}
                placeholder={"SSL certificate included\nDaily automated backups\n99.9% uptime SLA"}
              />
            </div>

            {!editingProduct && (
              <>
                <Separator />
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50">
                  <input
                    type="checkbox"
                    checked={autoCreateStripe}
                    onChange={(e) => setAutoCreateStripe(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Create Stripe product & price
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Automatically creates this product in your Stripe account for billing.
                    </p>
                  </div>
                </label>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
