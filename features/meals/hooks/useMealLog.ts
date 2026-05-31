'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createMealLog,
  getMealLogs,
  deleteMealLog,
  addMealItem,
  deleteMealItem,
  type CreateMealLogInput,
  type AddMealItemInput,
} from '@/lib/api/meals'

export function useMealLogs(date: string) {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: () => getMealLogs(date),
    enabled: !!date,
    staleTime: 30_000,
  })
}

export function useCreateMealLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMealLogInput) => createMealLog(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meals', variables.date] })
    },
  })
}

export function useDeleteMealLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => deleteMealLog(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meals', variables.date] })
    },
  })
}

export function useAddMealItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ mealLogId, data }: { mealLogId: string; data: AddMealItemInput }) =>
      addMealItem(mealLogId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['foods', 'recent'] })
    },
  })
}

export function useDeleteMealItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ mealLogId, itemId }: { mealLogId: string; itemId: string }) =>
      deleteMealItem(mealLogId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
    },
  })
}