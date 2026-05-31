'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { MetricConfig, MetricType } from '@/lib/config/metrics.config'
import {
  useMetricHistory,
  useDeleteMetric,
  type WaterEntry,
  type WeightEntry,
  type SleepEntry,
  type ActivityEntry,
} from '@/features/metrics/hooks/useMetricLog'

interface MetricHistoryTableProps {
  config: MetricConfig
  date: string
}

function formatValue(type: MetricType, entry: any): string {
  switch (type) {
    case 'water':
      return `${(entry as WaterEntry).amount_ml} ml`
    case 'weight':
      return `${(entry as WeightEntry).weight_kg} kg`
    case 'sleep': {
      const s = entry as SleepEntry
      const hrs = Math.floor(s.duration_minutes / 60)
      const mins = s.duration_minutes % 60
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
    }
    case 'activity': {
      const a = entry as ActivityEntry
      return `${a.duration_minutes} min${a.intensity_label ? ` · ${a.intensity_label}` : ''}`
    }
  }
}

function formatTimestamp(type: MetricType, entry: any): string {
  switch (type) {
    case 'water': {
      const d = new Date((entry as WaterEntry).logged_at)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    case 'sleep': {
      const s = entry as SleepEntry
      return `${s.bed_time.slice(0, 5)} – ${s.wake_time.slice(0, 5)}`
    }
    default:
      return new Date((entry as any).date).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

export function MetricHistoryTable({ config, date }: MetricHistoryTableProps) {
  const sevenDaysAgo = new Date(date)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const from = sevenDaysAgo.toISOString().split('T')[0]

  const { data: entries, isLoading } = useMetricHistory(config.type, from, date)
  const deleteMutation = useDeleteMetric(config.type)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      deleteMutation.mutate(id, { onSuccess: () => setConfirmDeleteId(null) })
    } else {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-[13px] text-fg-muted">
        Loading history…
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="py-8 text-center text-[13px] text-fg-muted">
        No {config.label.toLowerCase()} entries yet.
      </div>
    )
  }

  const displayEntries = (entries as any[]).slice(0, 7)

  return (
    <div className="space-y-0.5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle mb-2">
        Recent entries
      </p>
      {displayEntries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-low transition-colors group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-fg">
              {formatValue(config.type, entry)}
            </p>
            <p className="text-[12px] text-fg-subtle">
              {formatTimestamp(config.type, entry)}
              {entry.notes && (
                <span className="ml-1.5 text-fg-muted">· {entry.notes}</span>
              )}
              {config.type === 'sleep' && (entry as SleepEntry).subjective_quality && (
                <span className="ml-1.5 text-primary">
                  Quality: {(entry as SleepEntry).subjective_quality}/10
                </span>
              )}
              {config.type === 'activity' && (entry as ActivityEntry).activity_type && (
                <span className="ml-1.5 text-fg-muted">
                  {(entry as ActivityEntry).activity_type}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(entry.id)}
            className={cn(
              'px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0',
              confirmDeleteId === entry.id
                ? 'bg-error/10 text-error hover:bg-error/20'
                : 'opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-error hover:bg-surface-container',
            )}
          >
            {confirmDeleteId === entry.id ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  )
}