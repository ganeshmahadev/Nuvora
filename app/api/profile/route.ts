import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  weight_kg: z.number().min(20).max(300).nullable().optional(),
  height_cm: z.number().min(50).max(300).nullable().optional(),
  age: z.number().int().min(1).max(150).nullable().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).nullable().optional(),
  primary_goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance']).nullable().optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']).nullable().optional(),
  calorie_target: z.number().int().min(500).max(10000).optional(),
  water_target_ml: z.number().int().min(500).max(10000).optional(),
  protein_target_g: z.number().min(1).max(500).optional(),
  location_city: z.string().max(100).nullable().optional(),
})

const selectFields = 'id, display_name, email, avatar_url, weight_kg, height_cm, age, gender, region, primary_goal, activity_level, calorie_target, water_target_ml, protein_target_g, onboarding_complete, created_at, updated_at, location_city'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select(selectFields)
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)
    .select(selectFields)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}