'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { computeTotals, type FoodItem } from '@/lib/api/foods'

interface ServingAdjusterProps {
  food: FoodItem
  onConfirm: (food: FoodItem, quantityG: number) => void
  onCancel: () => void
}

interface MacroRowProps {
  label: string
  value: number
  unit: string
  color: string
}

function MacroRow({ label, value, unit, color }: MacroRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-[13px] text-fg-muted">{label}</span>
      <span className={cn('text-[14px] font-semibold tabular-nums', color)}>
        {value}
        <span className="text-[12px] font-normal text-fg-subtle ml-0.5">{unit}</span>
      </span>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function ServingAdjuster({ food, onConfirm, onCancel }: ServingAdjusterProps) {
  const [quantityG, setQuantityG] = useState(100)
  const totals = computeTotals(food, quantityG)

  function handleQuantityChange(value: string) {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) setQuantityG(parsed)
    else if (value === '') setQuantityG(0)
  }

  return (
    <div className="space-y-4">
      {/* Food name */}
      <div>
        <p className="text-[16px] font-semibold text-fg">{food.name}</p>
        {food.brand && <p className="text-[13px] text-fg-subtle">{food.brand}</p>}
      </div>

      {/* Quantity input */}
      <div>
        <label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle block mb-1.5">
          Amount (grams)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantityG(q => Math.max(5, q - 10))}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-fg-muted hover:bg-surface-low transition-colors text-lg font-light"
          >
            −
          </button>
          <Input
            type="number"
            min="1"
            max="9999"
            step="5"
            value={quantityG || ''}
            onChange={e => handleQuantityChange(e.target.value)}
            className="text-center tabular-nums font-semibold text-[15px] h-9"
          />
          <button
            type="button"
            onClick={() => setQuantityG(q => Math.min(9999, q + 10))}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-fg-muted hover:bg-surface-low transition-colors text-lg font-light"
          >
            +
          </button>
        </div>
        <p className="text-[11px] text-fg-subtle mt-1">Per 100g: {Math.round(food.calories_per_100g)} kcal</p>
      </div>

      {/* Live macro totals */}
      <div className="bg-surface-low rounded-lg px-3 py-1">
        <MacroRow label="Calories" value={totals.calories} unit="kcal" color="text-fg" />
        <MacroRow label="Protein" value={totals.protein_g} unit="g" color="text-primary" />
        <MacroRow label="Carbs" value={totals.carb_g} unit="g" color="text-ai" />
        <MacroRow label="Fat" value={totals.fat_g} unit="g" color="text-warning" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(food, quantityG)}
          disabled={quantityG <= 0}
          className="flex-1 bg-primary hover:bg-primary-container text-on-primary"
        >
          Add to meal
        </Button>
      </div>
    </div>
  )
}
