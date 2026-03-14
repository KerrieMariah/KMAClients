import { verifyAdmin } from "@/lib/admin-auth"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const billingItemSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  product_id: z.string().uuid().nullable().optional().default(null),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["one_time", "recurring"]),
  price: z.number().positive("Price must be positive"),
  interval: z.enum(["month", "quarter", "year"]).nullable().optional().default(null),
  interval_count: z.number().int().min(1).optional().default(1),
  status: z.enum(["active", "cancelled", "past_due", "paid", "pending"]).optional().default("pending"),
  start_date: z.string().nullable().optional().default(null),
  end_date: z.string().nullable().optional().default(null),
  next_billing: z.string().nullable().optional().default(null),
  features: z.array(z.string()).optional().default([]),
  stripe_price_id: z.string().nullable().optional().default(null),
  auto_create_stripe: z.boolean().optional().default(false),
})

async function createStripeProductAndPrice(
  name: string,
  type: "one_time" | "recurring",
  priceAmount: number,
  interval: string | null,
  intervalCount: number,
) {
  const product = await stripe.products.create({
    name,
    description: `${name}`,
  })

  const priceParams: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: Math.round(priceAmount * 100),
    currency: "usd",
  }

  if (type === "recurring" && interval) {
    const stripeInterval = interval === "quarter" ? "month" : interval
    const stripeIntervalCount = interval === "quarter" ? 3 : intervalCount
    priceParams.recurring = {
      interval: stripeInterval as Stripe.PriceCreateParams.Recurring["interval"],
      interval_count: stripeIntervalCount,
    }
  }

  const price = await stripe.prices.create(priceParams)
  return price.id
}

export async function GET(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  let query = supabase!.from("billing_items").select("*, products(name, type, price, interval, interval_count)").order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()

  // If product_id is provided, fetch product to inherit defaults
  if (body.product_id && !body.name) {
    const { data: product } = await supabase!
      .from("products")
      .select("*")
      .eq("id", body.product_id)
      .single()

    if (product) {
      body.name = body.name || product.name
      body.type = body.type || product.type
      body.price = body.price ?? product.price
      body.interval = body.interval || product.interval
      body.interval_count = body.interval_count ?? product.interval_count
      body.features = body.features?.length ? body.features : product.features
      body.stripe_price_id = body.stripe_price_id || product.stripe_price_id
    }
  }

  const parsed = billingItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { auto_create_stripe, interval_count, ...insertData } = parsed.data
  let stripePriceId = insertData.stripe_price_id ?? null

  if (auto_create_stripe && !stripePriceId) {
    try {
      stripePriceId = await createStripeProductAndPrice(
        insertData.name,
        insertData.type,
        insertData.price,
        insertData.interval,
        interval_count,
      )
    } catch (err) {
      console.error("Failed to create Stripe product:", err)
      return NextResponse.json({ error: "Failed to create Stripe product" }, { status: 500 })
    }
  }

  const dbRow: Record<string, unknown> = {
    ...insertData,
    stripe_price_id: stripePriceId,
    billing_cycle: insertData.interval === "year" ? "yearly" : insertData.interval === "quarter" ? "quarterly" : "monthly",
    plan: insertData.name,
  }

  const { data, error: dbError } = await supabase!
    .from("billing_items")
    .insert(dbRow)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_BILLING_FIELDS = [
  "name", "plan", "type", "price", "status", "start_date", "end_date",
  "next_billing", "features", "stripe_price_id", "billing_cycle",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_BILLING_FIELDS) {
    if (field in body) updates[field] = body[field]
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
