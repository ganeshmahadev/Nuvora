import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFoodSchema } from '@/features/foods/schemas/food.schema'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createFoodSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const row = {
    name: data.name,
    brand: data.brand ?? null,
    calories_per_100g: data.calories_per_100g,
    protein_g: data.protein_g,
    carb_g: data.carb_g,
    fat_g: data.fat_g,
    fiber_g: data.fiber_g ?? null,
    sodium_mg: data.sodium_mg ?? null,
    vitamin_a_iu: data.vitamin_a_iu ?? null,
    vitamin_c_mg: data.vitamin_c_mg ?? null,
    iron_mg: data.iron_mg ?? null,
    zinc_mg: data.zinc_mg ?? null,
    magnesium_mg: data.magnesium_mg ?? null,
    calcium_mg: data.calcium_mg ?? null,
    potassium_mg: data.potassium_mg ?? null,
    sugar_g: data.sugar_g ?? null,
    created_by: user.id,
    is_verified: false,
  }

  const { data: inserted, error } = await supabase
    .from('foods')
    .insert(row)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(inserted, { status: 201 })
}