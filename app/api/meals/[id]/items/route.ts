import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMealItemSchema } from '@/features/meals/schemas/meal.schema'
import { computeTotals, FOOD_SELECT_FIELDS, type FoodItem } from '@/lib/api/foods'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: mealLogId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = addMealItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: mealLog, error: mealError } = await supabase
    .from('meal_logs')
    .select('id, user_id')
    .eq('id', mealLogId)
    .eq('user_id', user.id)
    .single()

  if (mealError || !mealLog) {
    return NextResponse.json({ error: 'Meal log not found' }, { status: 404 })
  }

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select(FOOD_SELECT_FIELDS)
    .eq('id', parsed.data.food_id)
    .single()

  if (foodError || !food) {
    return NextResponse.json({ error: 'Food not found' }, { status: 404 })
  }

  const totals = computeTotals(food as unknown as FoodItem, parsed.data.quantity_g)

  const { data: item, error } = await supabase
    .from('meal_items')
    .insert({
      meal_log_id: mealLogId,
      food_id: parsed.data.food_id,
      quantity_g: parsed.data.quantity_g,
      calories_total: totals.calories,
      protein_g_total: totals.protein_g,
      carb_g_total: totals.carb_g,
      fat_g_total: totals.fat_g,
      sodium_mg_total: totals.sodium_mg,
    })
    .select('id, meal_log_id, food_id, quantity_g, calories_total, protein_g_total, carb_g_total, fat_g_total, vitamin_a_iu_total, vitamin_c_mg_total, iron_mg_total, zinc_mg_total, magnesium_mg_total, calcium_mg_total, sodium_mg_total, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(item, { status: 201 })
}