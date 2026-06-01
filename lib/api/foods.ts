export interface FoodItem {
  id: string
  name: string
  serving_size_g: number | null
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

export const FOOD_SELECT_FIELDS = [
  'id', 'name', 'serving_size_g', 'calories_per_100g', 'protein_g', 'carb_g', 'fat_g',
  'fiber_g', 'sodium_mg', 'vitamin_a_iu', 'vitamin_c_mg', 'iron_mg',
  'zinc_mg', 'magnesium_mg', 'calcium_mg', 'potassium_mg', 'sugar_g',
  'created_by', 'is_verified',
].join(',')

export interface FoodTotals {
  calories: number
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
}

export function computeTotals(food: FoodItem, quantityG: number): FoodTotals {
  const f = quantityG / 100
  return {
    calories: Math.round(food.calories_per_100g * f),
    protein_g: Math.round(food.protein_g * f * 10) / 10,
    carb_g: Math.round(food.carb_g * f * 10) / 10,
    fat_g: Math.round(food.fat_g * f * 10) / 10,
    fiber_g: food.fiber_g != null ? Math.round(food.fiber_g * f * 10) / 10 : null,
    sodium_mg: food.sodium_mg != null ? Math.round(food.sodium_mg * f * 10) / 10 : null,
    vitamin_a_iu: food.vitamin_a_iu != null ? Math.round(food.vitamin_a_iu * f * 10) / 10 : null,
    vitamin_c_mg: food.vitamin_c_mg != null ? Math.round(food.vitamin_c_mg * f * 10) / 10 : null,
    iron_mg: food.iron_mg != null ? Math.round(food.iron_mg * f * 10) / 10 : null,
    zinc_mg: food.zinc_mg != null ? Math.round(food.zinc_mg * f * 10) / 10 : null,
    magnesium_mg: food.magnesium_mg != null ? Math.round(food.magnesium_mg * f * 10) / 10 : null,
    calcium_mg: food.calcium_mg != null ? Math.round(food.calcium_mg * f * 10) / 10 : null,
    potassium_mg: food.potassium_mg != null ? Math.round(food.potassium_mg * f * 10) / 10 : null,
  }
}

export function sumTotals(items: Array<{ totals: FoodTotals }>): FoodTotals {
  return items.reduce(
    (acc, { totals }) => ({
      calories: acc.calories + totals.calories,
      protein_g: Math.round((acc.protein_g + totals.protein_g) * 10) / 10,
      carb_g: Math.round((acc.carb_g + totals.carb_g) * 10) / 10,
      fat_g: Math.round((acc.fat_g + totals.fat_g) * 10) / 10,
      fiber_g: totals.fiber_g != null ? Math.round(((acc.fiber_g ?? 0) + totals.fiber_g) * 10) / 10 : acc.fiber_g,
      sodium_mg: totals.sodium_mg != null ? Math.round(((acc.sodium_mg ?? 0) + totals.sodium_mg) * 10) / 10 : acc.sodium_mg,
      vitamin_a_iu: totals.vitamin_a_iu != null ? Math.round(((acc.vitamin_a_iu ?? 0) + totals.vitamin_a_iu) * 10) / 10 : acc.vitamin_a_iu,
      vitamin_c_mg: totals.vitamin_c_mg != null ? Math.round(((acc.vitamin_c_mg ?? 0) + totals.vitamin_c_mg) * 10) / 10 : acc.vitamin_c_mg,
      iron_mg: totals.iron_mg != null ? Math.round(((acc.iron_mg ?? 0) + totals.iron_mg) * 10) / 10 : acc.iron_mg,
      zinc_mg: totals.zinc_mg != null ? Math.round(((acc.zinc_mg ?? 0) + totals.zinc_mg) * 10) / 10 : acc.zinc_mg,
      magnesium_mg: totals.magnesium_mg != null ? Math.round(((acc.magnesium_mg ?? 0) + totals.magnesium_mg) * 10) / 10 : acc.magnesium_mg,
      calcium_mg: totals.calcium_mg != null ? Math.round(((acc.calcium_mg ?? 0) + totals.calcium_mg) * 10) / 10 : acc.calcium_mg,
      potassium_mg: totals.potassium_mg != null ? Math.round(((acc.potassium_mg ?? 0) + totals.potassium_mg) * 10) / 10 : acc.potassium_mg,
    }),
    {
      calories: 0,
      protein_g: 0,
      carb_g: 0,
      fat_g: 0,
      fiber_g: null as number | null,
      sodium_mg: null as number | null,
      vitamin_a_iu: null as number | null,
      vitamin_c_mg: null as number | null,
      iron_mg: null as number | null,
      zinc_mg: null as number | null,
      magnesium_mg: null as number | null,
      calcium_mg: null as number | null,
      potassium_mg: null as number | null,
    },
  )
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

export async function createCustomFood(data: CreateFoodInput): Promise<FoodItem> {
  const res = await fetch('/api/foods/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to create food')
  }
  return res.json()
}

export async function updateCustomFood(id: string, data: UpdateFoodInput): Promise<FoodItem> {
  const res = await fetch(`/api/foods/custom/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update food')
  }
  return res.json()
}

export async function deleteCustomFood(id: string): Promise<void> {
  const res = await fetch(`/api/foods/custom/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to delete food')
  }
}

export type CreateFoodInput = {
  name: string
  serving_size_g?: number | null
  calories_per_100g: number
  protein_g: number
  carb_g: number
  fat_g: number
  fiber_g?: number | null
  sodium_mg?: number | null
  vitamin_a_iu?: number | null
  vitamin_c_mg?: number | null
  iron_mg?: number | null
  zinc_mg?: number | null
  magnesium_mg?: number | null
  calcium_mg?: number | null
  potassium_mg?: number | null
  sugar_g?: number | null
}

export interface PredictedMacros {
  calories_per_100g: number
  protein_g: number
  carb_g: number
  fat_g: number
  fiber_g: number | null
  sodium_mg: number | null
}

export async function predictMacros(name: string): Promise<PredictedMacros> {
  const res = await fetch('/api/foods/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Prediction failed' }))
    throw new Error(err.error ?? 'Prediction failed')
  }
  return res.json()
}

export type UpdateFoodInput = Partial<CreateFoodInput>