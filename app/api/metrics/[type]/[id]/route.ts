import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { MetricType } from '@/lib/config/metrics.config'

const METRIC_TABLES: Record<MetricType, string> = {
  water: 'water_logs',
  weight: 'weight_logs',
  sleep: 'sleep_logs',
  activity: 'activity_logs',
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params

  if (!Object.keys(METRIC_TABLES).includes(type)) {
    return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const table = METRIC_TABLES[type as MetricType]

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 204 })
}