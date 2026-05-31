import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date parameter required' }, { status: 400 })

  const { data: rollup, error } = await supabase
    .from('daily_rollups')
    .select('date, total_water_ml, weight_kg, sleep_duration_minutes, active_minutes, total_calories_burned')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rollup) {
    return NextResponse.json({
      date,
      total_water_ml: null,
      weight_kg: null,
      sleep_duration_minutes: null,
      active_minutes: null,
      total_calories_burned: null,
    })
  }

  return NextResponse.json(rollup)
}