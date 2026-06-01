'use client'

import dynamic from 'next/dynamic'

const ActivityLogContent = dynamic(
  () => import('@/components/health/ActivityLogContent').then((m) => m.default),
  { ssr: false },
)

export default function ActivityLogPage() {
  return <ActivityLogContent />
}