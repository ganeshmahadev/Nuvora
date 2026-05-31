// features/onboarding/hooks/useStep2.ts
'use client'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { computeCalories, type ActivityLevel, type PrimaryGoal } from '@/lib/utils/calories'
import { step2Schema, type Step2Values } from '../schemas/onboarding.schema'

export function useStep2() {
  const router = useRouter()
  const supabase = createClient()

  const { data: profile } = useQuery({
    queryKey: ['profile-biometrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('weight_kg, height_cm, age, gender')
        .single()
      return data
    },
  })

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { primary_goal: 'maintenance', activity_level: 'moderate' },
  })

  const primaryGoal   = useWatch({ control: form.control, name: 'primary_goal' })
  const activityLevel = useWatch({ control: form.control, name: 'activity_level' })

  const calibration =
    profile?.weight_kg && profile?.height_cm && profile?.age && profile?.gender
      ? computeCalories({
          weight_kg:      Number(profile.weight_kg),
          height_cm:      Number(profile.height_cm),
          age:            profile.age,
          gender:         profile.gender as any,
          activity_level: activityLevel as ActivityLevel,
          primary_goal:   primaryGoal as PrimaryGoal,
        })
      : null

  const mutation = useMutation({
    mutationFn: async (data: Step2Values) => {
      const res = await fetch('/api/onboarding/step-2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/onboarding/step-3'),
  })

  return { form, mutation, calibration, profile }
}
