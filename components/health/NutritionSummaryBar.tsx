'use client'

import { cn } from '@/lib/utils'
import type { FoodTotals } from '@/lib/api/foods'

interface NutritionSummaryBarProps {
  totals: FoodTotals
  calorieTarget?: number | null
  className?: string
}

export function NutritionSummaryBar({ totals, calorieTarget, className }: NutritionSummaryBarProps) {
  const caloriePct = calorieTarget && calorieTarget > 0
    ? Math.min(100, Math.round((totals.calories / calorieTarget) * 100))
    : null

  return (
    <div className={cn('bg-surface-low rounded-xl px-4 py-3', className)}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold tabular-nums leading-none text-fg">
            {totals.calories}
          </span>
          <span className="text-[13px] text-fg-subtle">kcal</span>
        </div>
        {caloriePct !== null && (
          <span className={cn(
            'text-[13px] font-medium tabular-nums',
            caloriePct > 100 ? 'text-warning' : 'text-primary',
          )}>
            {caloriePct}% of {calorieTarget}
          </span>
        )}
      </div>

      {calorieTarget && calorieTarget > 0 && (
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              caloriePct && caloriePct > 100 ? 'bg-warning' : 'bg-primary',
            )}
            style={{ width: `${caloriePct ?? 0}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <MacroPill label="P" value={totals.protein_g} unit="g" color="text-primary" bg="bg-primary/10" />
        <MacroPill label="C" value={totals.carb_g} unit="g" color="text-ai" bg="bg-ai/10" />
        <MacroPill label="F" value={totals.fat_g} unit="g" color="text-warning" bg="bg-warning-soft" />
      </div>
    </div>
  )
}

function MacroPill({ label, value, unit, color, bg }: { label: string; value: number; unit: string; color: string; bg: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[12px] font-medium', bg, color)}>
      <span className="text-[10px] opacity-70">{label}</span>
      <span className="tabular-nums">{typeof value === 'number' ? Math.round(value * 10) / 10 : '—'}</span>
      <span className="text-[10px] opacity-70">{unit}</span>
    </span>
  )
}