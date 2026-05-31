'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCustomFood } from '@/lib/api/foods'

export function useDeleteFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}