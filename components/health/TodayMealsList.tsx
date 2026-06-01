'use client'

import { useMealLogs, useDeleteMealLog } from '@/features/meals/hooks/useMealLog'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType, type MealLog } from '@/lib/api/meals'
import { computeMealTotals } from '@/lib/api/meals'
import { useState } from 'react'

interface TodayMealsListProps {
  date: string
}

function MealCard({ meal, onDelete }: { meal: MealLog; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const totals = computeMealTotals(meal.items ?? [])
  const mealType = meal.meal_type as MealType
  const items = meal.items ?? []

  return (
    <div className="border border-border rounded-xl p-4 bg-surface">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[20px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {MEAL_TYPE_ICONS[mealType]}
          </span>
          <span className="text-[14px] font-medium text-fg">{MEAL_TYPE_LABELS[mealType]}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold tabular-nums text-fg">
            {totals.calories} kcal
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirmDelete) {
                onDelete(meal.id)
              } else {
                setConfirmDelete(true)
                setTimeout(() => setConfirmDelete(false), 3000)
              }
            }}
            className="text-[11px] font-medium px-2 py-1 rounded-md transition-colors text-fg-subtle hover:text-error hover:bg-error/10"
          >
            {confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => {
            const foodName = item.food?.name ?? 'Unknown food'
            return (
              <div key={item.id} className="flex items-center justify-between py-1">
                <span className="text-[13px] text-fg truncate">{foodName}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[12px] text-fg-subtle tabular-nums">{item.quantity_g}g</span>
                  <span className="text-[12px] font-semibold tabular-nums text-fg">{item.calories_total} kcal</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
        <span className="text-[11px] text-primary tabular-nums">P {totals.protein_g}g</span>
        <span className="text-[11px] text-ai tabular-nums">C {totals.carb_g}g</span>
        <span className="text-[11px] text-warning tabular-nums">F {totals.fat_g}g</span>
      </div>
    </div>
  )
}

export function TodayMealsList({ date }: TodayMealsListProps) {
  const { data: meals, isLoading } = useMealLogs(date)
  const deleteMutation = useDeleteMealLog()

  function handleDelete(id: string) {
    deleteMutation.mutate({ id, date })
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-[13px] text-fg-muted">
        Loading meals…
      </div>
    )
  }

  if (!meals || meals.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
        Today&apos;s meals
      </p>
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
      ))}
    </div>
  )
}