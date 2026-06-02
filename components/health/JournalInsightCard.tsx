'use client'

import { AiInsightCard } from '@/components/health/AiInsightCard'

export function JournalInsightCard() {
  return (
    <div className="relative pl-0 md:pl-12">
      <AiInsightCard
        category="daily_gist"
        title="Daily Health Gist"
        icon="auto_awesome"
        fallbackDescription="Keep tracking consistently and we'll surface personalized patterns across your sleep, activity, and nutrition data."
      />
    </div>
  )
}