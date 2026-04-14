import { verifyAdmin } from "@/lib/admin-auth"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  full_name: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
})

function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { email, full_name, company, password } = parsed.data

  const finalPassword = password?.trim()
    ? password.trim()
    : `Temp${Math.random().toString(36).substring(2, 10)}!${Date.now().toString(36)}`

  // Use the service role admin client so the admin's session is never touched
  const adminClient = createServiceRoleClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: finalPassword,
    email_confirm: true,
    user_metadata: {
      full_name: full_name ?? "",
      company: company ?? "",
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (authData.user) {
    // Create a Stripe customer for this user
    let stripeCustomerId: string | null = null
    try {
      const customer = await stripe.customers.create({
        email,
        name: full_name ?? undefined,
        metadata: { supabase_user_id: authData.user.id },
      })
      stripeCustomerId = customer.id
    } catch (stripeErr) {
      console.error("Failed to create Stripe customer:", stripeErr)
    }

    // Update the profile row created by the DB trigger
    await adminClient
      .from("profiles")
      .update({
        full_name: full_name ?? null,
        company: company ?? null,
        ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      })
      .eq("id", authData.user.id)
  }

  return NextResponse.json({
    success: true,
    userId: authData.user?.id,
    message: `Client account created for ${email}.`,
    tempPassword: finalPassword,
  })
}
