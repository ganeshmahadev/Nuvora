import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { FOOD_SELECT_FIELDS } from '@/lib/api/foods'

interface FoodRow {
  id: string
  name: string
  brand: string | null
  calories_per_100g: number
  protein_g: number
  carb_g: number
  fat_g: number
  fiber_g: number | null
  sodium_mg: number | null
  vitamin_a_iu: number | null
  vitamin_c_mg: number | null
  iron_mg: number | null
  zinc_mg: number | null
  magnesium_mg: number | null
  calcium_mg: number | null
  potassium_mg: number | null
  sugar_g: number | null
  created_by: string | null
  is_verified: boolean
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '15', 10), 50)

  let query = supabase
    .from('foods')
    .select(FOOD_SELECT_FIELDS)
    .or(`created_by.is.null,created_by.eq.${user.id}`)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, error } = await query.order('name').limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sorted = ((data ?? []) as unknown as FoodRow[]).sort((a, b) => {
    const aCustom = a.created_by !== null ? 0 : 1
    const bCustom = b.created_by !== null ? 0 : 1
    return aCustom - bCustom
  })

  return NextResponse.json(sorted)
}