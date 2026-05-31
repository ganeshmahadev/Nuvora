// app/api/onboarding/step-2/route.ts
import { createClient } from '@/lib/supabase/server'
import { step2Schema } from '@/features/onboarding/schemas/onboarding.schema'
import { computeCalories } from '@/lib/utils/calories'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = step2Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('weight_kg, height_cm, age, gender')
    .eq('id', user.id)
    .single()

  let calorie_target = 2000
  let protein_target_g = 50

  if (profile?.weight_kg && profile?.height_cm && profile?.age && profile?.gender) {
    const result = computeCalories({
      weight_kg:      Number(profile.weight_kg),
      height_cm:      Number(profile.height_cm),
      age:            profile.age,
      gender:         profile.gender as any,
      activity_level: parsed.data.activity_level,
      primary_goal:   parsed.data.primary_goal,
    })
    calorie_target   = result.calorie_target
    protein_target_g = result.protein_target
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      primary_goal:    parsed.data.primary_goal,
      activity_level:  parsed.data.activity_level,
      calorie_target,
      protein_target_g,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
