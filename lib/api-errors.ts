import { NextResponse } from "next/server"

const POSTGRES_MESSAGES: Record<string, string> = {
  "23505": "A record with these details already exists.",
  "23503": "A related record could not be found.",
  "23502": "A required field is missing.",
  "23514": "One of the values provided is not allowed.",
  "22P02": "One of the values provided is in the wrong format.",
}

/**
 * Logs the underlying error server-side and returns a generic message so
 * database/storage internals are never exposed to the browser.
 */
export function dbErrorResponse(
  err: unknown,
  status = 400,
  fallback = "Something went wrong. Please try again."
) {
  console.error("API error:", err)
  const code = (err as { code?: string } | null)?.code
  const message = (code && POSTGRES_MESSAGES[code]) || fallback
  return NextResponse.json({ error: message }, { status })
}
