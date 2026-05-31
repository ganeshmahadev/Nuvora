import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateFoodSchema } from '@/features/foods/schemas/food.schema'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = updateFoodSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('foods')
    .select('id, created_by')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: updated, error } = await supabase
    .from('foods')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing, error: fetchError } = await supabase
    .from('foods')
    .select('id, created_by')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (existing.created_by === null) return NextResponse.json({ error: 'Cannot delete global food' }, { status: 403 })

  const { error } = await supabase.from('foods').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}