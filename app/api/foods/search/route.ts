import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { FoodItem } from '@/lib/api/foods'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '15', 10), 50)

  let query = supabase
    .from('foods')
    .select('id, name, brand, calories_per_100g, protein_g, carb_g, fat_g, fiber_g, sodium_mg, created_by, is_verified')
    .or(`created_by.is.null,created_by.eq.${user.id}`)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, error } = await query.order('name').limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sort: user's custom foods first, then global catalog
  const sorted = (data as FoodItem[]).sort((a, b) => {
    const aCustom = a.created_by !== null ? 0 : 1
    const bCustom = b.created_by !== null ? 0 : 1
    return aCustom - bCustom
  })

  return NextResponse.json(sorted)
}
