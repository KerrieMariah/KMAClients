import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const websiteSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  project_id: z.string().uuid().nullable().optional().default(null),
  name: z.string().min(1, "Website name is required"),
  url: z.string().min(1, "URL is required"),
  status: z.enum(["online", "offline", "maintenance"]).optional().default("online"),
  uptime: z.number().optional().default(99.9),
  response_time: z.number().optional().default(200),
  visitors_total: z.number().optional().default(0),
  visitors_change: z.number().optional().default(0),
  bounce_rate: z.number().optional().default(0),
  top_referrers: z.array(z.any()).optional().default([]),
  traffic_by_country: z.array(z.any()).optional().default([]),
  ga_property_id: z.string().nullable().optional().default(null),
  gsc_site_url: z.string().nullable().optional().default(null),
})

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = websiteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { data, error: dbError } = await supabase!
    .from("websites")
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_WEBSITE_FIELDS = [
  "name", "url", "status", "uptime", "last_checked", "response_time",
  "visitors_total", "visitors_change", "bounce_rate", "top_referrers", "traffic_by_country",
  "ga_property_id", "gsc_site_url",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_WEBSITE_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error: dbError } = await supabase!.from("websites").update(updates).eq("id", id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const { error: dbError } = await supabase!.from("websites").delete().eq("id", id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
