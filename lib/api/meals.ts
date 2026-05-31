import type { FoodItem, FoodTotals } from './foods'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: 'coffee',
  lunch: 'lunch_dining',
  dinner: 'dinner_dining',
  snack: 'cookie',
}

export interface MealItem {
  id: string
  meal_log_id: string
  food_id: string
  quantity_g: number
  calories_total: number
  protein_g_total: number
  carb_g_total: number
  fat_g_total: number
  vitamin_a_iu_total: number | null
  vitamin_c_mg_total: number | null
  iron_mg_total: number | null
  zinc_mg_total: number | null
  magnesium_mg_total: number | null
  calcium_mg_total: number | null
  sodium_mg_total: number | null
  food?: FoodItem
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  notes: string | null
  items: MealItem[]
  created_at: string
  updated_at: string
}

export interface CreateMealLogInput {
  date: string
  meal_type: MealType
  notes?: string | null
}

export interface AddMealItemInput {
  food_id: string
  quantity_g: number
}

export async function createMealLog(data: CreateMealLogInput): Promise<MealLog> {
  const res = await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to create meal log')
  }
  return res.json()
}

export async function getMealLogs(date: string): Promise<MealLog[]> {
  const params = new URLSearchParams({ date })
  const res = await fetch(`/api/meals?${params}`)
  if (!res.ok) throw new Error('Failed to fetch meal logs')
  return res.json()
}

export async function deleteMealLog(id: string): Promise<void> {
  const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to delete meal log')
  }
}

export async function addMealItem(mealLogId: string, data: AddMealItemInput): Promise<MealItem> {
  const res = await fetch(`/api/meals/${mealLogId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to add meal item')
  }
  return res.json()
}

export async function deleteMealItem(mealLogId: string, itemId: string): Promise<void> {
  const res = await fetch(`/api/meals/${mealLogId}/items/${itemId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to delete meal item')
  }
}

export function computeMealTotals(items: MealItem[]): FoodTotals {
  const zero: FoodTotals = {
    calories: 0,
    protein_g: 0,
    carb_g: 0,
    fat_g: 0,
    fiber_g: null,
    sodium_mg: null,
    vitamin_a_iu: null,
    vitamin_c_mg: null,
    iron_mg: null,
    zinc_mg: null,
    magnesium_mg: null,
    calcium_mg: null,
    potassium_mg: null,
  }

  return items.reduce((acc, item) => ({
    calories: acc.calories + item.calories_total,
    protein_g: Math.round((acc.protein_g + item.protein_g_total) * 10) / 10,
    carb_g: Math.round((acc.carb_g + item.carb_g_total) * 10) / 10,
    fat_g: Math.round((acc.fat_g + item.fat_g_total) * 10) / 10,
    fiber_g: null,
    sodium_mg: item.sodium_mg_total != null ? Math.round(((acc.sodium_mg ?? 0) + item.sodium_mg_total) * 10) / 10 : acc.sodium_mg,
    vitamin_a_iu: item.vitamin_a_iu_total != null ? Math.round(((acc.vitamin_a_iu ?? 0) + item.vitamin_a_iu_total) * 10) / 10 : acc.vitamin_a_iu,
    vitamin_c_mg: item.vitamin_c_mg_total != null ? Math.round(((acc.vitamin_c_mg ?? 0) + item.vitamin_c_mg_total) * 10) / 10 : acc.vitamin_c_mg,
    iron_mg: item.iron_mg_total != null ? Math.round(((acc.iron_mg ?? 0) + item.iron_mg_total) * 10) / 10 : acc.iron_mg,
    zinc_mg: item.zinc_mg_total != null ? Math.round(((acc.zinc_mg ?? 0) + item.zinc_mg_total) * 10) / 10 : acc.zinc_mg,
    magnesium_mg: item.magnesium_mg_total != null ? Math.round(((acc.magnesium_mg ?? 0) + item.magnesium_mg_total) * 10) / 10 : acc.magnesium_mg,
    calcium_mg: item.calcium_mg_total != null ? Math.round(((acc.calcium_mg ?? 0) + item.calcium_mg_total) * 10) / 10 : acc.calcium_mg,
    potassium_mg: null,
  }), zero)
}