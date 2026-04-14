"use client"

import { Video, Clock, CalendarDays, ExternalLink, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function BookingView() {
  const tidycalUrl = process.env.NEXT_PUBLIC_TIDYCAL_URL || "https://tidycal.com/kerriemariah/15-minute-meeting"

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

      <Card className="border-border bg-card shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center px-6 py-16 sm:py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-6">
              <CalendarDays className="size-8 text-accent" />
            </div>

            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              15 Minute Quick Connect
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
              Have a question or want to chat about your project? Book a quick video call
              and let&apos;s connect.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-sm font-medium"
            >
              <a href={tidycalUrl} target="_blank" rel="noopener noreferrer">
                Schedule a Call
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Video className="size-4 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Video Call</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Via Google Meet or Zoom
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Clock className="size-4 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">15 Minutes</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Longer sessions on request
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <MessageCircle className="size-4 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Free Consultation</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                No obligation, just a chat
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
