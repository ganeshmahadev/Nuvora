import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMealLogSchema } from '@/features/meals/schemas/meal.schema'

function parseMealRow(row: any) {
  const { meal_items, ...rest } = row
  return {
    ...rest,
    items: (meal_items ?? []).map((item: any) => {
      const { foods, ...itemRest } = item
      return {
        ...itemRest,
        calories_total: Number(item.calories_total),
        protein_g_total: Number(item.protein_g_total),
        carb_g_total: Number(item.carb_g_total),
        fat_g_total: Number(item.fat_g_total),
        quantity_g: Number(item.quantity_g),
        vitamin_a_iu_total: item.vitamin_a_iu_total != null ? Number(item.vitamin_a_iu_total) : null,
        vitamin_c_mg_total: item.vitamin_c_mg_total != null ? Number(item.vitamin_c_mg_total) : null,
        iron_mg_total: item.iron_mg_total != null ? Number(item.iron_mg_total) : null,
        zinc_mg_total: item.zinc_mg_total != null ? Number(item.zinc_mg_total) : null,
        magnesium_mg_total: item.magnesium_mg_total != null ? Number(item.magnesium_mg_total) : null,
        calcium_mg_total: item.calcium_mg_total != null ? Number(item.calcium_mg_total) : null,
        sodium_mg_total: item.sodium_mg_total != null ? Number(item.sodium_mg_total) : null,
        food: foods ?? null,
      }
    }),
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date parameter required' }, { status: 400 })

  const { data, error } = await supabase
    .from('meal_logs')
    .select('id, user_id, date, meal_type, notes, created_at, updated_at, meal_items(id, meal_log_id, food_id, quantity_g, calories_total, protein_g_total, carb_g_total, fat_g_total, vitamin_a_iu_total, vitamin_c_mg_total, iron_mg_total, zinc_mg_total, magnesium_mg_total, calcium_mg_total, sodium_mg_total, created_at, foods(id, name, brand, calories_per_100g, protein_g, carb_g, fat_g)))')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(parseMealRow))
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createMealLogSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: user.id,
      date: parsed.data.date,
      meal_type: parsed.data.meal_type,
      notes: parsed.data.notes ?? null,
    })
    .select('id, user_id, date, meal_type, notes, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, items: [] }, { status: 201 })
}