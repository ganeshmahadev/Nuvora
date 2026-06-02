'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ProfileData {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  gender: string | null
  region: string | null
  primary_goal: string | null
  activity_level: string | null
  calorie_target: number
  water_target_ml: number
  protein_target_g: number
  onboarding_complete: boolean
  created_at: string
  updated_at: string
  location_city: string | null
}

async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

async function patchProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: patchProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data)
    },
  })
}