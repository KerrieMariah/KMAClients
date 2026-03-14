import { verifyAdmin } from "@/lib/admin-auth"
import { stripe } from "@/lib/stripe"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const subscriptionSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  plan: z.string().min(1, "Plan name is required"),
  price: z.number().positive("Price must be positive"),
  billing_cycle: z.enum(["monthly", "quarterly", "yearly"]).optional().default("monthly"),
  status: z.enum(["active", "cancelled", "past_due", "paid", "pending"]).optional().default("active"),
  next_billing: z.string().nullable().optional().default(null),
  start_date: z.string().nullable().optional().default(null),
  features: z.array(z.string()).optional().default([]),
  stripe_price_id: z.string().nullable().optional().default(null),
  auto_create_stripe: z.boolean().optional().default(false),
  type: z.enum(["one_time", "recurring"]).optional().default("recurring"),
  name: z.string().optional(),
  product_id: z.string().uuid().nullable().optional().default(null),
  end_date: z.string().nullable().optional().default(null),
})

async function createStripeProductAndPrice(
  plan: string,
  type: "one_time" | "recurring",
  priceAmount: number,
  billingCycle: string,
  features: string[]
) {
  const product = await stripe.products.create({
    name: plan,
    description: `${plan} plan`,
    metadata: { features: features.join(", ") },
  })

  const priceParams: Record<string, unknown> = {
    product: product.id,
    unit_amount: Math.round(priceAmount * 100),
    currency: "usd",
  }

  if (type === "recurring") {
    const interval = billingCycle === "yearly" ? "year" : "month"
    const intervalCount = billingCycle === "quarterly" ? 3 : 1
    priceParams.recurring = { interval, interval_count: intervalCount }
  }

  const price = await stripe.prices.create(priceParams as Parameters<typeof stripe.prices.create>[0])
  return price.id
}

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = subscriptionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { auto_create_stripe, ...insertData } = parsed.data
  let stripePriceId = insertData.stripe_price_id ?? null

  if (auto_create_stripe && !stripePriceId) {
    try {
      stripePriceId = await createStripeProductAndPrice(
        insertData.plan,
        insertData.type ?? "recurring",
        insertData.price,
        insertData.billing_cycle ?? "monthly",
        insertData.features ?? []
      )
    } catch (err) {
      console.error("Failed to create Stripe product:", err)
      return NextResponse.json({ error: "Failed to create Stripe product" }, { status: 500 })
    }
  }

  const row: Record<string, unknown> = {
    user_id: insertData.user_id,
    plan: insertData.plan,
    name: insertData.name || insertData.plan,
    price: insertData.price,
    billing_cycle: insertData.billing_cycle,
    status: insertData.status,
    next_billing: insertData.next_billing,
    start_date: insertData.start_date,
    features: insertData.features,
    stripe_price_id: stripePriceId,
    type: insertData.type,
    product_id: insertData.product_id,
    end_date: insertData.end_date,
  }

  const { data, error: dbError } = await supabase!
    .from("billing_items")
    .insert(row)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_FIELDS = [
  "plan", "name", "type", "price", "billing_cycle", "status", "next_billing",
  "start_date", "end_date", "features", "stripe_price_id",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id, auto_create_stripe } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  if (auto_create_stripe && !updates.stripe_price_id && body.plan && body.price) {
    try {
      const stripePriceId = await createStripeProductAndPrice(
        body.plan,
        body.type ?? "recurring",
        body.price,
        body.billing_cycle ?? "monthly",
        body.features ?? []
      )
      updates.stripe_price_id = stripePriceId
    } catch (err) {
      console.error("Failed to create Stripe product:", err)
      return NextResponse.json({ error: "Failed to create Stripe product" }, { status: 500 })
    }
  }

  const { data, error: dbError } = await supabase!.from("billing_items").update(updates).eq("id", id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const { error: dbError } = await supabase!.from("billing_items").delete().eq("id", id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
