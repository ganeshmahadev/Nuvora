'use client'

import { AiInsightCard } from '@/components/health/AiInsightCard'

export function JournalInsightCard() {
  return (
    <div className="relative pl-0 md:pl-12">
      <AiInsightCard
        category="daily_gist"
        title="Nutritional Congruence Detected"
        icon="auto_awesome"
        fallbackDescription="Your nutritional data shows emerging patterns. Keep tracking consistently and we'll identify correlations between your sleep, activity, and nutrition data."
      />
    </div>
  )
}