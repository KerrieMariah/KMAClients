import { verifyAdmin } from "@/lib/admin-auth"
import {
  getAllClients,
  getClientById,
  getAllProjects,
  getAllWebsites,
  getAllBillingItems,
  getAllDocuments,
} from "@/lib/admin-queries"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type === "clients") {
    return NextResponse.json(await getAllClients())
  }

  if (type === "client") {
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const client = await getClientById(id)
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(client)
  }

  if (type === "projects") {
    return NextResponse.json(await getAllProjects())
  }

  if (type === "websites") {
    return NextResponse.json(await getAllWebsites())
  }

  if (type === "billing") {
    return NextResponse.json(await getAllBillingItems())
  }

  if (type === "documents") {
    return NextResponse.json(await getAllDocuments())
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
