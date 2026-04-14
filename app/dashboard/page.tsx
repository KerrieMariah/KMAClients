import { redirect } from "next/navigation"
import {
  getCurrentUser,
  getProjects,
  getWebsites,
  getSubscription,
  getBillingItems,
  getDocuments,
  getStripeInvoices,
} from "@/lib/queries"
import { ClientPortal } from "@/components/client-portal"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [projects, websites, subscription, billingItems, documents, stripeInvoices] =
    await Promise.all([
      getProjects(),
      getWebsites(),
      getSubscription(),
      getBillingItems(),
      getDocuments(),
      getStripeInvoices(),
    ])

  const data = {
    currentUser: user,
    projects,
    websites,
    subscription: subscription ?? null,
    billingItems,
    documents,
    stripeInvoices,
  }

  return <ClientPortal data={data} />
}
