'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogWeight, useMetricHistory, useTodayMetrics } from '@/features/metrics/hooks/useMetricLog'
import { logWeightSchema, type LogWeightValues } from '@/features/metrics/schemas/metric.schema'
import type { WeightEntry } from '@/lib/api/metrics'
import { AiInsightCard } from '@/components/health/AiInsightCard'
import { MetricHistoryTable } from '@/components/health/MetricHistoryTable'
import { METRIC_CONFIGS } from '@/lib/config/metrics.config'
import Link from 'next/link'

function WeightTrendChart({ date }: { date: string }) {
  const sevenDaysAgo = new Date(date)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30)
  const from = sevenDaysAgo.toISOString().split('T')[0]

  const { data: entries, isLoading } = useMetricHistory('weight', from, date)

  if (isLoading || !entries || entries.length === 0) {
    return null
  }

  const recent = (entries as WeightEntry[]).slice(0, 7).reverse()
  if (recent.length < 2) return null

  const weights = recent.map((e) => e.weight_kg)
  const minW = Math.floor(Math.min(...weights) - 1)
  const maxW = Math.ceil(Math.max(...weights) + 1)
  const range = maxW - minW || 1

  return (
    <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
        Recent Trend
      </h3>
      <div className="flex items-end gap-2 h-32">
        {recent.map((entry, i) => {
          const height = ((entry.weight_kg - minW) / range) * 100
          const d = new Date(entry.date + 'T00:00:00')
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[11px] tabular-nums font-medium text-[oklch(14%_0.012_260)]">
                {entry.weight_kg.toFixed(1)}
              </span>
              <div className="w-full bg-[oklch(95%_0.005_260)] rounded-t-sm relative" style={{ height: '96px' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary/70 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              <span className="text-[10px] text-[oklch(70%_0.006_260)]">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BmiCard({ weightKg }: { weightKg: number | null }) {
  const bmi = weightKg ? (weightKg / (1.75 * 1.75)).toFixed(1) : null
  const category = bmi
    ? Number(bmi) < 18.5 ? 'Underweight'
      : Number(bmi) < 25 ? 'Normal'
      : Number(bmi) < 30 ? 'Overweight'
      : 'Obese'
    : null
  const categoryColor = category === 'Normal' ? 'text-primary' : category === 'Underweight' ? 'text-[oklch(52%_0.150_270)]' : 'text-warning'
  const pct = bmi ? Math.min((Number(bmi) / 40) * 100, 100) : 0

  return (
    <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
        BMI Estimate
      </h3>
      {bmi ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] font-light tracking-[-0.04em] text-[oklch(14%_0.012_260)] leading-none">{bmi}</span>
            <span className={`text-[14px] font-bold ${categoryColor}`}>{category}</span>
          </div>
          <div className="relative h-2 bg-[oklch(95%_0.005_260)] rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[oklch(52%_0.150_270)] via-primary to-warning" style={{ width: `${pct}%` }} />
            <div className="absolute top-0 h-full w-px bg-[oklch(14%_0.012_260)]" style={{ left: `${(18.5 / 40) * 100}%` }} />
            <div className="absolute top-0 h-full w-px bg-[oklch(14%_0.012_260)]" style={{ left: `${(25 / 40) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[oklch(70%_0.006_260)]">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
          <p className="text-[12px] text-[oklch(48%_0.010_260)]">Based on estimated height of 175cm. Update your profile for precision.</p>
        </div>
      ) : (
        <p className="text-[13px] text-[oklch(48%_0.010_260)]">Log your weight to see BMI estimate.</p>
      )}
    </div>
  )
}

function WeightForm({ date }: { date: string }) {
  const logWeight = useLogWeight()
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<LogWeightValues>({
    resolver: zodResolver(logWeightSchema),
    defaultValues: { date, weight_kg: undefined, notes: null },
  })

  function onSubmit(data: LogWeightValues) {
    const submitData = { ...data }
    if (unit === 'lbs' && submitData.weight_kg != null) {
      submitData.weight_kg = Number((submitData.weight_kg / 2.205).toFixed(1))
    }
    logWeight.mutate(submitData, { onSuccess: () => reset({ date, weight_kg: undefined, notes: null }) })
  }

  const weightKg = watch('weight_kg')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            Weight Entry
          </h3>
          <div className="flex gap-1 bg-[oklch(97%_0.005_90)] rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${unit === 'kg' ? 'bg-primary text-on-primary' : 'text-[oklch(48%_0.010_260)]'}`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnit('lbs')}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${unit === 'lbs' ? 'bg-primary text-on-primary' : 'text-[oklch(48%_0.010_260)]'}`}
            >
              lbs
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            {...register('weight_kg', { valueAsNumber: true })}
            className="w-full bg-transparent border-none focus:ring-0 text-[56px] font-light tracking-[-0.04em] text-[oklch(14%_0.012_260)] p-0 tabular-nums placeholder:text-[oklch(90%_0.005_260)]/60"
          />
          <span className="text-[18px] text-[oklch(70%_0.006_260)] shrink-0">{unit}</span>
        </div>
        {errors.weight_kg && <p className="text-[12px] text-error mt-1">{errors.weight_kg.message}</p>}
      </div>

      <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
        <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)] mb-2 block">Notes (optional)</label>
        <input
          {...register('notes')}
          placeholder="e.g. post-run, fasting"
          className="w-full bg-transparent border-b border-[oklch(90%_0.005_260)] focus:border-primary py-2 text-[16px] text-[oklch(14%_0.012_260)] transition-colors placeholder:text-[oklch(70%_0.006_260)]"
        />
      </div>

      <button
        type="submit"
        disabled={logWeight.isPending}
        className="w-full bg-primary text-on-primary py-3 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          save
        </span>
        {logWeight.isPending ? 'Saving...' : 'Log Weight'}
      </button>
      {logWeight.error && <p className="text-[12px] text-error">Failed to log weight. Please try again.</p>}
    </form>
  )
}

export default function WeightLogContent() {
  const today = new Date().toISOString().split('T')[0]
  const [date] = useState(today)
  const config = METRIC_CONFIGS.weight
  const { data: todayMetrics } = useTodayMetrics()

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
            className="material-symbols-outlined text-[24px] text-[oklch(68%_0.180_80)]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            monitor_weight
          </span>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
            Log Weight
          </h1>
        </div>
        <p className="text-[15px] text-[oklch(48%_0.010_260)]">Track your body weight over time. One entry per day.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          <WeightForm date={date} />
          <WeightTrendChart date={date} />
          <BmiCard weightKg={todayMetrics?.weight_kg ?? null} />
          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <MetricHistoryTable config={config} date={date} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <AiInsightCard category="weight_trend" title="Biometric Insight" icon="monitor_weight" fallbackDescription="Log your weight consistently and we'll identify trends, account for normal fluctuations, and provide context around your changes." />
          <div className="bg-[oklch(97%_0.005_90)] border border-[oklch(90%_0.005_260)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                monitoring
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">Why This Matters</span>
            </div>
            <p className="text-[13px] text-[oklch(48%_0.010_260)]">
              Daily weight fluctuates 1-2kg due to water retention, glycogen, and digestive contents. The meaningful metric is the <strong className="text-[oklch(14%_0.012_260)]">7-day moving average</strong>, not any single reading.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}