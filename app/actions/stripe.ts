"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(billingItemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: item } = await supabase
    .from("billing_items")
    .select("*")
    .eq("id", billingItemId)
    .single()

  if (!item || !item.stripe_price_id) throw new Error("No Stripe price configured for this item")

  let customerId = item.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from("billing_items")
      .update({ stripe_customer_id: customerId })
      .eq("id", billingItemId)
  }

  const isRecurring = item.type === "recurring"

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    customer: customerId,
    line_items: [{ price: item.stripe_price_id, quantity: 1 }],
    mode: isRecurring ? "subscription" : "payment",
    redirect_on_completion: "never",
    metadata: {
      supabase_user_id: user.id,
      billing_item_id: billingItemId,
    },
  })

  if (!session.client_secret) throw new Error("Failed to create checkout session")
  return session.client_secret
}

export async function createPortalSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: items } = await supabase
    .from("billing_items")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)

  const customerId = items?.[0]?.stripe_customer_id
  if (!customerId) throw new Error("No Stripe customer found")

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`,
  })

  return session.url
}

export async function cancelBillingItem(billingItemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: item } = await supabase
    .from("billing_items")
    .select("stripe_subscription_id")
    .eq("id", billingItemId)
    .eq("user_id", user.id)
    .single()

  if (!item?.stripe_subscription_id) throw new Error("No active Stripe subscription")

  await stripe.subscriptions.update(item.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  await supabase
    .from("billing_items")
    .update({ status: "cancelled" })
    .eq("id", billingItemId)

  return { success: true }
}

export async function reactivateBillingItem(billingItemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: item } = await supabase
    .from("billing_items")
    .select("stripe_subscription_id")
    .eq("id", billingItemId)
    .eq("user_id", user.id)
    .single()

  if (!item?.stripe_subscription_id) throw new Error("No Stripe subscription found")

  await stripe.subscriptions.update(item.stripe_subscription_id, {
    cancel_at_period_end: false,
  })

  await supabase
    .from("billing_items")
    .update({ status: "active" })
    .eq("id", billingItemId)

  return { success: true }
}
