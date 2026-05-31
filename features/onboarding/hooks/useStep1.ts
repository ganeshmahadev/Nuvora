// features/onboarding/hooks/useStep1.ts
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { step1Schema, type Step1Values } from '../schemas/onboarding.schema'

export function useStep1() {
  const router = useRouter()

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { display_name: '', weight_kg: undefined, height_cm: undefined, age: undefined, gender: undefined },
  })

  const mutation = useMutation({
    mutationFn: async (data: Step1Values) => {
      const res = await fetch('/api/onboarding/step-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/onboarding/step-2'),
  })

  return { form, mutation }
}
