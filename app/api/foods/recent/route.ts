import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { FOOD_SELECT_FIELDS, type FoodItem } from '@/lib/api/foods'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10), 20)

  const { data: mealItems, error } = await supabase
    .from('meal_items')
    .select(`food_id, created_at, foods(${FOOD_SELECT_FIELDS})`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const seen = new Set<string>()
  const recent: FoodItem[] = []
  for (const item of mealItems ?? []) {
    const food = (item as any).foods as FoodItem | null
    if (!food || seen.has(food.id)) continue
    seen.add(food.id)
    recent.push(food)
    if (recent.length >= limit) break
  }

  return NextResponse.json(recent)
}