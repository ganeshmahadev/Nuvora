'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLatestInsight,
  generateInsight,
  type InsightCategory,
  type InsightResponse,
} from '@/lib/api/insights'

export function useInsight(category: InsightCategory) {
  return useQuery<InsightResponse>({
    queryKey: ['insights', category],
    queryFn: () => getLatestInsight(category),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useGenerateInsight() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      category,
      referenceDate,
      forceRegenerate,
    }: {
      category: InsightCategory
      referenceDate?: string
      forceRegenerate?: boolean
    }) => generateInsight(category, referenceDate, forceRegenerate),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insights', variables.category] })
    },
  })
}