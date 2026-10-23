import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client that bypasses RLS. Only use on the server, and only
 * after verifying the caller is allowed to perform the write.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
