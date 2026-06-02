'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useInsight } from '@/features/insights/hooks/useInsight'
import { useRecentLogs } from '@/features/logs/hooks/useRecentLogs'
import type { LogEntry } from '@/lib/api/logs'

const LOG_CARDS = [
  {
    icon: 'restaurant',
    label: 'Meal',
    description: 'Record nutritional intake and macronutrients.',
    cta: 'Open Log',
    href: '/dashboard/log/meals',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary',
    ctaColor: 'text-primary',
  },
  {
    icon: 'bedtime',
    label: 'Sleep',
    description: 'Log duration, quality, and circadian rhythm.',
    cta: 'Analyze Night',
    href: '/dashboard/log/sleep',
    iconColor: 'text-tertiary-container',
    hoverBorder: 'hover:border-tertiary-container',
    ctaColor: 'text-tertiary-container',
  },
  {
    icon: 'exercise',
    label: 'Activity',
    description: 'Update exertion metrics and movement data.',
    cta: 'Register Movement',
    href: '/dashboard/log/activity',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary',
    ctaColor: 'text-primary',
  },
  {
    icon: 'water_drop',
    label: 'Water',
    description: 'Track daily hydration and fluid intake.',
    cta: 'Log Hydration',
    href: '/dashboard/log/water',
    iconColor: 'text-ai',
    hoverBorder: 'hover:border-ai',
    ctaColor: 'text-ai',
  },
  {
    icon: 'monitor_weight',
    label: 'Weight',
    description: 'Monitor body composition and weight trends.',
    cta: 'Track Weight',
    href: '/dashboard/log/weight',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary',
    ctaColor: 'text-primary',
  },
]

function entryMeta(entry: LogEntry): { icon: string; iconColor: string; label: string; detail: string } {
  switch (entry.type) {
    case 'meal':
      return {
        icon: 'restaurant',
        iconColor: 'text-primary',
        label: entry.items[0]?.food_name ?? capitalize(entry.meal_type),
        detail: capitalize(entry.meal_type),
      }
    case 'water':
      return {
        icon: 'water_drop',
        iconColor: 'text-ai',
        label: 'Water',
        detail: `${entry.amount_ml} ml`,
      }
    case 'sleep':
      return {
        icon: 'bedtime',
        iconColor: 'text-tertiary-container',
        label: 'Sleep',
        detail: `${(entry.duration_minutes / 60).toFixed(1)}h`,
      }
    case 'activity':
      return {
        icon: 'directions_run',
        iconColor: 'text-tertiary-container',
        label: capitalize(entry.activity_type),
        detail: `${entry.duration_minutes} min`,
      }
    case 'weight':
      return {
        icon: 'monitor_weight',
        iconColor: 'text-primary',
        label: 'Weight',
        detail: `${entry.weight_kg} kg`,
      }
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

function formatLogTime(isoStr: string): string {
  const d = new Date(isoStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (isToday) return time
  if (isYesterday) return `Yesterday · ${time}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function LogCard({
  icon,
  label,
  description,
  cta,
  href,
  iconColor,
  hoverBorder,
  ctaColor,
}: (typeof LOG_CARDS)[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative bg-surface border border-border/30 p-8 rounded-xl flex flex-col items-start transition-all duration-300 ${hoverBorder} hover:-translate-y-1`}
    >
      <span
        className={`material-symbols-outlined ${iconColor} mb-6 text-4xl`}
        style={{
          fontVariationSettings: hovered ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
          transition: 'font-variation-settings 0.3s ease',
        }}
      >
        {icon}
      </span>
      <h3 className="text-2xl font-medium text-fg mb-1">{label}</h3>
      <p className="text-base text-fg-muted text-left leading-6">{description}</p>
      <div className={`mt-10 flex items-center ${ctaColor} text-sm font-medium`}>
        <span>{cta}</span>
        <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { data: logsData, isLoading: logsLoading } = useRecentLogs(7)
  const { data: insight, isLoading: insightLoading } = useInsight('daily_gist')

  const recentEntries = useMemo(() => {
    if (!logsData) return []
    return logsData
      .flatMap((day) => day.entries)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [logsData])

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* ── Main Column ── */}
        <div className="lg:col-span-8 flex flex-col justify-center min-h-[60vh]">
          <header className="mb-16 text-center md:text-left">
            <h1 className="text-[40px] leading-[48px] font-semibold tracking-tight text-fg mb-2">
              What are we logging?
            </h1>
            <p className="text-lg text-fg-muted max-w-xl">
              Document your biological state through nutrition, movement, and sleep tracking.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {LOG_CARDS.map((card) => (
              <LogCard key={card.href} {...card} />
            ))}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-4 pt-8 lg:pt-0">
          <div className="bg-surface-low rounded-xl p-10 sticky top-6">

            {/* Recent Logs Header */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-medium text-fg">Recent Logs</h2>
              <Link href="/dashboard/log">
                <span className="material-symbols-outlined text-fg-muted hover:text-primary transition-colors cursor-pointer">
                  history
                </span>
              </Link>
            </div>

            {/* Log Entries */}
            <div className="space-y-10">
              {logsLoading && (
                <>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-6 animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-border/40 flex-shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-3.5 bg-border/40 rounded w-3/4" />
                        <div className="h-3 bg-border/30 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!logsLoading && recentEntries.length === 0 && (
                <p className="text-sm text-fg-subtle italic">No entries yet. Start logging above.</p>
              )}

              {!logsLoading &&
                recentEntries.map((entry) => {
                  const { icon, iconColor, label, detail } = entryMeta(entry)
                  return (
                    <div key={entry.id} className="flex gap-6 group cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-full flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                        <span className={`material-symbols-outlined ${iconColor} text-xl`}>{icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-fg">{label}</span>
                        <span className="text-sm text-fg-muted">
                          {formatLogTime(entry.created_at)} · {detail}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* AI Insight */}
            <div
              className="mt-16 p-6 bg-surface rounded-xl"
              style={{
                boxShadow: '0 10px 30px -10px rgba(28, 63, 231, 0.1)',
                border: '1px solid rgba(28, 63, 231, 0.15)',
              }}
            >
              <div className="flex items-center gap-3 mb-3 text-ai">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider">AI Insight</span>
              </div>

              {insightLoading && (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-border/40 rounded w-full" />
                  <div className="h-3 bg-border/40 rounded w-5/6" />
                  <div className="h-3 bg-border/40 rounded w-4/6" />
                </div>
              )}

              {!insightLoading && (!insight || insight.status === 'insufficient_data') && (
                <p className="text-sm text-fg-muted italic">
                  Keep logging your daily health data and we&apos;ll surface a personalised daily
                  gist here.
                </p>
              )}

              {!insightLoading && insight?.status === 'complete' && insight.body && (
                <p className="text-sm text-fg-muted italic">&quot;{insight.body}&quot;</p>
              )}
            </div>

            {/* View History */}
            <Link
              href="/dashboard/log"
              className="w-full mt-10 py-6 border-b border-border text-fg-muted text-sm font-medium hover:text-primary transition-colors flex justify-between items-center"
            >
              View Full History
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
