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

  // Admin can view any site; clients can only view their own
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  const query = supabase.from("websites").select("ga_property_id, user_id").eq("id", websiteId)
  if (!profile?.is_admin) {
    query.eq("user_id", user.id)
  }

  const { data: website } = await query.single()
  if (!website?.ga_property_id) {
    return NextResponse.json({ error: "GA not configured for this site" }, { status: 404 })
  }

  const gaProperty = String(website.ga_property_id)

  try {
    const auth = getGoogleAuth()
    const analyticsData = google.analyticsdata({ version: "v1beta", auth })

    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const sixtyDaysAgo = new Date(today)
    sixtyDaysAgo.setDate(today.getDate() - 60)

    const fmt = (d: Date) => d.toISOString().split("T")[0]

    // Current period
    const [currentReport, prevReport, pagesReport, channelsReport] = await Promise.all([
      analyticsData.properties.runReport({
        property: gaProperty,
        requestBody: {
          dateRanges: [{ startDate: fmt(thirtyDaysAgo), endDate: fmt(today) }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
        },
      }),
      // Previous period for comparison
      analyticsData.properties.runReport({
        property: gaProperty,
        requestBody: {
          dateRanges: [{ startDate: fmt(sixtyDaysAgo), endDate: fmt(thirtyDaysAgo) }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
          ],
        },
      }),
      // Top pages
      analyticsData.properties.runReport({
        property: gaProperty,
        requestBody: {
          dateRanges: [{ startDate: fmt(thirtyDaysAgo), endDate: fmt(today) }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
          limit: "5",
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        },
      }),
      // Traffic channels
      analyticsData.properties.runReport({
        property: gaProperty,
        requestBody: {
          dateRanges: [{ startDate: fmt(thirtyDaysAgo), endDate: fmt(today) }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          limit: "6",
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        },
      }),
    ])

    const currentRow = currentReport.data.rows?.[0]?.metricValues ?? []
    const prevRow = prevReport.data.rows?.[0]?.metricValues ?? []

    const sessions = Number(currentRow[0]?.value ?? 0)
    const users = Number(currentRow[1]?.value ?? 0)
    const pageviews = Number(currentRow[2]?.value ?? 0)
    const bounceRate = Number(currentRow[3]?.value ?? 0)
    const avgDuration = Number(currentRow[4]?.value ?? 0)

    const prevSessions = Number(prevRow[0]?.value ?? 0)
    const prevUsers = Number(prevRow[1]?.value ?? 0)
    const prevPageviews = Number(prevRow[2]?.value ?? 0)

    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    const topPages = (pagesReport.data.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      views: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
    }))

    const totalChannelSessions = (channelsReport.data.rows ?? []).reduce(
      (sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0), 0
    )
    const channels = (channelsReport.data.rows ?? []).map((row) => {
      const channelSessions = Number(row.metricValues?.[0]?.value ?? 0)
      return {
        channel: row.dimensionValues?.[0]?.value ?? "",
        sessions: channelSessions,
        percentage: totalChannelSessions > 0 ? Math.round((channelSessions / totalChannelSessions) * 100) : 0,
      }
    })

    return NextResponse.json({
      sessions,
      sessionsChange: pctChange(sessions, prevSessions),
      users,
      usersChange: pctChange(users, prevUsers),
      pageviews,
      pageviewsChange: pctChange(pageviews, prevPageviews),
      bounceRate: Math.round(bounceRate * 100),
      avgDuration: Math.round(avgDuration),
      topPages,
      channels,
    })
  } catch (err) {
    console.error("GA API error:", err)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
