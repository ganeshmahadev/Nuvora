'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecentLogs } from '@/lib/api/logs'

export function useRecentLogs(limit = 7) {
  return useQuery({
    queryKey: ['logs', 'recent', limit],
    queryFn: () => getRecentLogs(undefined, undefined, limit),
    staleTime: 3 * 60 * 1000,
  })
}
