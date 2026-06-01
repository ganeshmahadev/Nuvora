'use client'

import { useInsight, useGenerateInsight } from '@/features/insights/hooks/useInsight'
import type { InsightCategory } from '@/lib/api/insights'

interface AiInsightCardProps {
  category: InsightCategory
  title?: string
  icon?: string
  fallbackDescription?: string
}

export function AiInsightCard({
  category,
  title,
  icon = 'auto_awesome',
  fallbackDescription,
}: AiInsightCardProps) {
  const { data: insight, isLoading } = useInsight(category)

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 p-5 rounded-xl relative overflow-hidden animate-pulse">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[oklch(52%_0.150_270)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-[oklch(90%_0.005_260)] rounded-full" />
          <div className="h-3 w-24 bg-[oklch(90%_0.005_260)] rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-[oklch(90%_0.005_260)] rounded" />
          <div className="h-4 w-3/4 bg-[oklch(90%_0.005_260)] rounded" />
        </div>
      </div>
    )
  }

  if (!insight || insight.status === 'insufficient_data') {
    const hintText = insight?.hint || fallbackDescription || 'Keep tracking to unlock personalized insights. We need at least 2 entries to detect patterns.'
    return (
      <div className="bg-surface-container-lowest border border-[oklch(90%_0.005_260)] p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[20px] text-[oklch(70%_0.006_260)]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[oklch(70%_0.006_260)]">
            {title || 'AI Insights'}
          </h3>
        </div>
        <p className="text-[14px] text-[oklch(48%_0.010_260)] leading-relaxed">{hintText}</p>
      </div>
    )
  }

  const insightTitle = insight.title || title || 'AI Insight'
  const insightBody = insight.body || ''
  const recommendation = insight.recommendation || (insight.structured_data as any)?.recommendation

  return (
    <div className="bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 p-5 rounded-xl relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(28,63,231,0.12)]">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[oklch(52%_0.150_270)]/8 rounded-full blur-3xl pointer-events-none" />
      <svg
        className="absolute top-3 right-3 w-5 h-5 text-[oklch(52%_0.150_270)]/30 pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[20px] text-[oklch(52%_0.150_270)]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[oklch(52%_0.150_270)]">
            {insightTitle}
          </h3>
        </div>
        {insightBody && (
          <p className="text-[15px] text-[oklch(14%_0.012_260)] leading-relaxed mb-3">
            {insightBody}
          </p>
        )}
        {recommendation && (
          <div className="border-t border-[oklch(90%_0.005_260)]/50 pt-3">
            <p className="text-[13px] text-[oklch(48%_0.010_260)] italic">
              {recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}