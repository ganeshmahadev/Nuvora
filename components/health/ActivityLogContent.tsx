'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogActivity, useMetricHistory } from '@/features/metrics/hooks/useMetricLog'
import { logActivitySchema, type LogActivityValues } from '@/features/metrics/schemas/metric.schema'
import { MetricHistoryTable } from '@/components/health/MetricHistoryTable'
import { ACTIVITY_TYPES, ACTIVITY_TYPE_ICONS, METRIC_CONFIGS } from '@/lib/config/metrics.config'
import { cn } from '@/lib/utils'
import { AiInsightCard } from '@/components/health/AiInsightCard'
import Link from 'next/link'
import { LogDatePicker } from '@/components/health/LogDatePicker'

function ActivityForm({ date }: { date: string }) {
  const logActivity = useLogActivity()
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LogActivityValues>({
    resolver: zodResolver(logActivitySchema),
    defaultValues: { date, activity_type: undefined, duration_minutes: 30, intensity_label: null, calories_burned: null, notes: null },
  })

  const selectedType = watch('activity_type')
  const filteredTypes = ACTIVITY_TYPES.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <form
      onSubmit={handleSubmit((data) => logActivity.mutate(data, { onSuccess: () => reset({ date, activity_type: undefined, duration_minutes: 30, intensity_label: null, calories_burned: null, notes: null }) }))}
      className="space-y-5"
    >
      <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] p-5 rounded-xl">
        <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)] mb-3 block">
          What did you do today?
        </label>
        <div className="relative group mb-4">
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[oklch(48%_0.010_260)]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity (Running, Strength, Yoga...)"
            className="w-full pl-12 pr-4 py-3 border-b border-[oklch(90%_0.005_260)] focus:border-primary bg-transparent text-[16px] font-medium text-[oklch(14%_0.012_260)] transition-all placeholder:text-[oklch(70%_0.006_260)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredTypes.map((type) => {
            const icon = ACTIVITY_TYPE_ICONS[type]
            const isSelected = selectedType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValue('activity_type', type, { shouldValidate: true })
                  setSearchQuery('')
                }}
                className={cn(
                  'px-4 py-1.5 rounded-full border text-[14px] font-medium flex items-center gap-1 transition-colors',
                  isSelected
                    ? 'border-primary text-primary'
                    : 'border-[oklch(90%_0.005_260)] text-[oklch(48%_0.010_260)] hover:border-primary/30',
                )}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  {icon}
                </span>
                {type}
              </button>
            )
          })}
        </div>
        {errors.activity_type && <p className="text-[12px] text-error mt-2">Please select an activity type</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] p-5 rounded-xl">
          <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)] mb-1 block">Duration</label>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              step="1"
              min="1"
              {...register('duration_minutes', { valueAsNumber: true })}
              className="w-full bg-transparent border-none focus:ring-0 text-[48px] font-light tracking-[-0.04em] text-[oklch(14%_0.012_260)] p-0 tabular-nums"
            />
            <span className="text-[14px] text-[oklch(48%_0.010_260)]">min</span>
          </div>
          {errors.duration_minutes && <p className="text-[12px] text-error mt-1">{errors.duration_minutes.message}</p>}
        </div>
        <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] p-5 rounded-xl">
          <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)] mb-1 block">
            Intensity (RPE 1-10)
          </label>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              min="1"
              max="10"
              {...register('intensity_label', { valueAsNumber: true })}
              className="w-full bg-transparent border-none focus:ring-0 text-[48px] font-light tracking-[-0.04em] text-[oklch(52%_0.150_270)] p-0 tabular-nums"
            />
            <span className="text-[14px] text-[oklch(48%_0.010_260)]">/10</span>
          </div>
          <p className="text-[12px] text-[oklch(48%_0.010_260)] mt-1">Moderate: Hard to hold a conversation.</p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={logActivity.isPending}
          className="bg-primary text-on-primary py-3 px-10 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            check_circle
          </span>
          Save Activity
        </button>
      </div>
      {logActivity.error && <p className="text-[12px] text-error">Failed to log activity. Please try again.</p>}
    </form>
  )
}

function QuickLogRecent() {
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const from = sevenDaysAgo.toISOString().split('T')[0]
  const { data: entries } = useMetricHistory('activity', from, today)
  const recent = (entries ?? []).slice(0, 3) as any[]

  const typeIcons: Record<string, string> = {
    Running: 'directions_run',
    Walking: 'directions_walk',
    Cycling: 'directions_bike',
    'Strength Training': 'fitness_center',
    Yoga: 'self_improvement',
    Swimming: 'pool',
    HIIT: 'bolt',
    Dancing: 'music_note',
    Hiking: 'hiking',
    Other: 'more_horiz',
  }

  if (recent.length === 0) return null

  return (
    <div className="bg-[oklch(97%_0.005_90)] p-4 rounded-xl">
      <h3 className="text-[14px] font-bold mb-3 text-[oklch(14%_0.012_260)]">Quick Log Recent</h3>
      <ul className="space-y-2">
        {recent.map((entry: any) => (
          <li key={entry.id} className="flex items-center justify-between p-2 hover:bg-surface-container-lowest border border-transparent hover:border-[oklch(90%_0.005_260)] rounded-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[oklch(48%_0.010_260)]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                {typeIcons[entry.activity_type] || 'directions_run'}
              </span>
              <div>
                <p className="text-[14px] font-medium text-[oklch(14%_0.012_260)]">{entry.activity_type}</p>
                <p className="text-[12px] text-[oklch(48%_0.010_260)]">{entry.duration_minutes} min{entry.intensity_label ? ` · ${entry.intensity_label}` : ''}</p>
              </div>
            </div>
            <span
              className="material-symbols-outlined text-[oklch(70%_0.006_260)] group-hover:text-primary transition-colors"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              add_circle
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ActivityLogContent() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const config = METRIC_CONFIGS.activity

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

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary block mb-1">
            Activity Tracker
          </span>
          <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
            Log Activity
          </h1>
        </div>
        <LogDatePicker date={date} onChange={setDate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-8 space-y-5">
          <ActivityForm date={date} />
          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <MetricHistoryTable config={config} date={date} />
          </div>
        </div>

        <div className="md:col-span-4 space-y-5">
          <QuickLogRecent />
          <AiInsightCard category="activity_recommendation" title="Smart Recommendation" icon="auto_awesome" fallbackDescription="Log activities and we'll analyze your training patterns, recovery needs, and suggest optimal training windows." />
        </div>
      </div>
    </div>
  )
}