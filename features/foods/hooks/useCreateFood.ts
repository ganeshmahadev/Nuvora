'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomFood, type CreateFoodInput } from '@/lib/api/foods'

export function useCreateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFoodInput) => createCustomFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}