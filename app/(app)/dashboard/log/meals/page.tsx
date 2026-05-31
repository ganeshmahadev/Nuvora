'use client'

import { useState } from 'react'
import { MealComposer } from '@/components/health/MealComposer'

export default function MealLoggingPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date] = useState(today)

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg mb-1">Log a meal</h1>
        <p className="text-[15px] text-fg-muted">
          Search foods, adjust serving sizes, and save your meal.
        </p>
      </div>

      <MealComposer date={date} />
    </div>
  )
}