import { cn } from '@/lib/utils'
import type { FoodItem } from '@/lib/api/foods'

interface FoodCardCompactProps {
  food: FoodItem
  onClick?: () => void
  className?: string
}

interface MacroBadgeProps {
  label: string
  value: number
  unit?: string
  color: string
}

function MacroBadge({ label, value, unit = 'g', color }: MacroBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium', color)}>
      <span className="text-[10px] opacity-70">{label}</span>
      <span className="tabular-nums">{value}{unit}</span>
    </span>
  )
}

export function FoodCardCompact({ food, onClick, className }: FoodCardCompactProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left',
        'hover:bg-surface-low transition-colors group',
        className,
      )}
    >
      <div className="min-w-0 flex items-center gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-medium text-fg truncate group-hover:text-primary transition-colors">
              {food.name}
            </p>
            {food.created_by !== null && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.06em] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>
          {food.brand && (
            <p className="text-[12px] text-fg-subtle truncate">{food.brand}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[13px] font-semibold tabular-nums text-fg">
          {Math.round(food.calories_per_100g)}
          <span className="text-[11px] font-normal text-fg-subtle ml-0.5">kcal</span>
        </span>
        <div className="hidden sm:flex items-center gap-1">
          <MacroBadge label="P" value={Math.round(food.protein_g)} color="bg-primary/10 text-primary" />
          <MacroBadge label="C" value={Math.round(food.carb_g)} color="bg-ai/10 text-ai" />
          <MacroBadge label="F" value={Math.round(food.fat_g)} color="bg-warning-soft text-warning" />
        </div>
      </div>
    </button>
  )
}