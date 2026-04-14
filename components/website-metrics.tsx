"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
  MousePointerClick,
  Activity,
  Globe,
  Loader2,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Website } from "@/lib/mock-data"

export type GAData = {
  sessions: number
  sessionsChange: number
  users: number
  usersChange: number
  pageviews: number
  pageviewsChange: number
  bounceRate: number
  avgDuration: number
  topPages: { path: string; views: number; users: number }[]
  channels: { channel: string; sessions: number; percentage: number }[]
}

type GSCData = {
  totalClicks: number
  clicksChange: number
  totalImpressions: number
  impressionsChange: number
  avgCtr: number
  avgPosition: number
  queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">—</span>
  const isPositive = value > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
      <Icon className="size-3" />
      {isPositive ? "+" : ""}{value}%
    </span>
  )
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "k"
  return num.toString()
}

function MetricCard({ label, value, change, icon: Icon }: {
  label: string
  value: string
  change?: number
  icon: typeof Users
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">{value}</span>
        {change !== undefined && <ChangeIndicator value={change} />}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading metrics...</span>
    </div>
  )
}

function TrafficSection({ data }: { data: GAData }) {
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Sessions" value={formatNumber(data.sessions)} change={data.sessionsChange} icon={Activity} />
        <MetricCard label="Users" value={formatNumber(data.users)} change={data.usersChange} icon={Users} />
        <MetricCard label="Pageviews" value={formatNumber(data.pageviews)} change={data.pageviewsChange} icon={Eye} />
        <MetricCard label="Bounce Rate" value={`${data.bounceRate}%`} icon={ArrowUpRight} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.topPages.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Top Pages</h4>
            <div className="space-y-2">
              {data.topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-foreground">{page.path}</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">{formatNumber(page.views)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.channels.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Traffic Channels</h4>
            <div className="space-y-2.5">
              {data.channels.map((ch) => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{ch.channel}</span>
                    <span className="text-xs font-medium text-foreground tabular-nums">{ch.percentage}%</span>
                  </div>
                  <Progress value={ch.percentage} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SEOSection({ data }: { data: GSCData }) {
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Clicks" value={formatNumber(data.totalClicks)} change={data.clicksChange} icon={MousePointerClick} />
        <MetricCard label="Impressions" value={formatNumber(data.totalImpressions)} change={data.impressionsChange} icon={Eye} />
        <MetricCard label="Avg CTR" value={`${data.avgCtr}%`} icon={ArrowUpRight} />
        <MetricCard label="Avg Position" value={data.avgPosition.toString()} icon={BarChart3} />
      </div>

      {data.queries.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Top Search Queries</h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[1fr_70px_90px_60px_60px] gap-2 px-3 py-2 border-b border-border bg-secondary/50">
              <span className="text-xs font-medium text-muted-foreground">Query</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Clicks</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Impressions</span>
              <span className="text-xs font-medium text-muted-foreground text-right">CTR</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Pos.</span>
            </div>
            {data.queries.map((q) => (
              <div key={q.query} className="grid sm:grid-cols-[1fr_70px_90px_60px_60px] gap-2 px-3 py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground truncate">{q.query}</span>
                <span className="text-sm font-medium text-foreground tabular-nums sm:text-right">{q.clicks}</span>
                <span className="text-sm text-muted-foreground tabular-nums sm:text-right">{formatNumber(q.impressions)}</span>
                <span className="text-sm text-muted-foreground tabular-nums sm:text-right">{q.ctr}%</span>
                <span className="text-sm text-muted-foreground tabular-nums sm:text-right">{q.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function WebsiteMetrics({
  website,
  onGAData,
}: {
  website: Website
  onGAData?: (data: GAData) => void
}) {
  const hasGA = !!website.gaPropertyId
  const hasGSC = !!website.gscSiteUrl
  const hasAny = hasGA || hasGSC

  const [seoExpanded, setSeoExpanded] = useState(false)

  const [gaData, setGaData] = useState<GAData | null>(null)
  const [gscData, setGscData] = useState<GSCData | null>(null)

  const [gaLoading, setGaLoading] = useState(false)
  const [gscLoading, setGscLoading] = useState(false)

  const [gaError, setGaError] = useState(false)
  const [gscError, setGscError] = useState(false)

  const fetchGA = useCallback(async () => {
    if (gaData || !hasGA) return
    setGaLoading(true)
    setGaError(false)
    try {
      const res = await fetch(`/api/metrics/ga?websiteId=${website.id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setGaData(data)
      onGAData?.(data)
    } catch {
      setGaError(true)
    } finally {
      setGaLoading(false)
    }
  }, [website.id, hasGA, gaData, onGAData])

  const fetchGSC = useCallback(async () => {
    if (gscData || !hasGSC) return
    setGscLoading(true)
    setGscError(false)
    try {
      const res = await fetch(`/api/metrics/gsc?websiteId=${website.id}`)
      if (!res.ok) throw new Error()
      setGscData(await res.json())
    } catch {
      setGscError(true)
    } finally {
      setGscLoading(false)
    }
  }, [website.id, hasGSC, gscData])

  useEffect(() => {
    fetchGA()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSeoToggle = () => {
    if (!seoExpanded) fetchGSC()
    setSeoExpanded(!seoExpanded)
  }

  if (!hasAny) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
        <Globe className="size-4 mr-2" />
        Analytics not configured for this site.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-1">
      {hasGA && (
        gaLoading ? <LoadingSkeleton /> :
        gaError ? <p className="text-sm text-muted-foreground py-4 text-center">Failed to load analytics data.</p> :
        gaData ? <TrafficSection data={gaData} /> : null
      )}

      {hasGSC && (
        <Card className="border-border bg-card/50 shadow-none">
          <CardContent className="px-4 py-2">
            <button onClick={handleSeoToggle} className="flex w-full items-center gap-3 py-2 text-left">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Search className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">SEO Performance</p>
                <p className="text-xs text-muted-foreground">Search queries, clicks, impressions & rankings</p>
              </div>
              {seoExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>
            {seoExpanded && (
              gscLoading ? <LoadingSkeleton /> :
              gscError ? <p className="text-sm text-muted-foreground py-4 text-center">Failed to load SEO data.</p> :
              gscData ? <SEOSection data={gscData} /> : null
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
