import { z } from 'zod'
import { ACTIVITY_TYPES, INTENSITY_LABELS } from '@/lib/config/metrics.config'

export const logWaterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  amount_ml: z.number().int().positive('Must be at least 1 ml'),
})

export const logWeightSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  weight_kg: z.number().positive('Must be greater than 0'),
  notes: z.string().max(200).optional().nullable(),
})

export const logSleepSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  bed_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  wake_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  subjective_quality: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const logActivitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  activity_type: z.enum(ACTIVITY_TYPES),
  duration_minutes: z.number().int().positive('Must be at least 1 minute'),
  intensity_label: z.enum(INTENSITY_LABELS).optional().nullable(),
  calories_burned: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(200).optional().nullable(),
})

export const deleteMetricSchema = z.object({
  id: z.string().uuid(),
})

export type LogWaterValues = z.infer<typeof logWaterSchema>
export type LogWeightValues = z.infer<typeof logWeightSchema>
export type LogSleepValues = z.infer<typeof logSleepSchema>
export type LogActivityValues = z.infer<typeof logActivitySchema>