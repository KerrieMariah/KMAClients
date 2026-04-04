"use client"

import { useState, useCallback } from "react"
import { Check, CreditCard, Calendar, AlertTriangle, Package, ExternalLink, Loader2, Repeat, DollarSign, Receipt, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import {
  createCheckoutSession,
  createPortalSession,
  cancelBillingItem,
  reactivateBillingItem,
} from "@/app/actions/stripe"
import type { BillingItem, Document } from "@/lib/mock-data"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

function formatInterval(item: BillingItem) {
  if (item.type === "one_time") return "one-time"
  if (item.interval === "year") return "/year"
  if (item.interval === "quarter") return "/quarter"
  return "/month"
}

function StatusBadge({ status }: { status: BillingItem["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    paid: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    past_due: "bg-warning/10 text-warning-foreground border-warning/20",
    pending: "bg-secondary text-secondary-foreground border-border",
  }
  return (
    <Badge variant="secondary" className={styles[status] ?? ""}>
      {status === "past_due" ? "Past due" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function BillingItemCard({
  item,
  onCheckout,
}: {
  item: BillingItem
  onCheckout: (id: string) => void
}) {
  const [cancelLoading, setCancelLoading] = useState(false)
  const [reactivateLoading, setReactivateLoading] = useState(false)
  const [localStatus, setLocalStatus] = useState(item.status)

  const hasStripe = !!item.stripeSubscriptionId
  const needsPayment = !!item.stripePriceId && !hasStripe && localStatus !== "cancelled" && localStatus !== "paid"
  const isRecurring = item.type === "recurring"

  const handleCancel = async () => {
    if (!hasStripe) return
    setCancelLoading(true)
    try {
      await cancelBillingItem(item.id)
      setLocalStatus("cancelled")
    } catch (err) {
      console.error("Failed to cancel:", err)
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!hasStripe) return
    setReactivateLoading(true)
    try {
      await reactivateBillingItem(item.id)
      setLocalStatus("active")
    } catch (err) {
      console.error("Failed to reactivate:", err)
    } finally {
      setReactivateLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex size-9 items-center justify-center rounded-lg shrink-0 ${isRecurring ? "bg-accent/10" : "bg-success/10"}`}>
              {isRecurring ? <Repeat className="size-4 text-accent" /> : <DollarSign className="size-4 text-success" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {isRecurring ? "Recurring" : "One-time"}
              </p>
            </div>
          </div>
          <StatusBadge status={localStatus} />
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-serif text-2xl font-semibold text-foreground">${item.price}</span>
          <span className="text-sm text-muted-foreground">{formatInterval(item)}</span>
        </div>

        {item.features.length > 0 && (
          <>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              {item.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <Check className="size-2.5 text-success" />
                  </div>
                  <span className="text-xs text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          {item.nextBilling && isRecurring && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              Next billing: {new Date(item.nextBilling).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
          {item.endDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              Ends: {new Date(item.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>

        {/* Actions */}
        {needsPayment && (
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => onCheckout(item.id)}
          >
            <CreditCard className="mr-2 size-4" />
            Set up payment
          </Button>
        )}

        {localStatus !== "cancelled" && hasStripe && isRecurring && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="size-5 text-destructive" />
                  Cancel {item.name}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                  This will cancel at the end of the current billing period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground">Keep active</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} disabled={cancelLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {cancelLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Cancelling...</> : "Yes, cancel"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {localStatus === "cancelled" && hasStripe && isRecurring && (
          <Button
            onClick={handleReactivate}
            disabled={reactivateLoading}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {reactivateLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Reactivating...</> : "Reactivate"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function SubscriptionView({
  billingItems,
  invoices = [],
  onNavigate,
}: {
  billingItems: BillingItem[]
  invoices?: Document[]
  onNavigate?: (section: string) => void
}) {
  const [checkoutItemId, setCheckoutItemId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const hasAnyStripeCustomer = billingItems.some(i => i.stripeCustomerId)

  const fetchClientSecret = useCallback(() => {
    if (!checkoutItemId) throw new Error("No item selected")
    return createCheckoutSession(checkoutItemId)
  }, [checkoutItemId])

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch (err) {
      console.error("Failed to open portal:", err)
    } finally {
      setPortalLoading(false)
    }
  }

  const recurringItems = billingItems.filter(i => i.type === "recurring")
  const oneTimeItems = billingItems.filter(i => i.type === "one_time")

  if (billingItems.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
            Billing
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Manage your plans, payments, and billing details.
          </p>
        </div>
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No billing items yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
              {"Your billing hasn't been set up yet. Contact us to get started with a plan that fits your needs."}
            </p>
            {onNavigate && (
              <Button
                className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => onNavigate("booking")}
              >
                Book a call to discuss plans
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
            Billing
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Manage your plans, payments, and billing details.
          </p>
        </div>
        {hasAnyStripeCustomer && (
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-secondary"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Opening...</>
            ) : (
              <><ExternalLink className="mr-2 size-4" />Manage billing</>
            )}
          </Button>
        )}
      </div>

      {/* Recurring subscriptions */}
      {recurringItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Subscriptions
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {recurringItems.map((item) => (
              <BillingItemCard
                key={item.id}
                item={item}
                onCheckout={(id) => setCheckoutItemId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* One-time charges */}
      {oneTimeItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            One-time Charges
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {oneTimeItems.map((item) => (
              <BillingItemCard
                key={item.id}
                item={item}
                onCheckout={(id) => setCheckoutItemId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Invoices
          </h2>
          <Card className="border-border bg-card shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary shrink-0">
                        <Receipt className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.uploadedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {inv.fileUrl && (
                      <a
                        href={inv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors shrink-0"
                      >
                        <Download className="size-3" />
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stripe Checkout modal */}
      <Dialog open={!!checkoutItemId} onOpenChange={() => setCheckoutItemId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Complete your payment</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {checkoutItemId && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
