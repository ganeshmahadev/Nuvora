import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: mealLogId, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mealLog } = await supabase
    .from('meal_logs')
    .select('id, user_id')
    .eq('id', mealLogId)
    .eq('user_id', user.id)
    .single()

  if (!mealLog) return NextResponse.json({ error: 'Meal log not found' }, { status: 404 })

  const { error } = await supabase
    .from('meal_items')
    .delete()
    .eq('id', itemId)
    .eq('meal_log_id', mealLogId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}