import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { FoodItem } from '@/lib/api/foods'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10), 20)

  // Fetch recent meal_items for this user (RLS handles user filtering via meal_logs)
  const { data, error } = await supabase
    .from('meal_items')
    .select('food_id, created_at, foods(id, name, brand, calories_per_100g, protein_g, carb_g, fat_g, fiber_g, sodium_mg, created_by, is_verified)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Deduplicate by food_id, keep most recent occurrence, take top N
  const seen = new Set<string>()
  const recent: FoodItem[] = []
  for (const item of data ?? []) {
    const food = item.foods as unknown as FoodItem | null
    if (!food || seen.has(food.id)) continue
    seen.add(food.id)
    recent.push(food)
    if (recent.length >= limit) break
  }

  return NextResponse.json(recent)
}
