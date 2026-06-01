'use client'

import { AiInsightCard } from '@/components/health/AiInsightCard'
import type { InsightCategory } from '@/lib/api/insights'

const INSIGHT_CATEGORIES: { category: InsightCategory; title: string; icon: string; fallback: string }[] = [
  {
    category: 'meal_nutrition',
    title: 'Meal Nutrition',
    icon: 'restaurant',
    fallback: "Log meals consistently and we'll analyse your macro balance, meal timing, and nutritional patterns.",
  },
  {
    category: 'water_hydration',
    title: 'Hydration',
    icon: 'water_drop',
    fallback: "Track your daily water intake and we'll identify patterns in timing, amounts, and consistency.",
  },
  {
    category: 'sleep_hygiene',
    title: 'Sleep Quality',
    icon: 'bedtime',
    fallback: "Log your sleep and we'll analyse your duration, quality, and bedtime consistency.",
  },
  {
    category: 'activity_recommendation',
    title: 'Activity',
    icon: 'directions_run',
    fallback: "Log activities and we'll analyse your training patterns, recovery needs, and suggest optimal training windows.",
  },
  {
    category: 'weight_trend',
    title: 'Weight Trend',
    icon: 'monitor_weight',
    fallback: "Log your weight consistently and we'll identify trends and provide context around your changes.",
  },
]

export default function InsightsPage() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-[24px] text-ai"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            auto_awesome
          </span>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg">AI Insights</h1>
        </div>
        <p className="text-[15px] text-fg-muted">
          Personalised analysis across all your health metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {INSIGHT_CATEGORIES.map(({ category, title, icon, fallback }) => (
          <AiInsightCard
            key={category}
            category={category}
            title={title}
            icon={icon}
            fallbackDescription={fallback}
          />
        ))}
      </div>
    </div>
  )
}
