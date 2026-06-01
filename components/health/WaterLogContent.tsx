'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTodayMetrics, useMetricHistory, useLogWater, useDeleteMetric } from '@/features/metrics/hooks/useMetricLog'
import { METRIC_CONFIGS } from '@/lib/config/metrics.config'
import { logWaterSchema, type LogWaterValues } from '@/features/metrics/schemas/metric.schema'
import { MetricHistoryTable } from '@/components/health/MetricHistoryTable'
import { AiInsightPlaceholder } from '@/components/health/AiInsightPlaceholder'
import Link from 'next/link'

function WaterProgressViz({ currentMl, targetMl }: { currentMl: number; targetMl: number }) {
  const [animatedPct, setAnimatedPct] = useState(0)
  const prevPctRef = useRef(0)

  useEffect(() => {
    const startPct = prevPctRef.current
    const endPct = Math.min((currentMl / targetMl) * 100, 100)
    const duration = 600
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedPct(startPct + (endPct - startPct) * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    prevPctRef.current = endPct
  }, [currentMl, targetMl])

  return (
    <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5 flex flex-col items-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4 self-start">
        Daily Progress
      </p>
      <div className="relative w-36 h-48 rounded-2xl border-2 border-[oklch(90%_0.005_260)] overflow-hidden bg-[oklch(97%_0.005_90)]">
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out rounded-b-xl"
          style={{
            height: `${animatedPct}%`,
            background: 'linear-gradient(to top, oklch(52% 0.150 270), oklch(60% 0.150 240))',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-4 opacity-30"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)',
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-[28px] font-light tracking-[-0.04em] text-[oklch(14%_0.012_260)] leading-none">
            {Math.round(currentMl)}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)] mt-0.5">
            / {targetMl} ml
          </span>
          <span className="text-[20px] font-semibold text-primary mt-1">
            {Math.round(animatedPct)}%
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1 mt-4">
        <span
          className="material-symbols-outlined text-[18px] text-[oklch(52%_0.150_270)]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          water_drop
        </span>
        <span className="text-[13px] text-[oklch(48%_0.010_260)]">
          {targetMl - currentMl > 0 ? `${targetMl - Math.round(currentMl)} ml remaining` : 'Target reached!'}
        </span>
      </div>
    </div>
  )
}

function WaterForm({ date }: { date: string }) {
  const logWater = useLogWater()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogWaterValues>({
    resolver: zodResolver(logWaterSchema),
    defaultValues: { date, amount_ml: 250 },
  })

  function handleQuickAdd(ml: number) {
    logWater.mutate(
      { date, amount_ml: ml },
      { onSuccess: () => reset({ date, amount_ml: 250 }) },
    )
  }

  return (
    <form
      onSubmit={handleSubmit((data) => logWater.mutate(data, { onSuccess: () => reset({ date, amount_ml: 250 }) }))}
      className="space-y-5"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-3">
          Quick add
        </p>
        <div className="grid grid-cols-2 gap-2">
          {METRIC_CONFIGS.water.quickAddValues!.map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => handleQuickAdd(ml)}
              disabled={logWater.isPending}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[oklch(90%_0.005_260)] bg-surface hover:bg-[oklch(97%_0.005_90)] hover:border-primary/30 transition-colors text-[14px] font-medium text-[oklch(14%_0.012_260)] disabled:opacity-50"
            >
              <span
                className="material-symbols-outlined text-[18px] text-[oklch(52%_0.150_270)]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                water_drop
              </span>
              {ml} ml
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-3">
          Custom amount
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center border-b border-[oklch(90%_0.005_260)] focus-within:border-primary transition-colors py-2">
              <span
                className="material-symbols-outlined text-[oklch(48%_0.010_260)] mr-2"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
              >
                water_drop
              </span>
              <input
                type="number"
                step="1"
                min="1"
                {...register('amount_ml', { valueAsNumber: true })}
                className="w-full bg-transparent border-none focus:ring-0 text-[18px] font-medium text-[oklch(14%_0.012_260)] p-0 tabular-nums"
              />
              <span className="text-[14px] text-[oklch(48%_0.010_260)] ml-1">ml</span>
            </div>
            {errors.amount_ml && <p className="text-[12px] text-error mt-1">{errors.amount_ml.message}</p>}
          </div>
          <button
            type="submit"
            disabled={logWater.isPending}
            className="bg-primary text-on-primary py-2.5 px-6 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {logWater.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
      {logWater.error && <p className="text-[12px] text-error">Failed to log water. Please try again.</p>}
    </form>
  )
}

function WaterInsightSidebar() {
  return (
    <div className="space-y-5">
      <AiInsightPlaceholder
        title="Hydration Insights"
        description="Your consistent morning hydration aligns with peak cortisol rhythms. Maintaining intake before 10 AM correlates with 18% improved metabolic markers in your data."
      />
      <div className="bg-[oklch(97%_0.005_90)] border border-[oklch(90%_0.005_260)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[18px] text-primary"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            thermostat
          </span>
          <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">Environment</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-[oklch(48%_0.010_260)]">Ambient temperature</span>
            <span className="text-[oklch(14%_0.012_260)] font-medium">22°C</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[oklch(48%_0.010_260)]">Humidity</span>
            <span className="text-[oklch(14%_0.012_260)] font-medium">45%</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[oklch(48%_0.010_260)]">Suggested intake adjustment</span>
            <span className="text-primary font-medium">+200 ml</span>
          </div>
        </div>
      </div>
      <div className="bg-[oklch(97%_0.005_90)] border border-[oklch(90%_0.005_260)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[18px] text-primary"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            directions_run
          </span>
          <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">Activity impact</span>
        </div>
        <p className="text-[13px] text-[oklch(48%_0.010_260)]">
          No recorded activity today. On active days, add 500ml per 30 minutes of exercise beyond your base target.
        </p>
      </div>
    </div>
  )
}

export default function WaterLogContent() {
  const today = new Date().toISOString().split('T')[0]
  const [date] = useState(today)
  const config = METRIC_CONFIGS.water

  const { data: todayMetrics } = useTodayMetrics()
  const currentMl = todayMetrics?.total_water_ml ?? 0

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1280px] mx-auto">
      <Link
        href="/dashboard/log"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted hover:text-primary transition-colors mb-4"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          arrow_back
        </span>
        Back to journal
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-[24px] text-[oklch(52%_0.150_270)]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            water_drop
          </span>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
            Log Water
          </h1>
        </div>
        <p className="text-[15px] text-[oklch(48%_0.010_260)]">Track your daily hydration. Tap a quick-add or enter a custom amount.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="hidden lg:block lg:col-span-4">
          <WaterProgressViz currentMl={currentMl} targetMl={config.defaultTarget ?? 2500} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <WaterForm date={date} />
          </div>

          <div className="lg:hidden">
            <WaterProgressViz currentMl={currentMl} targetMl={config.defaultTarget ?? 2500} />
          </div>

          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <MetricHistoryTable config={config} date={date} />
          </div>
        </div>

        <div className="lg:col-span-3">
          <WaterInsightSidebar />
        </div>
      </div>
    </div>
  )
}