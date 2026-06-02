'use client'

import { useState } from 'react'
import { MealComposer } from '@/components/health/MealComposer'
import { TodayMealsList } from '@/components/health/TodayMealsList'
import { MealsInsightSidebar } from '@/components/health/MealsInsightSidebar'
import { LogDatePicker } from '@/components/health/LogDatePicker'
import Link from 'next/link'

export default function MealLoggingPage() {
  const today = new Date().toLocaleDateString('en-CA')
  const [date, setDate] = useState(today)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1280px] mx-auto">
      <Link
        href="/dashboard/log"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted hover:text-primary transition-colors mb-4"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          arrow_back
        </span>
        Back to journal
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              restaurant
            </span>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[oklch(14%_0.012_260)]">
              Log Nutrition
            </h1>
          </div>
          <LogDatePicker date={date} onChange={setDate} />
        </div>
        <p className="text-[15px] text-[oklch(48%_0.010_260)] max-w-2xl">
          Record your nutritional intake for metabolic precision. Data-driven fueling for optimal physiological performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest border border-[oklch(95%_0.005_90)] rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
              New meal
            </p>
            <MealComposer date={date} onSaved={() => setRefreshKey((k) => k + 1)} />
          </div>

          <TodayMealsList key={refreshKey} date={date} />
        </div>

        <div className="lg:col-span-4">
          <MealsInsightSidebar />
        </div>
      </div>
    </div>
  )
}