'use client'

import { useState } from 'react'
import { METRIC_CONFIGS } from '@/lib/config/metrics.config'
import { MetricLogForm } from '@/components/health/MetricLogForm'
import { MetricHistoryTable } from '@/components/health/MetricHistoryTable'

const config = METRIC_CONFIGS.sleep

export default function SleepLogPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date] = useState(today)

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-[24px] text-ai"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {config.icon}
          </span>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg">Log sleep</h1>
        </div>
        <p className="text-[15px] text-fg-muted">
          Record your bedtime, wake time, and sleep quality. One entry per day.
        </p>
      </div>

      <div className="space-y-6">
        <MetricLogForm config={config} date={date} />
        <MetricHistoryTable config={config} date={date} />
      </div>
    </div>
  )
}