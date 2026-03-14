"use client"

import { Video, Clock, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TIDYCAL_URL = process.env.NEXT_PUBLIC_TIDYCAL_URL ?? ""

export function BookingView() {
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
          {TIDYCAL_URL ? (
            <Card className="border-border bg-card shadow-none overflow-hidden">
              <CardContent className="p-0">
                <iframe
                  src={TIDYCAL_URL}
                  title="Book a Call"
                  className="w-full border-0"
                  style={{ minHeight: "680px" }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
                  <CalendarIcon className="size-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-lg font-medium text-foreground">
                  Booking not available
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  The scheduling link is not configured yet. Please contact us directly to schedule a call.
                </p>
              </CardContent>
            </Card>
          )}
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
                  <p className="text-sm font-medium text-foreground">30 minutes</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Standard consultation length. Longer sessions available.
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
