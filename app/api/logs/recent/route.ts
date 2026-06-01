import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '7', 10), 30)

  const today = new Date()
  const fromDate = from ?? new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0]
  const toDate = to ?? today.toISOString().split('T')[0]

  const [waterLogs, weightLogs, sleepLogs, activityLogs, mealLogs, rollups] = await Promise.all([
    supabase.from('water_logs').select('id, date, amount_ml, created_at').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('created_at', { ascending: false }),
    supabase.from('weight_logs').select('id, date, weight_kg, notes, created_at').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('date', { ascending: false }),
    supabase.from('sleep_logs').select('id, date, bed_time, wake_time, duration_minutes, subjective_quality, notes, created_at').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('date', { ascending: false }),
    supabase.from('activity_logs').select('id, date, activity_type, duration_minutes, calories_burned, intensity_label, notes, created_at').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('date', { ascending: false }),
    supabase.from('meal_logs').select('id, date, meal_type, notes, created_at, meal_items(id, food_id, quantity_g, calories_total, protein_g_total, carb_g_total, fat_g_total, foods(id, name)))').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('created_at', { ascending: false }),
    supabase.from('daily_rollups').select('date, total_calories, total_protein_g, total_carb_g, total_fat_g, total_water_ml, sleep_duration_minutes, active_minutes, weight_kg').eq('user_id', user.id).gte('date', fromDate).lte('date', toDate).order('date', { ascending: false }),
  ])

  const days: Record<string, any> = {}

  function ensureDay(date: string) {
    if (!days[date]) {
      days[date] = { date, entries: [], summary: null }
    }
    return days[date]
  }

  for (const w of (waterLogs.data ?? []) as any[]) {
    const d = ensureDay(w.date)
    d.entries.push({ type: 'water', id: w.id, amount_ml: Number(w.amount_ml), created_at: w.created_at })
  }

  for (const w of (weightLogs.data ?? []) as any[]) {
    const d = ensureDay(w.date)
    d.entries.push({ type: 'weight', id: w.id, weight_kg: Number(w.weight_kg), notes: w.notes, created_at: w.created_at })
  }

  for (const s of (sleepLogs.data ?? []) as any[]) {
    const d = ensureDay(s.date)
    d.entries.push({
      type: 'sleep', id: s.id, bed_time: s.bed_time, wake_time: s.wake_time,
      duration_minutes: s.duration_minutes, quality: s.subjective_quality, notes: s.notes,
      created_at: s.created_at,
    })
  }

  for (const a of (activityLogs.data ?? []) as any[]) {
    const d = ensureDay(a.date)
    d.entries.push({
      type: 'activity', id: a.id, activity_type: a.activity_type,
      duration_minutes: a.duration_minutes, calories_burned: a.calories_burned,
      intensity: a.intensity_label, notes: a.notes, created_at: a.created_at,
    })
  }

  for (const m of (mealLogs.data ?? []) as any[]) {
    const items = (m.meal_items ?? []).map((item: any) => ({
      id: item.id,
      food_name: item.foods?.name ?? 'Unknown',
      quantity_g: Number(item.quantity_g),
      calories_total: Number(item.calories_total),
      protein_g_total: Number(item.protein_g_total),
      carb_g_total: Number(item.carb_g_total),
      fat_g_total: Number(item.fat_g_total),
    }))
    const d = ensureDay(m.date)
    d.entries.push({
      type: 'meal', id: m.id, meal_type: m.meal_type, notes: m.notes,
      items, created_at: m.created_at,
    })
  }

  for (const r of (rollups.data ?? []) as any[]) {
    const d = ensureDay(r.date)
    d.summary = {
      total_calories: Number(r.total_calories ?? 0),
      total_protein_g: Number(r.total_protein_g ?? 0),
      total_carb_g: Number(r.total_carb_g ?? 0),
      total_fat_g: Number(r.total_fat_g ?? 0),
      total_water_ml: r.total_water_ml ?? 0,
      sleep_minutes: r.sleep_duration_minutes ?? null,
      active_minutes: r.active_minutes ?? 0,
      weight_kg: r.weight_kg != null ? Number(r.weight_kg) : null,
    }
  }

  const sortedDays = Object.values(days).sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, limit)

  return NextResponse.json(sortedDays)
}