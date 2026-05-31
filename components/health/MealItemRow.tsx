'use client'

import { type MealItem, MEAL_TYPE_LABELS } from '@/lib/api/meals'
import type { FoodItem } from '@/lib/api/foods'

interface MealItemRowProps {
  item: MealItem
  food?: FoodItem
  onRemove?: (itemId: string) => void
  isRemoving?: boolean
}

export function MealItemRow({ item, food, onRemove, isRemoving }: MealItemRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-low transition-colors group">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-fg truncate">
            {food?.name ?? 'Food item'}
          </p>
          <span className="text-[11px] text-fg-subtle tabular-nums">{item.quantity_g}g</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] font-semibold tabular-nums text-fg">{Math.round(item.calories_total)} kcal</span>
          <span className="text-[11px] text-primary tabular-nums">P {item.protein_g_total}g</span>
          <span className="text-[11px] text-ai tabular-nums">C {item.carb_g_total}g</span>
          <span className="text-[11px] text-warning tabular-nums">F {item.fat_g_total}g</span>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-container transition-opacity text-fg-subtle hover:text-error shrink-0"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            close
          </span>
        </button>
      )}
    </div>
  )
}