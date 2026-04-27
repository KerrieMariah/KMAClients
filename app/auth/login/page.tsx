"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // If the video is already buffered (cached / fast network) by the time React
  // attaches, we won't get a `canplay` event — sync state once on mount.
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setVideoReady(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="relative flex min-h-svh">
      {/* Video background — full-screen on mobile, left half on desktop */}
      <div className="absolute inset-0 lg:relative lg:w-1/2 lg:flex flex-col justify-between p-12 overflow-hidden bg-[radial-gradient(ellipse_at_30%_60%,#1e3a5f_0%,#0a1426_50%,#000_100%)]">
        {/* Poster image: mobile gets background.png, desktop gets the wider
            background-desktop.png crop. On desktop it sits under the video and
            fades out once the video can play. */}
        <picture>
          <source media="(min-width: 1024px)" srcSet="/background-desktop.png" />
          <img
            src="/background.png"
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100 lg:opacity-0" : "opacity-100"}`}
          />
        </picture>
        <video
          ref={videoRef}
          className={`absolute inset-0 min-w-full min-h-full w-auto h-auto object-cover hidden lg:block transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
          src="/background.mp4"
          poster="/background-desktop.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 hidden lg:flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-extrabold text-accent tracking-wider">KMA</span>
              <span className="text-[12px] font-medium text-white tracking-[0.2em] uppercase">Clients</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block max-w-md">
          <h1 className="font-serif text-4xl leading-tight text-white text-balance">
            Your projects, organized and accessible.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Access your project details, manage subscriptions, review documents,
            and stay connected with your development team.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">Concierge</span>
            <span className="text-xs text-white/50 uppercase tracking-wider mt-1">Tech Service</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">Book a Call</span>
            <span className="text-xs text-white/50 uppercase tracking-wider mt-1">Anytime</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">Creative</span>
            <span className="text-xs text-white/50 uppercase tracking-wider mt-1">Solutions</span>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 lg:w-1/2 lg:bg-background">
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-extrabold text-accent tracking-wider">KMA</span>
              <span className="text-[12px] font-medium text-white tracking-[0.2em] uppercase">Clients</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl bg-white/95 backdrop-blur-sm p-8 shadow-xl lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Sign in to your client portal to manage your projects.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertCircle className="size-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 pl-10 bg-card border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 pl-10 bg-card border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 mt-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {"Don't have an account? Contact your project manager."}
          </p>
        </div>
      </div>
    </div>
  )
}
