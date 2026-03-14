import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

const ALLOWED_STATUSES = ["active", "cancelled", "past_due", "paid", "pending"] as const

export async function PATCH(request: Request) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const { user_id, status } = body

  if (!user_id || !status) {
    return NextResponse.json({ error: "user_id and status are required" }, { status: 400 })
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { error: dbError } = await supabase!
    .from("billing_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", user_id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
