"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }

    setSent(true)
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/auth/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        {sent ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
              We sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Click the link in the email to reset your password.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-border text-foreground"
              onClick={() => { setSent(false); setEmail("") }}
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Enter your email and we'll send you a link to reset your password.
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

              <Button
                type="submit"
                className="h-11 mt-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
