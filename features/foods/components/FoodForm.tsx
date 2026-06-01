'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFoodSchema, type CreateFoodValues } from '@/features/foods/schemas/food.schema'
import { useCreateFood } from '@/features/foods/hooks/useCreateFood'
import { predictMacros } from '@/lib/api/foods'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FoodItem } from '@/lib/api/foods'

interface FoodFormProps {
  onSuccess?: (food: FoodItem) => void
  onCancel?: () => void
}

export function FoodForm({ onSuccess, onCancel }: FoodFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [predictError, setPredictError] = useState<string | null>(null)
  const createFood = useCreateFood()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFoodValues>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: {
      protein_g: 0,
      carb_g: 0,
      fat_g: 0,
      fiber_g: null,
      sodium_mg: null,
      vitamin_a_iu: null,
      vitamin_c_mg: null,
      iron_mg: null,
      zinc_mg: null,
      magnesium_mg: null,
      calcium_mg: null,
      potassium_mg: null,
      sugar_g: null,
    },
  })

  const foodName = watch('name')

  async function handlePredict() {
    if (!foodName?.trim()) return
    setPredicting(true)
    setPredictError(null)
    try {
      const macros = await predictMacros(foodName)
      setValue('calories_per_100g', macros.calories_per_100g, { shouldValidate: true })
      setValue('protein_g', macros.protein_g, { shouldValidate: true })
      setValue('carb_g', macros.carb_g, { shouldValidate: true })
      setValue('fat_g', macros.fat_g, { shouldValidate: true })
      if (macros.fiber_g != null) setValue('fiber_g', macros.fiber_g, { shouldValidate: true })
      if (macros.sodium_mg != null) setValue('sodium_mg', macros.sodium_mg, { shouldValidate: true })
    } catch (err: any) {
      setPredictError(err.message ?? 'Prediction failed')
    } finally {
      setPredicting(false)
    }
  }

  function onSubmit(data: CreateFoodValues) {
    createFood.mutate(data, {
      onSuccess: (food) => {
        onSuccess?.(food as FoodItem)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
          Food name *
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g. Grilled Salmon Fillet"
          className="mt-1.5"
        />
        {errors.name && <p className="text-[12px] text-error mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="serving_size_g" className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
          Serving size (g)
        </Label>
        <Input
          id="serving_size_g"
          type="number"
          step="1"
          min="1"
          {...register('serving_size_g', { valueAsNumber: true })}
          placeholder="e.g. 150"
          className="mt-1.5 tabular-nums"
        />
      </div>

      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          Macros per 100g *
        </p>
        <button
          type="button"
          onClick={handlePredict}
          disabled={predicting || !foodName?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-ai/10 text-ai hover:bg-ai/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined text-[14px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            auto_awesome
          </span>
          {predicting ? 'Predicting…' : 'AI predict'}
        </button>
      </div>

      {predictError && (
        <p className="text-[12px] text-error">{predictError}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="calories" className="text-[12px] text-fg-muted">Calories</Label>
          <Input
            id="calories"
            type="number"
            step="1"
            {...register('calories_per_100g', { valueAsNumber: true })}
            className="mt-1 tabular-nums"
          />
          {errors.calories_per_100g && <p className="text-[12px] text-error mt-1">{errors.calories_per_100g.message}</p>}
        </div>
        <div>
          <Label htmlFor="protein" className="text-[12px] text-primary">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            {...register('protein_g', { valueAsNumber: true })}
            className="mt-1 tabular-nums"
          />
        </div>
        <div>
          <Label htmlFor="carbs" className="text-[12px] text-ai">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            {...register('carb_g', { valueAsNumber: true })}
            className="mt-1 tabular-nums"
          />
        </div>
        <div>
          <Label htmlFor="fat" className="text-[12px] text-warning">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            {...register('fat_g', { valueAsNumber: true })}
            className="mt-1 tabular-nums"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-[12px] font-medium text-primary hover:text-primary-container transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} micronutrients (optional)
      </button>

      {showAdvanced && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <MacroInput label="Fiber (g)" {...register('fiber_g', { valueAsNumber: true })} />
            <MacroInput label="Sodium (mg)" {...register('sodium_mg', { valueAsNumber: true })} />
            <MacroInput label="Vitamin A (IU)" {...register('vitamin_a_iu', { valueAsNumber: true })} />
            <MacroInput label="Vitamin C (mg)" {...register('vitamin_c_mg', { valueAsNumber: true })} />
            <MacroInput label="Iron (mg)" {...register('iron_mg', { valueAsNumber: true })} />
            <MacroInput label="Zinc (mg)" {...register('zinc_mg', { valueAsNumber: true })} />
            <MacroInput label="Magnesium (mg)" {...register('magnesium_mg', { valueAsNumber: true })} />
            <MacroInput label="Calcium (mg)" {...register('calcium_mg', { valueAsNumber: true })} />
            <MacroInput label="Potassium (mg)" {...register('potassium_mg', { valueAsNumber: true })} />
            <MacroInput label="Sugar (g)" {...register('sugar_g', { valueAsNumber: true })} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={createFood.isPending}
          className="flex-1 bg-primary hover:bg-primary-container text-on-primary"
        >
          {createFood.isPending ? 'Adding…' : 'Add to my foods'}
        </Button>
      </div>

      {createFood.error && (
        <p className="text-[12px] text-error">
          Failed to create food. Please try again.
        </p>
      )}
    </form>
  )
}

function MacroInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label className="text-[12px] text-fg-muted">{label}</Label>
      <Input type="number" step="0.1" className="mt-1 tabular-nums" {...props} />
    </div>
  )
}