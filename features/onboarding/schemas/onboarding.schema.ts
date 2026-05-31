import { z } from 'zod'

export const step1Schema = z.object({
  display_name: z.string().min(1, 'Name is required').max(80),
  weight_kg:    z.coerce.number().min(20, 'Min 20 kg').max(300, 'Max 300 kg'),
  height_cm:    z.coerce.number().min(50, 'Min 50 cm').max(250, 'Max 250 cm'),
  age:          z.coerce.number().int().min(13, 'Must be 13+').max(120),
  gender:       z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
})

export const step2Schema = z.object({
  primary_goal:   z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']),
})

export const step3Schema = z.object({
  pref_morning_gist:    z.boolean(),
  pref_weekly_trends:   z.boolean(),
  pref_critical_alerts: z.boolean(),
})

export type Step1Values = z.infer<typeof step1Schema>
export type Step2Values = z.infer<typeof step2Schema>
export type Step3Values = z.infer<typeof step3Schema>
