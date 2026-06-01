export type InsightCategory =
  | 'daily_gist'
  | 'sleep_hygiene'
  | 'activity_recommendation'
  | 'water_hydration'
  | 'weight_trend'
  | 'meal_nutrition'

export interface InsightResponse {
  id?: string
  status: 'complete' | 'insufficient_data' | 'pending' | 'failed'
  category: InsightCategory
  title?: string
  body?: string
  recommendation?: string
  structured_data?: Record<string, unknown> | null
  generation_status?: string
  reference_date?: string | null
  created_at?: string
  from_cache?: boolean
  log_count?: number
  min_required?: number
  hint?: string
}

export async function getLatestInsight(category: InsightCategory): Promise<InsightResponse> {
  const res = await fetch(`/api/insights/latest?category=${encodeURIComponent(category)}`)
  if (!res.ok) {
    return {
      status: 'insufficient_data',
      category,
      hint: 'Unable to load insights right now.',
    }
  }
  return res.json()
}

export async function generateInsight(
  category: InsightCategory,
  referenceDate?: string,
  forceRegenerate = false,
): Promise<InsightResponse> {
  const res = await fetch('/api/insights/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      reference_date: referenceDate,
      force_regenerate: forceRegenerate,
    }),
  })
  if (!res.ok) {
    return {
      status: 'insufficient_data',
      category,
      hint: 'Unable to generate insights right now.',
    }
  }
  return res.json()
}