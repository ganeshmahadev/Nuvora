export interface DayLog {
  date: string
  entries: LogEntry[]
  summary: DaySummary | null
}

export type LogEntry =
  | WaterLogEntry
  | WeightLogEntry
  | SleepLogEntry
  | ActivityLogEntry
  | MealLogEntry

export interface WaterLogEntry {
  type: 'water'
  id: string
  amount_ml: number
  created_at: string
}

export interface WeightLogEntry {
  type: 'weight'
  id: string
  weight_kg: number
  notes: string | null
  created_at: string
}

export interface SleepLogEntry {
  type: 'sleep'
  id: string
  bed_time: string
  wake_time: string
  duration_minutes: number
  quality: number | null
  notes: string | null
  created_at: string
}

export interface ActivityLogEntry {
  type: 'activity'
  id: string
  activity_type: string
  duration_minutes: number
  calories_burned: number | null
  intensity: string | null
  notes: string | null
  created_at: string
}

export interface MealLogEntry {
  type: 'meal'
  id: string
  meal_type: string
  notes: string | null
  items: Array<{
    id: string
    food_name: string
    quantity_g: number
    calories_total: number
    protein_g_total: number
    carb_g_total: number
    fat_g_total: number
  }>
  created_at: string
}

export interface DaySummary {
  total_calories: number
  total_protein_g: number
  total_carb_g: number
  total_fat_g: number
  total_water_ml: number
  sleep_minutes: number | null
  active_minutes: number
  weight_kg: number | null
}

export async function getRecentLogs(from?: string, to?: string, limit?: number): Promise<DayLog[]> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (limit) params.set('limit', String(limit))
  const res = await fetch(`/api/logs/recent?${params}`)
  if (!res.ok) throw new Error('Failed to fetch recent logs')
  return res.json()
}