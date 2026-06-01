'use client'

import dynamic from 'next/dynamic'

const SleepLogContent = dynamic(
  () => import('@/components/health/SleepLogContent').then((m) => m.default),
  { ssr: false },
)

export default function SleepLogPage() {
  return <SleepLogContent />
}