'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { searchFoods, getRecentFoods } from '@/lib/api/foods'

export function useFoodSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  const isSearching = debouncedQuery.length > 0

  const searchResult = useQuery({
    queryKey: ['foods', 'search', debouncedQuery],
    queryFn: () => searchFoods(debouncedQuery),
    enabled: isSearching,
    staleTime: 30_000,
  })

  const recentResult = useQuery({
    queryKey: ['foods', 'recent'],
    queryFn: () => getRecentFoods(10),
    enabled: !isSearching,
    staleTime: 60_000,
  })

  if (isSearching) {
    return {
      results: searchResult.data ?? [],
      isLoading: searchResult.isLoading,
      isRecent: false,
    }
  }

  return {
    results: recentResult.data ?? [],
    isLoading: recentResult.isLoading,
    isRecent: true,
  }
}
