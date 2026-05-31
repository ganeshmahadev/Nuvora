// features/onboarding/hooks/useStep3.ts
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { step3Schema, type Step3Values } from '../schemas/onboarding.schema'

export function useStep3() {
  const router = useRouter()

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      pref_morning_gist:    true,
      pref_weekly_trends:   true,
      pref_critical_alerts: true,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: Step3Values) => {
      const res = await fetch('/api/onboarding/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/app'),
  })

  return { form, mutation }
}
