import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  const customerId = profile?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json([])
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
    })

    const mapped = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountDue: inv.amount_due / 100,
      amountPaid: inv.amount_paid / 100,
      currency: inv.currency,
      created: new Date(inv.created * 1000).toISOString(),
      dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
      description: inv.description ?? inv.lines.data[0]?.description ?? null,
    }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error("Failed to fetch Stripe invoices:", err)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
