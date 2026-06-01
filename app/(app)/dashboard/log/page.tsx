'use client'

import { useState } from 'react'
import { JournalTimeline } from '@/components/health/JournalTimeline'

const CATEGORIES = [
  { key: '', label: 'All', icon: 'check' },
  { key: 'meal', label: 'Meals', icon: 'restaurant' },
  { key: 'water', label: 'Water', icon: 'water_drop' },
  { key: 'sleep', label: 'Sleep', icon: 'bedtime' },
  { key: 'activity', label: 'Activity', icon: 'directions_run' },
  { key: 'weight', label: 'Weight', icon: 'monitor_weight' },
]

export default function LogHubPage() {
  const [activeCategory, setActiveCategory] = useState('')

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
          Journal Archives
        </h1>
        <p className="text-[18px] text-[oklch(48%_0.010_260)] mt-1 max-w-2xl">
          A rhythmic record of your biological narrative.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? 'bg-[oklch(14%_0.012_260)] text-white'
                : 'border border-[oklch(90%_0.005_260)] text-[oklch(48%_0.010_260)] hover:bg-surface-container transition-colors'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: activeCategory === cat.key ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      <JournalTimeline filter={activeCategory || undefined} />
    </div>
  )
}