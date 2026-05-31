'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { MetricType } from '@/lib/config/metrics.config'
import {
  getMetricHistory,
  logWater,
  logWeight,
  logSleep,
  logActivity,
  deleteMetric,
  getTodayMetrics,
  type DailyMetrics,
  type WaterEntry,
  type WeightEntry,
  type SleepEntry,
  type ActivityEntry,
} from '@/lib/api/metrics'

export function useMetricHistory(type: MetricType, from: string, to: string) {
  return useQuery({
    queryKey: ['metrics', type, from, to],
    queryFn: () => getMetricHistory(type, from, to),
    enabled: !!from && !!to,
    staleTime: 30_000,
  })
}

export function useTodayMetrics() {
  const today = new Date().toISOString().split('T')[0]
  return useQuery<DailyMetrics | null>({
    queryKey: ['metrics', 'today', today],
    queryFn: () => getTodayMetrics(),
    staleTime: 60_000,
  })
}

export function useLogWater() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof logWater>[0]) => logWater(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', 'water'] })
      queryClient.invalidateQueries({ queryKey: ['metrics', 'today'] })
    },
  })
}

export function useLogWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof logWeight>[0]) => logWeight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', 'weight'] })
      queryClient.invalidateQueries({ queryKey: ['metrics', 'today'] })
    },
  })
}

export function useLogSleep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof logSleep>[0]) => logSleep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', 'sleep'] })
      queryClient.invalidateQueries({ queryKey: ['metrics', 'today'] })
    },
  })
}

export function useLogActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof logActivity>[0]) => logActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', 'activity'] })
      queryClient.invalidateQueries({ queryKey: ['metrics', 'today'] })
    },
  })
}

export function useDeleteMetric(type: MetricType) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMetric(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', type] })
      queryClient.invalidateQueries({ queryKey: ['metrics', 'today'] })
    },
  })
}

export type { WaterEntry, WeightEntry, SleepEntry, ActivityEntry, DailyMetrics }