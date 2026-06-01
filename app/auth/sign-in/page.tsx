'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/app')
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row">

      {/* Left editorial panel */}
      <motion.section
        className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center px-12 lg:px-20 bg-surface-container-low relative overflow-hidden"
        {...fadeUp}
      >
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-10 w-64 h-64 rounded-full bg-ai/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-sm">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-6">
            Nuvora Health
          </p>
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.02em] text-foreground">
            Know your health <em>at a glance.</em>
          </h1>
          <p className="mt-4 text-[16px] leading-[24px] text-muted-foreground">
            Quiet Intelligence Precision tracking powered by multi-agent AI.
          </p>

          <div className="mt-10 flex flex-col gap-2 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              256-bit encryption
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              GDPR compliant
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">block</span>
              Zero data selling
            </div>
          </div>
        </div>
      </motion.section>

      {/* Right sign-in form */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center px-6 md:px-16 lg:px-24 py-10 bg-surface">
        <motion.div className="w-full max-w-sm" {...fadeUpDelayed(0.05)}>

          <div className="md:hidden mb-8">
            <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary">
              Nuvora Health
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">Welcome back</h2>
            <p className="mt-1 text-[15px] text-muted-foreground">Sign in to your Nuvora account</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-11 gap-2 border-border text-foreground font-medium"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[12px] uppercase tracking-wider">
              <span className="bg-surface px-3 text-muted-foreground font-medium">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="h-11" />
            </div>

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-full" disabled={loading || googleLoading}>
              {loading ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[14px] text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </motion.div>
      </section>
    </div>
  )
}
