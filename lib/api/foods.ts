export interface FoodItem {
  id: string
  name: string
  brand: string | null
  calories_per_100g: number
  protein_g: number
  carb_g: number
  fat_g: number
  fiber_g: number | null
  sodium_mg: number | null
  created_by: string | null
  is_verified: boolean
}

export async function searchFoods(query: string, limit = 15): Promise<FoodItem[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  const res = await fetch(`/api/foods/search?${params}`)
  if (!res.ok) throw new Error('Failed to search foods')
  return res.json()
}

export async function getRecentFoods(limit = 10): Promise<FoodItem[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const res = await fetch(`/api/foods/recent?${params}`)
  if (!res.ok) throw new Error('Failed to fetch recent foods')
  return res.json()
}

export function computeTotals(food: FoodItem, quantityG: number) {
  const factor = quantityG / 100
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein_g: Math.round(food.protein_g * factor * 10) / 10,
    carb_g: Math.round(food.carb_g * factor * 10) / 10,
    fat_g: Math.round(food.fat_g * factor * 10) / 10,
  }
}
