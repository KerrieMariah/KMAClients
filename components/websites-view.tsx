"use client"

import { useState, useCallback, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Wrench,
  ExternalLink,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WebsiteMetrics, type GAData } from "@/components/website-metrics"
import type { Website } from "@/lib/mock-data"

const statusConfig = {
  online: {
    icon: CheckCircle2,
    label: "Online",
    dotClass: "bg-success",
    badgeClass: "bg-success/10 text-success border-success/20",
  },
  offline: {
    icon: XCircle,
    label: "Offline",
    dotClass: "bg-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    dotClass: "bg-warning",
    badgeClass: "bg-warning/10 text-warning-foreground border-warning/20",
  },
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "k"
  return num.toString()
}

export function WebsitesView({ websites }: { websites: Website[] }) {
  const [expandedSite, setExpandedSite] = useState<string | null>(null)
  const [siteGAData, setSiteGAData] = useState<Record<string, GAData>>({})
  const [gaLoading, setGaLoading] = useState(true)

  const onlineCount = websites.filter((w) => w.status === "online").length
  const sitesWithGA = websites.filter((w) => w.gaPropertyId)

  const totalUsers = Object.values(siteGAData).reduce((a, d) => a + d.users, 0)
  const totalSessions = Object.values(siteGAData).reduce((a, d) => a + d.sessions, 0)
  const avgBounce = Object.keys(siteGAData).length > 0
    ? (Object.values(siteGAData).reduce((a, d) => a + d.bounceRate, 0) / Object.keys(siteGAData).length).toFixed(1)
    : "—"

  const handleGAData = useCallback((siteId: string, data: GAData) => {
    setSiteGAData((prev) => ({ ...prev, [siteId]: data }))
  }, [])

  useEffect(() => {
    if (sitesWithGA.length === 0) {
      setGaLoading(false)
      return
    }
    let completed = 0
    sitesWithGA.forEach(async (site) => {
      try {
        const res = await fetch(`/api/metrics/ga?websiteId=${site.id}`)
        if (res.ok) {
          const data = await res.json()
          handleGAData(site.id, data)
        }
      } catch { /* silent */ } finally {
        completed++
        if (completed >= sitesWithGA.length) setGaLoading(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
          Website Status
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Real-time monitoring, traffic analytics, and visitor insights for all your sites.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-3 rounded-full bg-success" />
              <p className="text-sm text-muted-foreground">Sites Online</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {onlineCount}
              <span className="text-base font-normal text-muted-foreground">
                /{websites.length}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Users className="size-4 text-accent" />
              <p className="text-sm text-muted-foreground">Total Visitors</p>
            </div>
            {gaLoading ? (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-foreground tabular-nums">
                  {formatNumber(totalUsers)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Activity className="size-4 text-accent" />
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            {gaLoading ? (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-foreground tabular-nums">
                  {formatNumber(totalSessions)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Eye className="size-4 text-accent" />
              <p className="text-sm text-muted-foreground">Avg. Bounce Rate</p>
            </div>
            {gaLoading ? (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <p className="mt-2 text-3xl font-semibold text-foreground tabular-nums">
                {avgBounce}
                <span className="text-base font-normal text-muted-foreground">%</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {websites.map((site) => {
          const config = statusConfig[site.status]
          const StatusIcon = config.icon
          const isExpanded = expandedSite === site.id
          const ga = siteGAData[site.id]

          return (
            <Card key={site.id} className="border-border bg-card shadow-none hover:shadow-sm transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedSite(isExpanded ? null : site.id)}
                  className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
                        <StatusIcon className="size-5 text-foreground" />
                      </div>
                      <div className={`absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-card ${config.dotClass}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{site.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{site.url}</span>
                        <ExternalLink className="size-3 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {ga ? (
                      <>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">Visitors</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-foreground tabular-nums">{formatNumber(ga.users)}</span>
                            {ga.usersChange > 0 ? (
                              <TrendingUp className="size-3 text-success" />
                            ) : ga.usersChange < 0 ? (
                              <TrendingDown className="size-3 text-destructive" />
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">Sessions</span>
                          <span className="text-sm font-semibold text-foreground tabular-nums">{formatNumber(ga.sessions)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">Bounce</span>
                          <span className="text-sm font-semibold text-foreground tabular-nums">{ga.bounceRate}%</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    )}
                    <Badge variant="secondary" className={config.badgeClass}>{config.label}</Badge>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    <WebsiteMetrics
                      website={site}
                      onGAData={(data) => handleGAData(site.id, data)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
