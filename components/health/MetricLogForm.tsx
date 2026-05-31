'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
  type MetricConfig,
  type MetricType,
  METRIC_CONFIGS,
  ACTIVITY_TYPES,
  INTENSITY_LABELS,
} from '@/lib/config/metrics.config'
import {
  logWaterSchema,
  logWeightSchema,
  logSleepSchema,
  logActivitySchema,
  type LogWaterValues,
  type LogWeightValues,
  type LogSleepValues,
  type LogActivityValues,
} from '@/features/metrics/schemas/metric.schema'
import {
  useLogWater,
  useLogWeight,
  useLogSleep,
  useLogActivity,
} from '@/features/metrics/hooks/useMetricLog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MetricLogFormProps {
  config: MetricConfig
  date: string
}

function WaterForm({ date }: { date: string }) {
  const logWater = useLogWater()
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LogWaterValues>({
    resolver: zodResolver(logWaterSchema),
    defaultValues: { date, amount_ml: 250 },
  })

  function handleQuickAdd(ml: number) {
    logWater.mutate(
      { date, amount_ml: ml },
      { onSuccess: () => reset() },
    )
  }

  const amount = watch('amount_ml')

  return (
    <form
      onSubmit={handleSubmit((data) => logWater.mutate(data, { onSuccess: () => reset({ date, amount_ml: 250 }) }))}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METRIC_CONFIGS.water.quickAddValues!.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => handleQuickAdd(ml)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-low hover:border-primary/20 transition-colors text-[14px] font-medium text-fg"
          >
            <span
              className="material-symbols-outlined text-[18px] text-ai"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              water_drop
            </span>
            {ml} ml
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="amount_ml" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Amount (ml)
          </Label>
          <Input
            id="amount_ml"
            type="number"
            step="1"
            min="1"
            {...register('amount_ml', { valueAsNumber: true })}
            className="mt-1.5 tabular-nums"
          />
          {errors.amount_ml && <p className="text-[12px] text-error mt-1">{errors.amount_ml.message}</p>}
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={logWater.isPending}
            className="bg-primary hover:bg-primary-container text-on-primary"
          >
            {logWater.isPending ? 'Adding…' : 'Add'}
          </Button>
        </div>
      </div>

      {logWater.error && <p className="text-[12px] text-error">Failed to log water. Please try again.</p>}
    </form>
  )
}

function WeightForm({ date }: { date: string }) {
  const logWeight = useLogWeight()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogWeightValues>({
    resolver: zodResolver(logWeightSchema),
    defaultValues: { date, weight_kg: undefined, notes: null },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => logWeight.mutate(data, { onSuccess: () => reset({ date, weight_kg: undefined, notes: null }) }))}
      className="space-y-4"
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Label htmlFor="weight_kg" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Weight (kg)
          </Label>
          <Input
            id="weight_kg"
            type="number"
            step="0.1"
            min="0"
            {...register('weight_kg', { valueAsNumber: true })}
            className="mt-1.5 tabular-nums"
          />
          {errors.weight_kg && <p className="text-[12px] text-error mt-1">{errors.weight_kg.message}</p>}
        </div>
        <div>
          <Label htmlFor="notes" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Note (optional)
          </Label>
          <Input
            id="notes"
            {...register('notes')}
            placeholder="e.g. post-run"
            className="mt-1.5"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={logWeight.isPending}
        className="w-full bg-primary hover:bg-primary-container text-on-primary"
      >
        {logWeight.isPending ? 'Saving…' : 'Log weight'}
      </Button>
      {logWeight.error && <p className="text-[12px] text-error">Failed to log weight. Please try again.</p>}
    </form>
  )
}

