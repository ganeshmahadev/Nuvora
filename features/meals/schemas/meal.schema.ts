import { z } from 'zod'

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])

export const createMealLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  meal_type: mealTypeSchema,
  notes: z.string().max(500).optional().nullable(),
})

export const addMealItemSchema = z.object({
  food_id: z.string().uuid(),
  quantity_g: z.coerce.number().min(1, 'Amount must be at least 1g').max(9999),
})

export type CreateMealLogValues = z.infer<typeof createMealLogSchema>
export type AddMealItemValues = z.infer<typeof addMealItemSchema>