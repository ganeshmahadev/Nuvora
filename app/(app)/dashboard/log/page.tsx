'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const LOG_CARDS = [
  { label: 'Meal', href: '/dashboard/log/meals', icon: 'restaurant', color: 'bg-primary/10 text-primary' },
  { label: 'Water', href: '/dashboard/log/water', icon: 'water_drop', color: 'bg-ai/10 text-ai' },
  { label: 'Sleep', href: '/dashboard/log/sleep', icon: 'bedtime', color: 'bg-ai/10 text-ai' },
  { label: 'Activity', href: '/dashboard/log/activity', icon: 'directions_run', color: 'bg-primary/10 text-primary' },
  { label: 'Weight', href: '/dashboard/log/weight', icon: 'monitor_weight', color: 'bg-warning-soft text-warning' },
]

export default function LogHubPage() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg mb-1">Log</h1>
      <p className="text-[15px] text-fg-muted mb-6">What did you track today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LOG_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border border-border bg-surface',
              'hover:bg-surface-low hover:border-primary/20 transition-all',
              'group',
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}