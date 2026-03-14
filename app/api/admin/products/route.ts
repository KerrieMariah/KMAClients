import { verifyAdmin } from "@/lib/admin-auth"
import { stripe } from "@/lib/stripe"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().default(""),
  type: z.enum(["one_time", "recurring"]),
  price: z.number().positive("Price must be positive"),
  currency: z.string().optional().default("usd"),
  interval: z.enum(["month", "quarter", "year"]).nullable().optional().default(null),
  interval_count: z.number().int().min(1).optional().default(1),
  features: z.array(z.string()).optional().default([]),
  auto_create_stripe: z.boolean().optional().default(false),
})

async function createStripeProduct(
  name: string,
  description: string,
  type: "one_time" | "recurring",
  priceAmount: number,
  currency: string,
  interval: string | null,
  intervalCount: number,
) {
  const product = await stripe.products.create({
    name,
    description: description || `${name} product`,
  })

  const priceParams: Record<string, unknown> = {
    product: product.id,
    unit_amount: Math.round(priceAmount * 100),
    currency,
  }

  if (type === "recurring" && interval) {
    const stripeInterval = interval === "quarter" ? "month" : interval
    const stripeIntervalCount = interval === "quarter" ? 3 : intervalCount
    priceParams.recurring = {
      interval: stripeInterval,
      interval_count: stripeIntervalCount,
    }
  }

  const price = await stripe.prices.create(priceParams as Parameters<typeof stripe.prices.create>[0])

  return { stripeProductId: product.id, stripePriceId: price.id }
}

export async function GET(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const includeInactive = searchParams.get("all") === "true"

  let query = supabase!.from("products").select("*").order("created_at", { ascending: false })
  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { auto_create_stripe, ...productData } = parsed.data
  let stripeProductId: string | null = null
  let stripePriceId: string | null = null

  if (auto_create_stripe) {
    try {
      const result = await createStripeProduct(
        productData.name,
        productData.description ?? "",
        productData.type,
        productData.price,
        productData.currency ?? "usd",
        productData.interval,
        productData.interval_count ?? 1,
      )
      stripeProductId = result.stripeProductId
      stripePriceId = result.stripePriceId
    } catch (err) {
      console.error("Failed to create Stripe product:", err)
      return NextResponse.json({ error: "Failed to create Stripe product" }, { status: 500 })
    }
  }

  const { data, error: dbError } = await supabase!
    .from("products")
    .insert({
      ...productData,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_PRODUCT_FIELDS = [
  "name", "description", "type", "price", "currency",
  "interval", "interval_count", "features", "is_active",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_PRODUCT_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error: dbError } = await supabase!.from("products").update(updates).eq("id", id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { data, error: dbError } = await supabase!
    .from("products")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}
