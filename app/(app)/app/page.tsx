'use client'

import Link from 'next/link'
import { useTodayMetrics } from '@/features/metrics/hooks/useMetricLog'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { AiInsightCard } from '@/components/health/AiInsightCard'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

function useGreeting() {
  const [name, setName] = useState<string>('')
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setName(data?.full_name ?? user.email?.split('@')[0] ?? 'there')
        })
    })
  }, [])
  return name
}

const QUICK_LINKS = [
  { label: 'Log Meals', href: '/dashboard/log/meals', icon: 'restaurant', color: 'text-primary' },
  { label: 'Log Water', href: '/dashboard/log/water', icon: 'water_drop', color: 'text-[oklch(52%_0.150_270)]' },
  { label: 'Log Sleep', href: '/dashboard/log/sleep', icon: 'bedtime', color: 'text-[oklch(52%_0.150_270)]' },
  { label: 'Log Activity', href: '/dashboard/log/activity', icon: 'directions_run', color: 'text-primary' },
]

export default function HomePage() {
  const name = useGreeting()
  const { data: metrics } = useTodayMetrics()
  const { data: profile } = useProfile()

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const waterTarget = profile?.water_target_ml ?? 2500
  const waterPct = Math.min(Math.round(((metrics?.total_water_ml ?? 0) / waterTarget) * 100), 100)

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1280px] mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-[13px] font-medium text-fg-subtle mb-0.5">{today}</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-fg">
          {name ? `Good ${getTimeOfDay()}, ${name.split(' ')[0]}.` : ''}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Metric tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricTile
              icon="water_drop"
              label="Hydration"
              value={`${Math.round(metrics?.total_water_ml ?? 0)} ml`}
              sub={`${waterPct}% of goal`}
              iconColor="text-[oklch(52%_0.150_270)]"
            />
            <MetricTile
              icon="bedtime"
              label="Sleep"
              value={metrics?.sleep_duration_minutes ? `${(metrics.sleep_duration_minutes / 60).toFixed(1)}h` : '—'}
              sub={metrics?.sleep_duration_minutes ? 'Last night' : 'Not logged'}
              iconColor="text-[oklch(52%_0.150_270)]"
            />
            <MetricTile
              icon="local_fire_department"
              label="Calories burned"
              value={metrics?.total_calories_burned ? `${Math.round(metrics.total_calories_burned)}` : '—'}
              sub="kcal from activity"
              iconColor="text-warning"
            />
            <MetricTile
              icon="monitor_weight"
              label="Weight"
              value={metrics?.weight_kg ? `${metrics.weight_kg} kg` : '—'}
              sub="Latest reading"
              iconColor="text-[oklch(68%_0.180_80)]"
            />
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle mb-3">
              Quick log
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface hover:bg-surface-low hover:border-primary/30 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[28px] ${link.color}`}
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    {link.icon}
                  </span>
                  <span className="text-[13px] font-medium text-fg-muted text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* AI insight */}
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle mb-3">
            Latest insight
          </p>
          <AiInsightCard
            category="water_hydration"
            title="Hydration"
            icon="water_drop"
            fallbackDescription="Log your meals, water, and activities and we'll surface personalised health insights here."
          />
        </div>
      </div>
    </div>
  )
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: string
  label: string
  value: string
  sub: string
  iconColor: string
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <span
        className={`material-symbols-outlined text-[22px] ${iconColor} mb-2 block`}
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        {icon}
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle mb-1">{label}</p>
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-fg leading-none">{value}</p>
      <p className="text-[11px] text-fg-subtle mt-0.5">{sub}</p>
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
