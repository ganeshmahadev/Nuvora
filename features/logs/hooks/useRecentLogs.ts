'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecentLogs } from '@/lib/api/logs'
import { localDate } from '@/lib/utils'

export function useRecentLogs(limit = 7) {
  const today = localDate()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - (limit - 1))
  const from = localDate(fromDate)

  return useQuery({
    queryKey: ['logs', 'recent', limit],
    queryFn: () => getRecentLogs(from, today, limit),
    staleTime: 3 * 60 * 1000,
  })
}
