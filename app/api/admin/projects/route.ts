import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const projectSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().default(""),
  status: z.enum(["active", "in-progress", "completed", "paused"]).optional().default("active"),
  progress: z.number().min(0).max(100).optional().default(0),
  start_date: z.string().nullable().optional().default(null),
  estimated_end: z.string().nullable().optional().default(null),
  technologies: z.array(z.string()).optional().default([]),
  image_url: z.string().nullable().optional().default(null),
  goals: z.array(z.string()).optional().default([]),
  notion_url: z.string().nullable().optional().default(null),
})

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { data, error: dbError } = await supabase!
    .from("projects")
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

const ALLOWED_PROJECT_FIELDS = [
  "name", "description", "status", "progress", "start_date",
  "estimated_end", "technologies", "image_url", "goals", "notion_url",
] as const

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_PROJECT_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error: dbError } = await supabase!
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error: dbError } = await supabase!.from("projects").delete().eq("id", id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
