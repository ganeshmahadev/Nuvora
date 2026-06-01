'use client'

import dynamic from 'next/dynamic'

const WeightLogContent = dynamic(
  () => import('@/components/health/WeightLogContent').then((m) => m.default),
  { ssr: false },
)

export default function WeightLogPage() {
  return <WeightLogContent />
}