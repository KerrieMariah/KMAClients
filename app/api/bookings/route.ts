import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { dbErrorResponse } from "@/lib/api-errors"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { date, time, callType, notes } = body

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      date,
      time,
      call_type: callType,
      notes: notes || null,
      status: "confirmed",
    })
    .select()
    .single()

  if (error) {
    return dbErrorResponse(error, 500, "Could not create booking. Please try again.")
  }

  return NextResponse.json({ booking: data })
}
