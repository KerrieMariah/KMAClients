import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import type { Project, ProjectStage, Website, Subscription, Document, TimeSlot, BillingItem, StripeInvoice } from "@/lib/mock-data"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, company, avatar_url, is_admin, emergency_phone")
    .eq("id", user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.full_name ?? user.email?.split("@")[0] ?? "User",
    company: profile?.company ?? "",
    avatar:
      profile?.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() ?? "U",
    isAdmin: profile?.is_admin === true,
    emergencyPhone: profile?.emergency_phone ?? null,
  }
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    status: p.status as Project["status"],
    stage: (p.stage ?? "draft") as ProjectStage,
    startDate: p.start_date ?? "",
    estimatedEnd: p.estimated_end ?? "",
    technologies: p.technologies ?? [],
    image: p.image_url ?? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop",
    goals: p.goals ?? [],
    notionUrl: p.notion_url ?? "",
  }))
}

export async function getWebsites(): Promise<Website[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((w) => ({
    id: w.id,
    name: w.name,
    url: w.url,
    status: w.status as Website["status"],
    uptime: Number(w.uptime),
    lastChecked: w.last_checked ?? "Just now",
    responseTime: w.response_time ?? 200,
    visitors: {
      total: w.visitors_total ?? 0,
      change: Number(w.visitors_change ?? 0),
    },
    bounceRate: Number(w.bounce_rate ?? 0),
    topReferrers: (w.top_referrers as Website["topReferrers"]) ?? [],
    trafficByCountry: (w.traffic_by_country as Website["trafficByCountry"]) ?? [],
    gaPropertyId: w.ga_property_id ?? null,
    gscSiteUrl: w.gsc_site_url ?? null,
  }))
}

export async function getBillingItems(): Promise<BillingItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("billing_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((d) => ({
    id: d.id,
    name: d.name || d.plan,
    type: (d.type ?? "recurring") as BillingItem["type"],
    price: Number(d.price),
    interval: d.billing_cycle === "yearly" ? "year" as const : d.billing_cycle === "quarterly" ? "quarter" as const : "month" as const,
    intervalCount: 1,
    status: d.status as BillingItem["status"],
    startDate: d.start_date ?? "",
    endDate: d.end_date ?? null,
    nextBilling: d.next_billing ?? null,
    features: d.features ?? [],
    productId: d.product_id ?? null,
    stripeCustomerId: d.stripe_customer_id ?? null,
    stripeSubscriptionId: d.stripe_subscription_id ?? null,
    stripePriceId: d.stripe_price_id ?? null,
  }))
}

export async function getSubscription(): Promise<Subscription | null> {
  const items = await getBillingItems()
  const recurring = items.find(i => i.type === "recurring" && i.status !== "cancelled")
  if (!recurring) return items.length > 0 ? mapItemToSubscription(items[0]) : null
  return mapItemToSubscription(recurring)
}

function mapItemToSubscription(item: BillingItem): Subscription {
  return {
    id: item.id,
    plan: item.name,
    price: item.price,
    billingCycle: item.interval === "year" ? "yearly" : item.interval === "quarter" ? "quarterly" : "monthly",
    status: (item.status === "paid" || item.status === "pending") ? "active" : item.status as Subscription["status"],
    nextBilling: item.nextBilling ?? "",
    startDate: item.startDate,
    features: item.features,
    stripeCustomerId: item.stripeCustomerId,
    stripeSubscriptionId: item.stripeSubscriptionId,
    stripePriceId: item.stripePriceId,
  }
}

export async function getDocuments(): Promise<Document[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false })

  if (error || !data) return []

  return data.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type as Document["type"],
    size: d.size ?? "",
    uploadedAt: d.uploaded_at ?? "",
    projectId: d.project_id ?? "",
    fileUrl: d.file_url ?? null,
  }))
}

export async function getStripeInvoices(): Promise<StripeInvoice[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  const customerId = profile?.stripe_customer_id
  if (!customerId) return []

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
    })

    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountDue: inv.amount_due / 100,
      amountPaid: inv.amount_paid / 100,
      currency: inv.currency,
      created: new Date(inv.created * 1000).toISOString(),
      dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
      description: inv.description ?? inv.lines.data[0]?.description ?? null,
    }))
  } catch (err) {
    console.error("Failed to fetch Stripe invoices:", err)
    return []
  }
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .order("date", { ascending: true })

  if (error || !data) return []

  return data.map((s) => ({
    id: s.id,
    date: s.date,
    time: s.time,
    available: s.available,
  }))
}
