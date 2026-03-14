"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Wrench,
  ExternalLink,
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k"
  }
  return num.toString()
}

export function WebsitesView({ websites }: { websites: Website[] }) {
  const [expandedSite, setExpandedSite] = useState<string | null>(null)
  const onlineCount = websites.filter((w) => w.status === "online").length
  const totalVisitors = websites.reduce((a, w) => a + w.visitors.total, 0)
  const avgBounce = websites.length > 0
    ? (websites.reduce((a, w) => a + w.bounceRate, 0) / websites.length).toFixed(1)
    : "0"

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
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatNumber(totalVisitors)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="size-4 text-success" />
              <p className="text-sm text-muted-foreground">Avg. Bounce Rate</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {avgBounce}
              <span className="text-base font-normal text-muted-foreground">%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Activity className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Avg. Response</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {websites.length > 0
                ? Math.round(websites.reduce((a, w) => a + w.responseTime, 0) / websites.length)
                : 0}
              <span className="text-base font-normal text-muted-foreground">ms</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {websites.map((site) => {
          const config = statusConfig[site.status]
          const StatusIcon = config.icon
          const isExpanded = expandedSite === site.id

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
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">Visitors</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-foreground">{formatNumber(site.visitors.total)}</span>
                        {site.visitors.change > 0 ? (
                          <TrendingUp className="size-3 text-success" />
                        ) : (
                          <TrendingDown className="size-3 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">Bounce</span>
                      <span className="text-sm font-semibold text-foreground">{site.bounceRate}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">Uptime</span>
                      <span className="text-sm font-semibold text-foreground">{site.uptime}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">Speed</span>
                      <span className="text-sm font-semibold text-foreground">{site.responseTime}ms</span>
                    </div>
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
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Traffic Sources
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          {site.topReferrers.map((ref) => (
                            <div key={ref.source} className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{ref.source}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{formatNumber(ref.visits)}</span>
                                  <span className="text-xs font-medium text-foreground w-8 text-right">{ref.percentage}%</span>
                                </div>
                              </div>
                              <Progress value={ref.percentage} className="h-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Visitors by Country
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          {site.trafficByCountry.map((country) => (
                            <div key={country.country} className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Globe className="size-3.5 text-muted-foreground" />
                                  <span className="text-sm text-foreground">{country.country}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{formatNumber(country.visits)}</span>
                                  <span className="text-xs font-medium text-foreground w-8 text-right">{country.percentage}%</span>
                                </div>
                              </div>
                              <Progress value={country.percentage} className="h-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-6 rounded-lg bg-secondary/50 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">30-Day Visitors</p>
                        <p className="text-lg font-semibold text-foreground">{site.visitors.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Change</p>
                        <p className={`text-lg font-semibold ${site.visitors.change > 0 ? "text-success" : "text-destructive"}`}>
                          {site.visitors.change > 0 ? "+" : ""}{site.visitors.change}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bounce Rate</p>
                        <p className="text-lg font-semibold text-foreground">{site.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Checked</p>
                        <p className="text-sm font-medium text-foreground">{site.lastChecked}</p>
                      </div>
                    </div>
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
