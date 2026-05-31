'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { type UseFormReturn, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep3 } from '@/features/onboarding/hooks/useStep3'
import type { Step3Values } from '@/features/onboarding/schemas/onboarding.schema'

const PREFERENCES = [
  { key: 'pref_morning_gist'    as const, label: 'Morning Health Gist',    description: 'A concise, silent briefing as you wake.' },
  { key: 'pref_weekly_trends'   as const, label: 'Weekly Trend Analysis',  description: 'Mathematical deep-dives into your biometrics.' },
  { key: 'pref_critical_alerts' as const, label: 'Critical Marker Alerts', description: 'Immediate notifications for vital irregularities.' },
]

export default function OnboardingStep3() {
  const router = useRouter()
  const { form, mutation } = useStep3()
  const { handleSubmit, control } = form as unknown as UseFormReturn<Step3Values>

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col md:flex-row">

      {/* Left editorial panel */}
      <motion.section
        className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center px-12 lg:px-20 bg-surface-container-low relative overflow-hidden"
        {...fadeUp}
      >
        <div className="relative z-10 max-w-sm">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-6">Quiet Intelligence</p>
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.02em] text-foreground">
            Configure your <em>visual calm.</em>
          </h1>
          <p className="mt-4 text-[16px] leading-[24px] text-muted-foreground">
            Decide how Nuvora communicates with you. We value your focus and <em>data privacy.</em>
          </p>
          <div className="mt-10 w-48 h-48 rounded-full overflow-hidden bg-surface-container border border-border">
            <div className="w-full h-full" style={{ background: 'radial-gradient(circle at 40% 40%, #8ff5da 0%, #dee0ff 40%, #edecff 100%)' }} />
          </div>
        </div>
      </motion.section>

      {/* Right preferences panel */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-between px-6 md:px-16 lg:px-24 py-10 bg-surface">
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">Step 3 of 3</span>
            <div className="flex gap-1">
              {[1,2,3].map(s => (
                <div key={s} className="h-[3px] w-8 rounded-full" style={{ background: '#006958' }} />
              ))}
            </div>
          </div>
        </div>

        <motion.div className="max-w-md mx-auto w-full mt-4" {...fadeUpDelayed(0.05)}>
          <div className="space-y-0 divide-y divide-border">
            {PREFERENCES.map((pref) => (
              <div key={pref.key} className="flex items-center justify-between py-5">
                <div>
                  <p className="text-[16px] font-medium text-foreground">{pref.label}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{pref.description}</p>
                </div>
                <Controller
                  name={pref.key}
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 p-4 rounded-xl bg-surface-container-low border border-border">
            <span className="material-symbols-outlined text-[20px] text-primary mt-0.5 shrink-0">shield</span>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Encrypted Data Privacy</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground leading-relaxed">
                Your data is secured using end-to-end AES-256 encryption. Nuvora never sells health insights to third parties. Every metric is yours, and yours alone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={() => router.push('/onboarding/step-2')} className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Previous
            </button>
            <Button onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium">
              {mutation.isPending
                ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                : 'Enter your Gist'}
            </Button>
          </div>

          {mutation.isError && (
            <p className="mt-3 text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">{mutation.error.message}</p>
          )}

          <div className="flex gap-6 mt-8 pt-6 border-t border-border">
            {['GDPR Compliant', 'E2E Encrypted', 'Local Processing'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
