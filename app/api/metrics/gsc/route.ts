import { NextResponse, type NextRequest } from "next/server"
import { google } from "googleapis"
import { getGoogleAuth } from "@/lib/google-auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId")
  if (!websiteId) {
    return NextResponse.json({ error: "Missing websiteId" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  const query = supabase.from("websites").select("gsc_site_url, user_id").eq("id", websiteId)
  if (!profile?.is_admin) {
    query.eq("user_id", user.id)
  }

  const { data: website } = await query.single()
  if (!website?.gsc_site_url) {
    return NextResponse.json({ error: "GSC not configured for this site" }, { status: 404 })
  }

  try {
    const auth = getGoogleAuth()
    const searchConsole = google.searchconsole({ version: "v1", auth })

    const today = new Date()
    const twentyEightDaysAgo = new Date(today)
    twentyEightDaysAgo.setDate(today.getDate() - 28)
    const fiftySixDaysAgo = new Date(today)
    fiftySixDaysAgo.setDate(today.getDate() - 56)

    const fmt = (d: Date) => d.toISOString().split("T")[0]

    const [currentData, prevData] = await Promise.all([
      searchConsole.searchanalytics.query({
        siteUrl: website.gsc_site_url,
        requestBody: {
          startDate: fmt(twentyEightDaysAgo),
          endDate: fmt(today),
          dimensions: ["query"],
          rowLimit: 10,
        },
      }),
      searchConsole.searchanalytics.query({
        siteUrl: website.gsc_site_url,
        requestBody: {
          startDate: fmt(fiftySixDaysAgo),
          endDate: fmt(twentyEightDaysAgo),
          dimensions: ["query"],
          rowLimit: 1,
        },
      }),
    ])

    const queries = (currentData.data.rows ?? []).map((row) => ({
      query: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: Math.round((row.ctr ?? 0) * 1000) / 10,
      position: Math.round((row.position ?? 0) * 10) / 10,
    }))

    const totalClicks = queries.reduce((s, q) => s + q.clicks, 0)
    const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0)
    const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0
    const avgPosition = queries.length > 0
      ? Math.round((queries.reduce((s, q) => s + q.position, 0) / queries.length) * 10) / 10
      : 0

    const prevTotalClicks = (prevData.data.rows ?? []).reduce((s, r) => s + (r.clicks ?? 0), 0)
    const prevTotalImpressions = (prevData.data.rows ?? []).reduce((s, r) => s + (r.impressions ?? 0), 0)

    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    return NextResponse.json({
      totalClicks,
      clicksChange: pctChange(totalClicks, prevTotalClicks),
      totalImpressions,
      impressionsChange: pctChange(totalImpressions, prevTotalImpressions),
      avgCtr,
      avgPosition,
      queries,
    })
  } catch (err) {
    console.error("GSC API error:", err)
    return NextResponse.json({ error: "Failed to fetch search console data" }, { status: 500 })
  }
}
