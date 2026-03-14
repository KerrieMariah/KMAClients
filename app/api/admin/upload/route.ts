import { verifyAdmin } from "@/lib/admin-auth"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return error

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const bucket = (formData.get("bucket") as string) ?? "project-images"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase!.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  if (bucket === "project-images") {
    const { data: urlData } = supabase!.storage.from(bucket).getPublicUrl(filePath)
    return NextResponse.json({ url: urlData.publicUrl })
  } else {
    const { data: urlData, error: signError } = await supabase!.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365)
    if (signError) return NextResponse.json({ error: signError.message }, { status: 400 })
    return NextResponse.json({ url: urlData.signedUrl })
  }
}
