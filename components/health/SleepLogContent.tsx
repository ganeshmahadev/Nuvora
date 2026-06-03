'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogSleep, useMetricHistory, type SleepEntry } from '@/features/metrics/hooks/useMetricLog'
import { logSleepSchema, type LogSleepValues } from '@/features/metrics/schemas/metric.schema'
import { MetricHistoryTable } from '@/components/health/MetricHistoryTable'
import { AiInsightCard } from '@/components/health/AiInsightCard'
import { METRIC_CONFIGS } from '@/lib/config/metrics.config'
import Link from 'next/link'
import { LogDatePicker } from '@/components/health/LogDatePicker'

function SleepQualitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] p-5 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          Subjective Quality
        </h3>
        <span className="text-[48px] font-light tracking-[-0.04em] text-primary leading-none">
          {value}
        </span>
      </div>
      <div className="relative pt-1 pb-4">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-[oklch(90%_0.005_260)] rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-2.5
            [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[oklch(90%_0.005_260)]"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)]">Restless</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)]">Profound</span>
        </div>
      </div>
    </div>
  )
}

function parseBedTimeMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const mins = h * 60 + (m ?? 0)
  return h < 6 ? mins + 1440 : mins
}

function calcSleepScore(entries: SleepEntry[]): number | null {
  const valid = entries.filter((e) => e.duration_minutes != null)
  if (valid.length < 2) return null

  const entryScores = valid.map((e) => {
    const hours = (e.duration_minutes ?? 0) / 60
    const quality = e.subjective_quality ?? 5

    let durScore: number
    if (hours >= 7 && hours <= 9) durScore = 40
    else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) durScore = 28
    else if ((hours >= 5 && hours < 6) || hours > 10) durScore = 16
    else durScore = 0

    return durScore + (quality / 10) * 40
  })

  const bedTimes = valid.map((e) => parseBedTimeMinutes(e.bed_time ?? '23:00'))
  const meanBed = bedTimes.reduce((a, b) => a + b, 0) / bedTimes.length
  const stddev = Math.sqrt(bedTimes.reduce((s, t) => s + (t - meanBed) ** 2, 0) / bedTimes.length)
  const consistScore = stddev < 30 ? 20 : stddev < 60 ? 14 : stddev < 90 ? 8 : 4

  const avgEntry = entryScores.reduce((a, b) => a + b, 0) / entryScores.length
  return Math.min(100, Math.round(avgEntry + consistScore))
}

function SleepScoreCircle({ score, count }: { score: number | null; count: number }) {
  const display = score != null ? String(score) : '--'
  return (
    <div className="bg-[oklch(97%_0.005_90)] border border-[oklch(90%_0.005_260)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <div className="w-28 h-28 rounded-full border-4 border-primary/20 flex items-center justify-center mb-2 relative">
        {score != null && (
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-[spin_3s_linear_infinite]" />
        )}
        <div className="flex flex-col">
          <span className="text-[48px] font-light tracking-[-0.04em] text-primary leading-none">{display}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)]">Sleep Score</span>
        </div>
      </div>
      <p className="text-[12px] text-[oklch(48%_0.010_260)]">
        {count >= 2 ? `Based on last ${count} night${count === 1 ? '' : 's'}` : 'Log 2+ nights to see your score'}
      </p>
    </div>
  )
}

function SleepForm({ date }: { date: string }) {
  const logSleep = useLogSleep()
  const [quality, setQuality] = useState(7)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LogSleepValues>({
    resolver: zodResolver(logSleepSchema),
    defaultValues: { date, bed_time: '22:30', wake_time: '06:45', subjective_quality: 7, notes: null },
  })

  useEffect(() => {
    setValue('date', date)
  }, [date, setValue])

  function onSubmit(data: LogSleepValues) {
    logSleep.mutate(
      { ...data, subjective_quality: quality },
      { onSuccess: () => reset({ date, bed_time: '22:30', wake_time: '06:45', subjective_quality: 7, notes: null }) },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] p-5 rounded-xl">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
          Circadian Bounds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)]">Went to Bed</label>
            <div className="flex items-center border-b border-[oklch(90%_0.005_260)] focus-within:border-primary transition-colors py-2">
              <span
                className="material-symbols-outlined text-[oklch(48%_0.010_260)] mr-3"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
              >
                bedtime
              </span>
              <input
                type="time"
                {...register('bed_time')}
                className="w-full bg-transparent border-none focus:ring-0 text-[24px] font-medium tracking-[-0.01em] text-[oklch(14%_0.012_260)] p-0"
              />
            </div>
            {errors.bed_time && <p className="text-[12px] text-error mt-1">{errors.bed_time.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-[oklch(48%_0.010_260)]">Woke Up</label>
            <div className="flex items-center border-b border-[oklch(90%_0.005_260)] focus-within:border-primary transition-colors py-2">
              <span
                className="material-symbols-outlined text-[oklch(48%_0.010_260)] mr-3"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
              >
                wb_sunny
              </span>
              <input
                type="time"
                {...register('wake_time')}
                className="w-full bg-transparent border-none focus:ring-0 text-[24px] font-medium tracking-[-0.01em] text-[oklch(14%_0.012_260)] p-0"
              />
            </div>
            {errors.wake_time && <p className="text-[12px] text-error mt-1">{errors.wake_time.message}</p>}
          </div>
        </div>
      </div>

      <SleepQualitySlider value={quality} onChange={setQuality} />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={logSleep.isPending}
          className="flex-1 bg-primary text-on-primary py-3 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            save
          </span>
          {logSleep.isPending ? 'Saving...' : 'Log Sleep'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="flex-1 border border-primary text-primary py-3 rounded-full text-[14px] font-medium hover:bg-[oklch(97%_0.005_90)] transition-colors"
        >
          Cancel
        </button>
      </div>
      {logSleep.error && <p className="text-[12px] text-error">Failed to log sleep. Please try again.</p>}
    </form>
  )
}

export default function SleepLogContent() {
  const today = new Date().toLocaleDateString('en-CA')
  const [date, setDate] = useState(today)
  const config = METRIC_CONFIGS.sleep

  const _d = new Date(); _d.setDate(_d.getDate() - 7)
  const sevenDaysAgo = _d.toLocaleDateString('en-CA')
  const { data: sleepHistory } = useMetricHistory('sleep', sevenDaysAgo, today)
  const entries = (sleepHistory ?? []) as SleepEntry[]
  const sleepScore = calcSleepScore(entries)

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
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px] text-[oklch(52%_0.150_270)]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              bedtime
            </span>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
              Log Sleep
            </h1>
          </div>
          <LogDatePicker date={date} onChange={setDate} />
        </div>
        <p className="text-[15px] text-[oklch(48%_0.010_260)]">Document your circadian rhythm and sleep quality.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          <SleepForm date={date} />
          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <MetricHistoryTable config={config} date={date} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <AiInsightCard category="sleep_hygiene" title="Biometric Insight" icon="auto_awesome" />
          <SleepScoreCircle score={sleepScore} count={entries.length} />
        </div>
      </div>
    </div>
  )
}