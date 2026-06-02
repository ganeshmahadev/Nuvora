import type { MetricType } from '@/lib/config/metrics.config'

export interface WaterEntry {
  id: string
  user_id: string
  date: string
  amount_ml: number
  logged_at: string
  created_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  date: string
  weight_kg: number
  notes: string | null
  created_at: string
}

export interface SleepEntry {
  id: string
  user_id: string
  date: string
  bed_time: string
  wake_time: string
  duration_minutes: number
  subjective_quality: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ActivityEntry {
  id: string
  user_id: string
  date: string
  activity_type: string
  duration_minutes: number
  calories_burned: number | null
  intensity_label: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type MetricEntry = WaterEntry | WeightEntry | SleepEntry | ActivityEntry

export interface DailyMetrics {
  date: string
  total_water_ml: number | null
  weight_kg: number | null
  sleep_duration_minutes: number | null
  active_minutes: number | null
  total_calories_burned: number | null
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error ?? 'Request failed')
  }
  if (res.status === 204) return undefined
  return res.json()
}

export async function getMetricHistory(
  type: MetricType,
  from: string,
  to: string,
  limit = 30,
): Promise<MetricEntry[]> {
  return apiFetch(`/api/metrics/${type}?from=${from}&to=${to}&limit=${limit}`)
}

export async function logWater(data: { date: string; amount_ml: number }): Promise<WaterEntry> {
  return apiFetch('/api/metrics/water', { method: 'POST', body: JSON.stringify(data) })
}

export async function logWeight(data: { date: string; weight_kg: number; notes?: string | null }): Promise<WeightEntry> {
  return apiFetch('/api/metrics/weight', { method: 'POST', body: JSON.stringify(data) })
}

export async function logSleep(data: {
  date: string
  bed_time: string
  wake_time: string
  subjective_quality?: number | null
  notes?: string | null
}): Promise<SleepEntry> {
  return apiFetch('/api/metrics/sleep', { method: 'POST', body: JSON.stringify(data) })
}

export async function logActivity(data: {
  date: string
  activity_type: string
  duration_minutes: number
  intensity_label?: string | null
  calories_burned?: number | null
  notes?: string | null
}): Promise<ActivityEntry> {
  return apiFetch('/api/metrics/activity', { method: 'POST', body: JSON.stringify(data) })
}

export async function deleteMetric(type: MetricType, id: string): Promise<void> {
  await apiFetch(`/api/metrics/${type}/${id}`, { method: 'DELETE' })
}

export async function getTodayMetrics(): Promise<DailyMetrics | null> {
  const today = new Date().toLocaleDateString('en-CA')
  try {
    return await apiFetch(`/api/metrics/today?date=${today}`)
  } catch {
    return null
  }
}