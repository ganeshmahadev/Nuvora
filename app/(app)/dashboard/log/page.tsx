'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { METRIC_CONFIGS, type MetricType } from '@/lib/config/metrics.config'
import { useTodayMetrics } from '@/features/metrics/hooks/useMetricLog'

const LOG_CARDS: Array<{
  type: MetricType
  label: string
  href: string
  icon: string
  color: string
  getValue: (metrics: ReturnType<typeof useTodayMetrics>['data']) => string | null
}> = [
  {
    type: 'water',
    label: 'Water',
    href: '/dashboard/log/water',
    icon: 'water_drop',
    color: 'bg-ai/10 text-ai',
    getValue: (data) => data?.total_water_ml != null ? `${data.total_water_ml} / 2500 ml` : null,
  },
  {
    type: 'sleep',
    label: 'Sleep',
    href: '/dashboard/log/sleep',
    icon: 'bedtime',
    color: 'bg-ai/10 text-ai',
    getValue: (data) => {
      if (data?.sleep_duration_minutes == null) return null
      const hrs = Math.floor(data.sleep_duration_minutes / 60)
      const mins = data.sleep_duration_minutes % 60
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
    },
  },
  {
    type: 'activity',
    label: 'Activity',
    href: '/dashboard/log/activity',
    icon: 'directions_run',
    color: 'bg-primary/10 text-primary',
    getValue: (data) => data?.active_minutes != null ? `${data.active_minutes} min` : null,
  },
  {
    type: 'weight',
    label: 'Weight',
    href: '/dashboard/log/weight',
    icon: 'monitor_weight',
    color: 'bg-warning-soft text-warning',
    getValue: (data) => data?.weight_kg != null ? `${data.weight_kg} kg` : null,
  },
]

export default function LogHubPage() {
  const { data: metrics } = useTodayMetrics()

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg mb-1">Log</h1>
      <p className="text-[15px] text-fg-muted mb-6">What did you track today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/log/meals"
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border border-border bg-surface',
            'hover:bg-surface-low hover:border-primary/20 transition-all group',
          )}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              restaurant
            </span>
          </div>
          <div>
            <p className="text-[15px] font-medium text-fg group-hover:text-primary transition-colors">
              Meal
            </p>
          </div>
        </Link>

        {LOG_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border border-border bg-surface',
              'hover:bg-surface-low hover:border-primary/20 transition-all group',
            )}
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.color)}>
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-[15px] font-medium text-fg group-hover:text-primary transition-colors">
                {card.label}
              </p>
              {card.getValue(metrics) && (
                <p className="text-[12px] text-fg-subtle tabular-nums">
                  {card.getValue(metrics)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}