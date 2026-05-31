import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logSleepSchema } from '@/features/metrics/schemas/metric.schema'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 100)

  let query = supabase
    .from('sleep_logs')
    .select('id, user_id, date, bed_time, wake_time, duration_minutes, subjective_quality, notes, created_at, updated_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = logSleepSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert({
      user_id: user.id,
      date: parsed.data.date,
      bed_time: parsed.data.bed_time,
      wake_time: parsed.data.wake_time,
      subjective_quality: parsed.data.subjective_quality ?? null,
      notes: parsed.data.notes ?? null,
      source: 'manual',
    }, { onConflict: 'user_id,date' })
    .select('id, user_id, date, bed_time, wake_time, duration_minutes, subjective_quality, notes, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}