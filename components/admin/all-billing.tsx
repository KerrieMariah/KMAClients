"use client"

import { useState, useEffect } from "react"
import { Loader2, CreditCard, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BillingRow {
  id: string
  name: string
  plan: string
  type: string
  price: number
  billing_cycle: string
  status: string
  stripe_price_id: string | null
  stripe_subscription_id: string | null
  user_id: string
  profiles: { full_name: string; company: string } | null
}

const statusStyle = (s: string) => {
  if (s === "active" || s === "paid") return "bg-success/10 text-success border-success/20"
  if (s === "cancelled") return "bg-destructive/10 text-destructive border-destructive/20"
  if (s === "past_due") return "bg-warning/10 text-warning-foreground border-warning/20"
  if (s === "pending") return "bg-secondary text-secondary-foreground"
  return ""
}

function formatPrice(price: number, type: string, cycle: string) {
  const amount = `$${Number(price).toFixed(2)}`
  if (type === "one_time") return `${amount} one-time`
  return `${amount}/${cycle || "monthly"}`
}

export function AllBilling({ onSelectClient }: { onSelectClient?: (id: string) => void }) {
  const [items, setItems] = useState<BillingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch("/api/admin/data?type=billing")
      if (res.ok) setItems(await res.json())
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalActive = items.filter(i => i.status === "active" || i.status === "paid").length
  const totalRevenue = items
    .filter(i => i.status === "active" || i.status === "paid")
    .reduce((sum, i) => sum + Number(i.price), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">All Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} items · {totalActive} active · ${totalRevenue.toFixed(2)} active revenue
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No billing items yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onSelectClient?.(item.user_id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{item.name || item.plan}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {item.type === "one_time" ? "One-time" : "Recurring"}
                    </Badge>
                    <Badge variant="outline" className={statusStyle(item.status)}>{item.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.profiles?.full_name ?? "Unknown client"}
                    {item.profiles?.company ? ` · ${item.profiles.company}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(item.price, item.type, item.billing_cycle)}
                  </p>
                  {item.stripe_price_id && (
                    <div className="flex items-center justify-end gap-1 text-[11px] text-accent mt-0.5">
                      <Zap className="size-3" />
                      {item.stripe_subscription_id ? "Stripe active" : "Stripe linked"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
