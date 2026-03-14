import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const documentSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  project_id: z.string().uuid().nullable().optional().default(null),
  name: z.string().min(1, "Document name is required"),
  type: z.enum(["contract", "proposal", "invoice", "report", "design"]),
  size: z.string().nullable().optional().default(null),
  file_url: z.string().nullable().optional().default(null),
})

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = documentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { data, error: dbError } = await supabase!
    .from("documents")
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_DOCUMENT_FIELDS = [
  "name", "type", "size", "file_url", "project_id",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_DOCUMENT_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error: dbError } = await supabase!.from("documents").update(updates).eq("id", id).select().single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const { error: dbError } = await supabase!.from("documents").delete().eq("id", id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
