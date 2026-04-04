"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Lock, Mail } from "lucide-react"

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("sarah@company.com")
  const [password, setPassword] = useState("demo1234")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 800)
  }

  return (
    <div className="flex min-h-svh">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-extrabold text-accent tracking-wider">KMA</span>
              <span className="text-[12px] font-medium text-white tracking-[0.2em] uppercase">Clients</span>
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="font-serif text-4xl leading-tight text-primary-foreground text-balance">
            Your projects, organized and accessible.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/60">
            Access your project details, manage subscriptions, review documents,
            and stay connected with your development team.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-primary-foreground leading-tight">Concierge</span>
            <span className="text-xs text-primary-foreground/50 uppercase tracking-wider mt-1">Tech Service</span>
          </div>
          <div className="h-8 w-px bg-primary-foreground/10" />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-primary-foreground leading-tight">Book a Call</span>
            <span className="text-xs text-primary-foreground/50 uppercase tracking-wider mt-1">Anytime</span>
          </div>
          <div className="h-8 w-px bg-primary-foreground/10" />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-primary-foreground leading-tight">Creative</span>
            <span className="text-xs text-primary-foreground/50 uppercase tracking-wider mt-1">Solutions</span>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl font-extrabold text-accent tracking-wider">KMA</span>
              <span className="text-[12px] font-medium text-white tracking-[0.2em] uppercase">Clients</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Sign in to your client portal to manage your projects.
            </p>
          </div>

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
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <button type="button" className="text-xs text-accent hover:text-accent/80 transition-colors">
                  Forgot password?
                </button>
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

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-3">
            <p className="text-center text-xs text-muted-foreground">
              Demo credentials are pre-filled. Just click <span className="font-medium text-foreground">Sign in</span>.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {"Don't have an account? "}
            <button className="text-accent hover:text-accent/80 transition-colors font-medium">
              Contact us
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
