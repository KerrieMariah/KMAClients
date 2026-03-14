"use client"

import { useEffect } from "react"
import { Video, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BookingView() {
  useEffect(() => {
    if (document.querySelector('script[src="https://asset-tidycal.b-cdn.net/js/embed.js"]')) return
    const script = document.createElement("script")
    script.src = "https://asset-tidycal.b-cdn.net/js/embed.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
          Book a Call
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Schedule a call to discuss your project or any questions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-none overflow-hidden">
            <CardContent className="p-0">
              <div
                className="tidycal-embed"
                data-path="kerriemariah/15-minute-meeting"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Call Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary mt-0.5">
                  <Video className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Video call</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All calls are conducted via Google Meet or Zoom.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary mt-0.5">
                  <Clock className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">15 minutes</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quick consultation. Longer sessions available on request.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
