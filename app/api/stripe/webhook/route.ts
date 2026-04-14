import { NextResponse, type NextRequest } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient as createServiceClient } from "@supabase/supabase-js"

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const billingItemId = session.metadata?.billing_item_id ?? session.metadata?.subscription_id
      const stripeCustomerId = session.customer as string
      const supabaseUserId = session.metadata?.supabase_user_id

      // Ensure the profile always has the Stripe customer ID
      if (supabaseUserId && stripeCustomerId) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", supabaseUserId)
      }

      if (session.mode === "subscription") {
        const stripeSubscriptionId = session.subscription as string
        if (billingItemId && stripeSubscriptionId) {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
          const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000)

          await supabase
            .from("billing_items")
            .update({
              stripe_subscription_id: stripeSubscriptionId,
              stripe_customer_id: stripeCustomerId,
              status: "active",
              next_billing: currentPeriodEnd.toISOString().split("T")[0],
            })
            .eq("id", billingItemId)
        }
      } else if (session.mode === "payment") {
        if (billingItemId) {
          await supabase
            .from("billing_items")
            .update({
              stripe_customer_id: stripeCustomerId,
              status: "paid",
            })
            .eq("id", billingItemId)
        }
      }
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.cancel_at_period_end
        ? "cancelled"
        : sub.status === "active"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : "cancelled"

      const currentPeriodEnd = new Date(sub.current_period_end * 1000)

      await supabase
        .from("billing_items")
        .update({
          status,
          next_billing: currentPeriodEnd.toISOString().split("T")[0],
        })
        .eq("stripe_subscription_id", sub.id)
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from("billing_items")
        .update({ status: "cancelled", stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id)
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000)

        await supabase
          .from("billing_items")
          .update({
            status: "active",
            next_billing: currentPeriodEnd.toISOString().split("T")[0],
          })
          .eq("stripe_subscription_id", invoice.subscription as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
