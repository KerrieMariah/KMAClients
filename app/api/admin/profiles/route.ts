import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse, type NextRequest } from "next/server"

const ALLOWED_FIELDS = ["full_name", "company", "avatar_url"] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error: dbError } = await supabase!.from("profiles").update(updates).eq("id", id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}
