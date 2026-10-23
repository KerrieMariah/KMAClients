import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeRedirectPath(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  const errorUrl = new URL("/auth/login", request.url)
  return NextResponse.redirect(errorUrl)
}

// Only allow same-site relative paths; "//host" and "/\host" are treated as
// external URLs by browsers.
function safeRedirectPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/dashboard"
  }
  return next
}
