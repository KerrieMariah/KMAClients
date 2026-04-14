"use client"

import { useState, useEffect } from "react"
import { Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  type: "one_time" | "recurring"
  price: number
  interval: string | null
  interval_count: number
  features: string[]
  stripe_price_id: string | null
}

interface BillingItemFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  billingItem?: {
    id: string
    plan: string
    name: string
    type: string
    price: number
    billing_cycle: string
    status: string
    next_billing: string | null
    start_date: string | null
    end_date: string | null
    features: string[]
    stripe_price_id?: string | null
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    product_id?: string | null
  } | null
}

export function BillingItemForm({ open, onClose, onSuccess, clientId, billingItem }: BillingItemFormProps) {
  const isEditing = !!billingItem
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [selectedProductId, setSelectedProductId] = useState<string>(billingItem?.product_id ?? "custom")
  const [name, setName] = useState(billingItem?.name ?? billingItem?.plan ?? "")
  const [type, setType] = useState<"one_time" | "recurring">((billingItem?.type as "one_time" | "recurring") ?? "recurring")
  const [price, setPrice] = useState(billingItem?.price ?? 0)
  const [interval, setInterval] = useState<string>(
    billingItem?.billing_cycle === "yearly" ? "year" :
    billingItem?.billing_cycle === "quarterly" ? "quarter" : "month"
  )
  const [status, setStatus] = useState(billingItem?.status ?? "pending")
  const [startDate, setStartDate] = useState(billingItem?.start_date ?? "")
  const [endDate, setEndDate] = useState(billingItem?.end_date ?? "")
  const [nextBilling, setNextBilling] = useState(billingItem?.next_billing ?? "")
  const [featuresText, setFeaturesText] = useState((billingItem?.features ?? []).join("\n"))
  const [stripePriceId, setStripePriceId] = useState(billingItem?.stripe_price_id ?? "")
  const [autoCreateStripe, setAutoCreateStripe] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true)
      try {
        const res = await fetch("/api/admin/products")
        if (res.ok) setProducts(await res.json())
      } catch { /* ignore */ }
      setLoadingProducts(false)
    }
    if (open) fetchProducts()
  }, [open])

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    if (productId === "custom") return

    const product = products.find(p => p.id === productId)
    if (!product) return

    setName(product.name)
    setType(product.type)
    setPrice(Number(product.price))
    setInterval(product.interval ?? "month")
    setFeaturesText((product.features ?? []).join("\n"))
    if (product.stripe_price_id) {
      setStripePriceId(product.stripe_price_id)
      setAutoCreateStripe(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean)
    const billingCycle = interval === "year" ? "yearly" : interval === "quarter" ? "quarterly" : "monthly"

    const payload = {
      ...(isEditing ? { id: billingItem!.id } : { user_id: clientId }),
      plan: name,
      name,
      type,
      price,
      billing_cycle: billingCycle,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      next_billing: nextBilling || null,
      features,
      stripe_price_id: stripePriceId || null,
      auto_create_stripe: autoCreateStripe && !stripePriceId,
      product_id: selectedProductId !== "custom" ? selectedProductId : null,
    }

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      const data = await res.json()

      if (data.stripe_price_id && !stripePriceId) {
        setStripePriceId(data.stripe_price_id)
      }

      onSuccess()
      onClose()
    } catch {
      alert("Failed to save billing item")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Billing Item" : "Add Billing Item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this billing item."
              : "Pick from a product or create a custom billing item for this client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Product Picker */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Product Template</Label>
              {loadingProducts ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin" /> Loading products...
                </div>
              ) : (
                <Select value={selectedProductId} onValueChange={handleProductSelect}>
                  <SelectTrigger><SelectValue placeholder="Pick a product or custom..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (enter details manually)</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} -- ${Number(p.price).toFixed(2)} {p.type === "one_time" ? "(one-time)" : `/${p.interval === "year" ? "yr" : p.interval === "quarter" ? "qtr" : "mo"}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Separator />

          {/* Item details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Monthly Hosting" />
            </div>
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
            {type === "recurring" && (
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
            )}
            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                {type === "one_time" && (
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                )}
                {type === "recurring" && (
                  <div className="space-y-2">
                    <Label>Next Billing</Label>
                    <Input type="date" value={nextBilling} onChange={(e) => setNextBilling(e.target.value)} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={3} placeholder={"Custom website design\n24/7 priority support"} />
          </div>

          <Separator />

          {/* Stripe section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Stripe Billing</h3>
            </div>

            <div className="space-y-2">
              <Label>Stripe Price ID (optional)</Label>
              <Input
                value={stripePriceId}
                onChange={(e) => {
                  setStripePriceId(e.target.value)
                  if (e.target.value) setAutoCreateStripe(false)
                }}
                placeholder="price_1234abcd..."
              />
              <p className="text-xs text-muted-foreground">
                Paste an existing Stripe Price ID, or leave empty and auto-create below.
              </p>
            </div>

            {!stripePriceId && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={autoCreateStripe}
                  onChange={(e) => setAutoCreateStripe(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Auto-create Stripe product & price
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creates "{name || "Item"}" in Stripe at ${price || 0}{type === "recurring" ? `/${interval === "year" ? "year" : interval === "quarter" ? "quarter" : "month"}` : " one-time"}
                  </p>
                </div>
              </label>
            )}

            {billingItem?.stripe_subscription_id && (
              <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                Client has an active Stripe subscription for this item.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
