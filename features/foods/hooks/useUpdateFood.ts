'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomFood, type UpdateFoodInput } from '@/lib/api/foods'

export function useUpdateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFoodInput }) =>
      updateCustomFood(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}