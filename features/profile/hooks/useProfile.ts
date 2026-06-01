'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ProfileSettings {
  water_target_ml: number
  location_city: string | null
}

async function fetchProfile(): Promise<ProfileSettings> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

async function patchProfile(data: Partial<ProfileSettings>): Promise<ProfileSettings> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export function useProfile() {
  return useQuery<ProfileSettings>({
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
