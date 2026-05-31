import { z } from 'zod'

function optionalNumber() {
  return z.number().or(z.nan()).transform(v => (Number.isNaN(v) ? null : v)).nullable().optional()
}

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  brand: z.string().max(100).optional().nullable(),
  calories_per_100g: z.number().min(0, 'Must be 0 or more').max(9999),
  protein_g: z.number().min(0).max(999),
  carb_g: z.number().min(0).max(999),
  fat_g: z.number().min(0).max(999),
  fiber_g: optionalNumber(),
  sodium_mg: optionalNumber(),
  vitamin_a_iu: optionalNumber(),
  vitamin_c_mg: optionalNumber(),
  iron_mg: optionalNumber(),
  zinc_mg: optionalNumber(),
  magnesium_mg: optionalNumber(),
  calcium_mg: optionalNumber(),
  potassium_mg: optionalNumber(),
  sugar_g: optionalNumber(),
})

export const updateFoodSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(100).optional().nullable(),
  calories_per_100g: z.number().min(0).max(9999).optional(),
  protein_g: z.number().min(0).max(999).optional(),
  carb_g: z.number().min(0).max(999).optional(),
  fat_g: z.number().min(0).max(999).optional(),
  fiber_g: optionalNumber(),
  sodium_mg: optionalNumber(),
  vitamin_a_iu: optionalNumber(),
  vitamin_c_mg: optionalNumber(),
  iron_mg: optionalNumber(),
  zinc_mg: optionalNumber(),
  magnesium_mg: optionalNumber(),
  calcium_mg: optionalNumber(),
  potassium_mg: optionalNumber(),
  sugar_g: optionalNumber(),
})

export type CreateFoodValues = z.infer<typeof createFoodSchema>
export type UpdateFoodValues = z.infer<typeof updateFoodSchema>