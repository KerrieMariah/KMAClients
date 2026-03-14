import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/queries"
import { isAdmin, getAllClients } from "@/lib/admin-queries"
import { AdminPortal } from "@/components/admin-portal"

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const adminCheck = await isAdmin()
  if (!adminCheck) redirect("/dashboard")

  const clients = await getAllClients()

  return (
    <AdminPortal
      initialClients={clients}
      currentUser={{
        name: user.name,
        email: user.email,
      }}
    />
  )
}