function SleepForm({ date }: { date: string }) {
  const logSleep = useLogSleep()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogSleepValues>({
    resolver: zodResolver(logSleepSchema),
    defaultValues: { date, bed_time: '23:00', wake_time: '07:00', subjective_quality: null, notes: null },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => logSleep.mutate(data, { onSuccess: () => reset({ date, bed_time: '23:00', wake_time: '07:00', subjective_quality: null, notes: null }) }))}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bed_time" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Bed time
          </Label>
          <Input
            id="bed_time"
            type="time"
            {...register('bed_time')}
            className="mt-1.5"
          />
          {errors.bed_time && <p className="text-[12px] text-error mt-1">{errors.bed_time.message}</p>}
        </div>
        <div>
          <Label htmlFor="wake_time" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Wake time
          </Label>
          <Input
            id="wake_time"
            type="time"
            {...register('wake_time')}
            className="mt-1.5"
          />
          {errors.wake_time && <p className="text-[12px] text-error mt-1">{errors.wake_time.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="quality" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Sleep quality (1–10)
          </Label>
          <Input
            id="quality"
            type="number"
            min="1"
            max="10"
            placeholder="Optional"
            {...register('subjective_quality', { valueAsNumber: true })}
            className="mt-1.5 tabular-nums"
          />
          {errors.subjective_quality && <p className="text-[12px] text-error mt-1">{errors.subjective_quality.message}</p>}
        </div>
        <div>
          <Label htmlFor="sleep_notes" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Notes (optional)
          </Label>
          <Input
            id="sleep_notes"
            {...register('notes')}
            placeholder="e.g. woke up once"
            className="mt-1.5"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={logSleep.isPending}
        className="w-full bg-primary hover:bg-primary-container text-on-primary"
      >
        {logSleep.isPending ? 'Saving…' : 'Log sleep'}
      </Button>
      {logSleep.error && <p className="text-[12px] text-error">Failed to log sleep. Please try again.</p>}
    </form>
  )
}

function ActivityForm({ date }: { date: string }) {
  const logActivity = useLogActivity()
  const [selectedType, setSelectedType] = useState<string>('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LogActivityValues>({
    resolver: zodResolver(logActivitySchema),
    defaultValues: { date, activity_type: undefined, duration_minutes: 30, intensity_label: null, calories_burned: null, notes: null },
  })

  function handleQuickAdd(minutes: number) {
    if (!selectedType) return
    logActivity.mutate(
      { date, activity_type: selectedType as any, duration_minutes: minutes, intensity_label: null, calories_burned: null, notes: null },
      { onSuccess: () => reset({ date, activity_type: undefined, duration_minutes: 30, intensity_label: null, calories_burned: null, notes: null }) },
    )
  }

  return (
    <form
      onSubmit={handleSubmit((data) => logActivity.mutate(data, { onSuccess: () => reset({ date, activity_type: undefined, duration_minutes: 30, intensity_label: null, calories_burned: null, notes: null }) }))}
      className="space-y-4"
    >
      <div>
        <Label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle block mb-2">
          Activity type
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setSelectedType(type); setValue('activity_type', type) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border',
                selectedType === type
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-surface text-fg-muted border-transparent hover:bg-surface-low',
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.activity_type && <p className="text-[12px] text-error mt-1">Please select an activity type</p>}
      </div>

      {METRIC_CONFIGS.activity.quickAddValues && (
        <div>
          <Label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle block mb-2">
            Quick add
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {METRIC_CONFIGS.activity.quickAddValues.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => handleQuickAdd(min)}
                disabled={!selectedType || logActivity.isPending}
                className={cn(
                  'flex items-center justify-center px-2 py-2 rounded-lg border border-border text-[13px] font-medium transition-colors',
                  !selectedType
                    ? 'opacity-50 cursor-not-allowed bg-surface text-fg-subtle'
                    : 'bg-surface hover:bg-surface-low hover:border-primary/20 text-fg',
                )}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="duration" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Duration (min)
          </Label>
          <Input
            id="duration"
            type="number"
            step="1"
            min="1"
            {...register('duration_minutes', { valueAsNumber: true })}
            className="mt-1.5 tabular-nums"
          />
          {errors.duration_minutes && <p className="text-[12px] text-error mt-1">{errors.duration_minutes.message}</p>}
        </div>
        <div>
          <Label htmlFor="intensity" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Intensity
          </Label>
          <select
            id="intensity"
            {...register('intensity_label')}
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-[14px] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Optional</option>
            {INTENSITY_LABELS.map((label) => (
              <option key={label} value={label}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="calories_burned" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
            Calories (optional)
          </Label>
          <Input
            id="calories_burned"
            type="number"
            step="1"
            min="0"
            placeholder="—"
            {...register('calories_burned', { valueAsNumber: true })}
            className="mt-1.5 tabular-nums"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={logActivity.isPending}
        className="w-full bg-primary hover:bg-primary-container text-on-primary"
      >
        {logActivity.isPending ? 'Saving…' : 'Log activity'}
      </Button>
      {logActivity.error && <p className="text-[12px] text-error">Failed to log activity. Please try again.</p>}
    </form>
  )
}

export function MetricLogForm({ config, date }: MetricLogFormProps) {
  switch (config.type) {
    case 'water':
      return <WaterForm date={date} />
    case 'weight':
      return <WeightForm date={date} />
    case 'sleep':
      return <SleepForm date={date} />
    case 'activity':
      return <ActivityForm date={date} />
  }
}