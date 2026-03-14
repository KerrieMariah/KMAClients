"use client"

import { useState } from "react"
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

interface SubscriptionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  subscription?: {
    id: string
    plan: string
    price: number
    billing_cycle: string
    status: string
    next_billing: string | null
    start_date: string | null
    features: string[]
    stripe_price_id?: string | null
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
  } | null
}

export function SubscriptionForm({ open, onClose, onSuccess, clientId, subscription }: SubscriptionFormProps) {
  const isEditing = !!subscription
  const [saving, setSaving] = useState(false)

  const [plan, setPlan] = useState(subscription?.plan ?? "")
  const [price, setPrice] = useState(subscription?.price ?? 0)
  const [billingCycle, setBillingCycle] = useState(subscription?.billing_cycle ?? "monthly")
  const [status, setStatus] = useState(subscription?.status ?? "active")
  const [nextBilling, setNextBilling] = useState(subscription?.next_billing ?? "")
  const [startDate, setStartDate] = useState(subscription?.start_date ?? "")
  const [featuresText, setFeaturesText] = useState((subscription?.features ?? []).join("\n"))

  // Stripe fields
  const [stripePriceId, setStripePriceId] = useState(subscription?.stripe_price_id ?? "")
  const [autoCreateStripeProduct, setAutoCreateStripeProduct] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean)
    const payload = {
      ...(isEditing ? { id: subscription!.id } : { user_id: clientId }),
      plan,
      price,
      billing_cycle: billingCycle,
      status,
      next_billing: nextBilling || null,
      start_date: startDate || null,
      features,
      stripe_price_id: stripePriceId || null,
      auto_create_stripe: autoCreateStripeProduct && !stripePriceId,
    }

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      const data = await res.json()

      // If a Stripe price was auto-created, update the field
      if (data.stripe_price_id && !stripePriceId) {
        setStripePriceId(data.stripe_price_id)
      }

      onSuccess()
      onClose()
    } catch {
      alert("Failed to save subscription")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subscription" : "Create Subscription"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the plan details and Stripe billing configuration."
              : "Set up a plan for this client. Optionally auto-create a Stripe product for billing."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Plan details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={plan} onChange={(e) => setPlan(e.target.value)} required placeholder="Professional" />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Next Billing</Label>
              <Input type="date" value={nextBilling} onChange={(e) => setNextBilling(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} placeholder={"Custom website design\n24/7 priority support\nMonthly analytics reports"} />
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
                  if (e.target.value) setAutoCreateStripeProduct(false)
                }}
                placeholder="price_1234abcd..."
              />
              <p className="text-xs text-muted-foreground">
                Paste an existing Stripe Price ID, or leave empty and auto-create one below.
              </p>
            </div>

            {!stripePriceId && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50">
                <input
                  type="checkbox"
                  checked={autoCreateStripeProduct}
                  onChange={(e) => setAutoCreateStripeProduct(e.target.checked)}
                  className="size-4 rounded border-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Auto-create Stripe product & price
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creates a "{plan || "Plan"}" product in Stripe at ${price || 0}/{billingCycle === "yearly" ? "year" : billingCycle === "quarterly" ? "quarter" : "month"}
                  </p>
                </div>
              </label>
            )}

            {subscription?.stripe_subscription_id && (
              <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                Client has an active Stripe subscription.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !plan} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
