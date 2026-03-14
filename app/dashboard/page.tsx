import { redirect } from "next/navigation"
import {
  getCurrentUser,
  getProjects,
  getWebsites,
  getSubscription,
  getBillingItems,
  getDocuments,
} from "@/lib/queries"
import { ClientPortal } from "@/components/client-portal"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [projects, websites, subscription, billingItems, documents] =
    await Promise.all([
      getProjects(),
      getWebsites(),
      getSubscription(),
      getBillingItems(),
      getDocuments(),
    ])

  const data = {
    currentUser: user,
    projects,
    websites,
    subscription: subscription ?? null,
    billingItems,
    documents,
  }

  return <ClientPortal data={data} />
}
