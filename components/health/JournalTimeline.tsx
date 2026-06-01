'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecentLogs, type DayLog, type LogEntry } from '@/lib/api/logs'
import { JournalInsightCard } from '@/components/health/JournalInsightCard'
import { cn } from '@/lib/utils'

const ENTRY_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  meal: { icon: 'restaurant', color: 'bg-primary/10 text-primary', label: 'Meal' },
  water: { icon: 'water_drop', color: 'bg-ai/10 text-ai', label: 'Water' },
  sleep: { icon: 'bedtime', color: 'bg-ai/10 text-ai', label: 'Sleep' },
  activity: { icon: 'directions_run', color: 'bg-primary/10 text-primary', label: 'Activity' },
  weight: { icon: 'monitor_weight', color: 'bg-warning-soft text-warning', label: 'Weight' },
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

function formatEntryTitle(entry: LogEntry): string {
  switch (entry.type) {
    case 'meal':
      return entry.items?.[0]?.food_name ?? MEAL_TYPE_LABELS[entry.meal_type] ?? 'Meal'
    case 'water':
      return `${entry.amount_ml} ml`
    case 'sleep': {
      const hrs = Math.floor(entry.duration_minutes / 60)
      const mins = entry.duration_minutes % 60
      return mins > 0 ? `${hrs}h ${mins}m sleep` : `${hrs}h sleep`
    }
    case 'activity':
      return entry.activity_type
    case 'weight':
      return `${entry.weight_kg} kg`
    default:
      return ''
  }
}

function formatEntrySubtitle(entry: LogEntry): string | null {
  switch (entry.type) {
    case 'meal': {
      const items = entry.items ?? []
      if (items.length === 0) return null
      const total = items.reduce((s, i) => s + i.calories_total, 0)
      return `${total} kcal · ${items.length} item${items.length > 1 ? 's' : ''}`
    }
    case 'sleep':
      return entry.quality != null ? `Quality: ${entry.quality}/10` : null
    case 'activity':
      return `${entry.duration_minutes} min${entry.intensity ? ` · ${entry.intensity}` : ''}`
    case 'water':
      return null
    case 'weight':
      return entry.notes ?? null
    default:
      return null
  }
}

function formatEntryValue(entry: LogEntry): string | null {
  switch (entry.type) {
    case 'meal': {
      const items = entry.items ?? []
      if (items.length === 0) return null
      return `${items.reduce((s, i) => s + i.calories_total, 0)} kcal`
    }
    case 'activity':
      return entry.calories_burned != null ? `-${entry.calories_burned} kcal` : null
    case 'sleep':
      return entry.quality != null ? `${entry.quality}%` : null
    default:
      return null
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

interface DayLogCardProps {
  day: DayLog
}

function DayLogCard({ day }: DayLogCardProps) {
  return (
    <div className="relative pl-0 md:pl-12">
      <div className="hidden md:block absolute left-0 top-6 w-[37px] h-[37px] bg-surface border-2 border-primary rounded-full z-10 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full" />
      </div>

      <div className="border border-[oklch(95%_0.005_90)] rounded-xl p-4 md:p-6 bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="md:w-1/3">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[oklch(14%_0.012_260)] leading-none">
                {formatDateFull(day.date)}
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[oklch(70%_0.006_260)] opacity-60">
                {formatDate(day.date)}
              </span>
            </div>

            {day.summary && (
              <div className="grid grid-cols-2 gap-3 border-t border-[oklch(90%_0.005_260)] pt-3 mt-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[oklch(70%_0.006_260)] block mb-0.5">Net Calories</span>
                  <span className="text-[28px] font-light tabular-nums text-primary leading-none">{day.summary.total_calories.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[oklch(70%_0.006_260)] block mb-0.5">Active Burn</span>
                  <span className="text-[28px] font-light tabular-nums text-[oklch(52%_0.150_270)] leading-none">{day.summary.active_minutes}</span>
                  <span className="text-[12px] text-[oklch(70%_0.006_260)]"> min</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            {day.entries.slice(0, 5).map((entry) => {
              const meta = ENTRY_ICONS[entry.type] ?? ENTRY_ICONS.meal
              return (
                <div key={entry.id} className="p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group/item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 flex items-center justify-center rounded-lg', meta.color)}>
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                        >
                          {meta.icon}
                        </span>
                      </div>
                      <div>
                        <span className="text-[14px] font-medium text-[oklch(14%_0.012_260)] block truncate max-w-[200px]">
                          {formatEntryTitle(entry)}
                        </span>
                        {formatEntrySubtitle(entry) && (
                          <span className="text-[12px] text-[oklch(70%_0.006_260)] opacity-60 block">
                            {formatEntrySubtitle(entry)}
                          </span>
                        )}
                      </div>
                    </div>
                    {formatEntryValue(entry) && (
                      <div className="text-right">
                        <span className="text-[14px] tabular-nums text-[oklch(14%_0.012_260)]">
                          {formatEntryValue(entry)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {day.entries.length > 5 && (
              <button className="w-full py-1.5 text-[11px] font-semibold text-primary flex items-center justify-center gap-1 hover:bg-primary/10 rounded transition-colors">
                <span>Expand {day.entries.length - 5} more entries</span>
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  expand_more
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface JournalTimelineProps {
  filter?: string
}

export function JournalTimeline({ filter }: JournalTimelineProps) {
  const { data: days, isLoading, error, refetch } = useQuery({
    queryKey: ['logs', 'recent', filter],
    queryFn: () => getRecentLogs(),
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="border border-[oklch(95%_0.005_90)] rounded-xl p-6 bg-surface-container-lowest animate-pulse">
            <div className="h-6 bg-surface-container rounded w-48 mb-4" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-16 bg-surface-container rounded" />
              <div className="h-16 bg-surface-container rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-surface-container rounded" />
              <div className="h-12 bg-surface-container rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-fg-muted">Failed to load logs.</p>
        <button onClick={() => refetch()} className="text-[13px] text-primary mt-2">Try again</button>
      </div>
    )
  }

  const filteredDays = (days ?? []).map((day) => {
    if (!filter) return day
    return {
      ...day,
      entries: day.entries.filter((e: LogEntry) => e.type === filter),
    }
  }).filter((day: DayLog) => day.entries.length > 0 || day.summary)

  if (filteredDays.length === 0) {
    return (
      <div className="text-center py-12">
        <span
          className="material-symbols-outlined text-[48px] text-fg-subtle mb-3 block"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
        >
          edit_note
        </span>
        <p className="text-[15px] font-medium text-fg mb-1">No logs yet</p>
        <p className="text-[13px] text-fg-muted">Start tracking to see your journal.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      <div className="hidden md:block absolute left-[18px] top-4 bottom-4 w-px bg-[oklch(90%_0.005_260)] opacity-50" />
      {filteredDays.map((day: DayLog, index: number) => (
        <div key={day.date}>
          <DayLogCard day={day} />
          {index === 0 && (
            <div className="relative pl-0 md:pl-12 mt-6">
              <JournalInsightCard />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}