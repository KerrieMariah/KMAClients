import { verifyAdmin } from "@/lib/admin-auth"
import { getAllClients, getClientById } from "@/lib/admin-queries"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type === "clients") {
    const clients = await getAllClients()
    return NextResponse.json(clients)
  }

  if (type === "client") {
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const client = await getClientById(id)
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(client)
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
