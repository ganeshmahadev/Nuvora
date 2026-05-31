'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep2 } from '@/features/onboarding/hooks/useStep2'
import type { PrimaryGoal, ActivityLevel } from '@/lib/utils/calories'

const GOAL_CARDS: { value: PrimaryGoal; label: string; icon: string; description: string }[] = [
  { value: 'weight_loss',          label: 'Weight Loss',          icon: 'monitor_weight', description: 'Prioritise metabolic efficiency and fat oxidation.' },
  { value: 'muscle_gain',          label: 'Muscle Gain',          icon: 'fitness_center', description: 'Optimise hypertrophy targets and protein synthesis.' },
  { value: 'maintenance',          label: 'Maintenance',          icon: 'balance',        description: 'Focus on long-term stability and hormonal health.' },
  { value: 'athletic_performance', label: 'Athletic Performance', icon: 'sprint',         description: 'Maximise VO2 max and anaerobic threshold power.' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light',     label: 'Light' },
  { value: 'moderate',  label: 'Moderate' },
  { value: 'active',    label: 'Active' },
  { value: 'athlete',   label: 'Athlete' },
]

export default function OnboardingStep2() {
  const router = useRouter()
  const { form, mutation, calibration } = useStep2()
  const { handleSubmit, control, watch } = form

  const selectedGoal  = watch('primary_goal')
  const selectedActivity = watch('activity_level')
  const activityIndex = ACTIVITY_LEVELS.findIndex(a => a.value === selectedActivity)

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col lg:flex-row">

      {/* Left content */}
      <motion.div className="flex-1 px-6 md:px-12 lg:px-16 py-10 lg:py-16" {...fadeUp}>
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">Step 2 of 3</span>
            <div className="flex gap-1">
              {[1,2,3].map(s => (
                <div key={s} className="h-[3px] w-8 rounded-full" style={{ background: s <= 2 ? '#006958' : '#bdc9c4' }} />
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold tracking-[-0.02em] text-foreground mb-2">
          Define your performance baselines.
        </h1>
        <p className="text-[16px] text-muted-foreground mb-10">
          Your goals drive the AI synthesis. Select your primary focus to calibrate the dashboard.
        </p>

        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-4">Primary Focus</p>
        <Controller
          name="primary_goal"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_CARDS.map((card) => (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => field.onChange(card.value)}
                  className={[
                    'text-left p-5 rounded-xl border-2 transition-all duration-150',
                    field.value === card.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-surface hover:border-border-strong',
                  ].join(' ')}
                >
                  <span className="material-symbols-outlined text-[24px] text-primary mb-2 block">{card.icon}</span>
                  <p className="text-[16px] font-semibold text-foreground">{card.label}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground leading-snug">{card.description}</p>
                </button>
              ))}
            </div>
          )}
        />

        <div className="mt-8 p-5 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Daily Activity Level</p>
            <p className="text-[13px] font-semibold text-primary capitalize">
              {ACTIVITY_LEVELS[activityIndex >= 0 ? activityIndex : 2]?.label}
            </p>
          </div>
          <Controller
            name="activity_level"
            control={control}
            render={({ field }) => (
              <Slider
                min={0} max={4} step={1}
                value={[Math.max(0, ACTIVITY_LEVELS.findIndex(a => a.value === field.value))]}
                onValueChange={([i]) => field.onChange(ACTIVITY_LEVELS[i].value)}
                className="w-full"
              />
            )}
          />
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            <span>Sedentary</span><span>Athlete</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10">
          <button type="button" onClick={() => router.push('/onboarding/step-1')} className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
          </button>
          <Button onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium gap-2">
            {mutation.isPending
              ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              : <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
          </Button>
        </div>
        {mutation.isError && (
          <p className="mt-3 text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">{mutation.error.message}</p>
        )}
      </motion.div>

      {/* Right AI Calibration sidebar */}
      <motion.aside
        className="lg:w-80 xl:w-96 px-6 lg:px-8 py-10 lg:py-16 lg:border-l border-border bg-surface-container-low"
        {...fadeUpDelayed(0.1)}
      >
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-6">AI Calibration</p>

        {calibration ? (
          <div className="space-y-5">
            <div>
              <p className="text-[13px] text-muted-foreground mb-1">Estimated Daily Target</p>
              <p className="text-[48px] leading-none font-light tabular-nums text-foreground">
                {calibration.calorie_target.toLocaleString()}
                <span className="text-[16px] font-normal ml-1 text-muted-foreground">kcal</span>
              </p>
            </div>
            <div className="flex gap-8 pt-1">
              <div>
                <p className="text-[12px] text-muted-foreground">Protein Target</p>
                <p className="text-[18px] font-semibold tabular-nums text-foreground">{calibration.protein_target}g</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Metabolic Baseline</p>
                <p className="text-[18px] font-semibold tabular-nums text-foreground">{calibration.tdee.toLocaleString()} kcal</p>
              </div>
            </div>
            <p className="text-[13px] italic text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
              &ldquo;Based on your profile, Nuvora is calibrating your targets for{' '}
              {GOAL_CARDS.find(g => g.value === selectedGoal)?.label?.toLowerCase() ?? 'your goal'}.&rdquo;
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-border rounded" />
            <div className="h-12 w-48 bg-border rounded" />
            <div className="h-4 w-24 bg-border rounded" />
          </div>
        )}
      </motion.aside>
    </div>
  )
}
