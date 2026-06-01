'use client'

import dynamic from 'next/dynamic'

const WaterLogContent = dynamic(
  () => import('@/components/health/WaterLogContent').then((m) => m.default),
  { ssr: false },
)

export default function WaterLogPage() {
  return <WaterLogContent />
}