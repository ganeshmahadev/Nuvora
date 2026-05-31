'use client'

import { useState } from 'react'
import { FoodPickerDialog } from '@/components/health/FoodPickerDialog'
import { NutritionSummaryBar } from '@/components/health/NutritionSummaryBar'
import { MealItemRow } from '@/components/health/MealItemRow'
import {
  useCreateMealLog,
  useAddMealItem,
  useDeleteMealItem,
} from '@/features/meals/hooks/useMealLog'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS, type MealType } from '@/lib/api/meals'
import { computeTotals, type FoodItem } from '@/lib/api/foods'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PendingItem {
  id: string
  food: FoodItem
  quantityG: number
  totals: ReturnType<typeof computeTotals>
}

interface MealComposerProps {
  date: string
  calorieTarget?: number | null
  onSaved?: () => void
}

export function MealComposer({ date, calorieTarget, onSaved }: MealComposerProps) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [savedMealLogId, setSavedMealLogId] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const createMealMutation = useCreateMealLog()
  const addItemMutation = useAddMealItem()
  const removeItemMutation = useDeleteMealItem()

  function handleFoodSelected(food: FoodItem, quantityG: number) {
    if (isSaved && savedMealLogId) {
      addItemMutation.mutate({
        mealLogId: savedMealLogId,
        data: { food_id: food.id, quantity_g: quantityG },
      })
      return
    }

    const totals = computeTotals(food, quantityG)
    setPendingItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), food, quantityG, totals },
    ])
  }

  function handleRemovePending(itemId: string) {
    setPendingItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  function handleRemoveSaved(itemId: string) {
    if (!savedMealLogId) return
    removeItemMutation.mutate({ mealLogId: savedMealLogId, itemId })
  }

  async function handleSave() {
    let mealLogId = savedMealLogId

    if (!mealLogId) {
      const meal = await createMealMutation.mutateAsync({
        date,
        meal_type: mealType,
      })
      mealLogId = (meal as any).id
      setSavedMealLogId(mealLogId)
    }

    for (const item of pendingItems) {
      await addItemMutation.mutateAsync({
        mealLogId: mealLogId!,
        data: { food_id: item.food.id, quantity_g: item.quantityG },
      })
    }

    setPendingItems([])
    setIsSaved(true)
    onSaved?.()
  }

  const pendingTotals = {
    calories: pendingItems.reduce((s, i) => s + i.totals.calories, 0),
    protein_g: Math.round(pendingItems.reduce((s, i) => s + i.totals.protein_g, 0) * 10) / 10,
    carb_g: Math.round(pendingItems.reduce((s, i) => s + i.totals.carb_g, 0) * 10) / 10,
    fat_g: Math.round(pendingItems.reduce((s, i) => s + i.totals.fat_g, 0) * 10) / 10,
    fiber_g: null as number | null,
    sodium_mg: null as number | null,
    vitamin_a_iu: null as number | null,
    vitamin_c_mg: null as number | null,
    iron_mg: null as number | null,
    zinc_mg: null as number | null,
    magnesium_mg: null as number | null,
    calcium_mg: null as number | null,
    potassium_mg: null as number | null,
  }

  if (isSaved) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[20px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            check_circle
          </span>
          <p className="text-[15px] font-medium text-fg">
            {MEAL_TYPE_LABELS[mealType]} saved
          </p>
        </div>

        <p className="text-[13px] text-fg-muted">
          Your {MEAL_TYPE_LABELS[mealType].toLowerCase()} has been logged. You can continue adding more items or navigate away.
        </p>

        <Button
          variant="outline"
          onClick={() => setPickerOpen(true)}
          className="w-full"
        >
          <span
            className="material-symbols-outlined text-[18px] mr-1"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            add
          </span>
          Add more food
        </Button>

        <FoodPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={(food, qty) => handleFoodSelected(food, qty)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle block mb-2">
          Meal type
        </label>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(type)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                mealType === type
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-surface-low text-fg-muted border border-transparent hover:bg-surface-container',
              )}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{
                  fontVariationSettings: mealType === type
                    ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20"
                    : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                }}
              >
                {MEAL_TYPE_ICONS[type]}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {pendingItems.length > 0 && (
        <NutritionSummaryBar totals={pendingTotals} calorieTarget={calorieTarget} />
      )}

      {pendingItems.length > 0 && (
        <div className="space-y-0.5">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-low transition-colors group">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-fg truncate">{item.food.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] text-fg-subtle tabular-nums">{item.quantityG}g</span>
                  <span className="text-[12px] font-semibold tabular-nums text-fg">{item.totals.calories} kcal</span>
                  <span className="text-[11px] text-primary tabular-nums">P {item.totals.protein_g}g</span>
                  <span className="text-[11px] text-ai tabular-nums">C {item.totals.carb_g}g</span>
                  <span className="text-[11px] text-warning tabular-nums">F {item.totals.fat_g}g</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePending(item.id)}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-container text-fg-subtle hover:text-error transition-opacity shrink-0"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setPickerOpen(true)}
        className="w-full border-dashed border-2"
      >
        <span
          className="material-symbols-outlined text-[18px] mr-1"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          add
        </span>
        {pendingItems.length === 0 ? 'Add food' : 'Add more food'}
      </Button>

      {pendingItems.length > 0 && (
        <Button
          onClick={handleSave}
          disabled={createMealMutation.isPending}
          className="w-full bg-primary hover:bg-primary-container text-on-primary"
        >
          {createMealMutation.isPending ? 'Saving…' : 'Save meal'}
        </Button>
      )}

      <FoodPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleFoodSelected}
      />
    </div>
  )
}