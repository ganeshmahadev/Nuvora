'use client'

import { AiInsightPlaceholder } from '@/components/health/AiInsightPlaceholder'

function MacroBar({ label, grams, max, color }: { label: string; grams: number; max: number; color: string }) {
  const pct = Math.min((grams / max) * 100, 100)
  return (
    <div className="text-center">
      <div className="w-2 h-16 bg-[oklch(90%_0.005_260)] rounded-full overflow-hidden relative mx-auto">
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-500"
          style={{ height: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)] mt-1 block">{label}</span>
    </div>
  )
}

function CaloriePreview() {
  return (
    <div className="mt-5 p-4 bg-[oklch(97%_0.005_90)] rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[oklch(48%_0.010_260)]">
          Typical daily macro targets
        </span>
      </div>
      <div className="flex justify-center gap-4">
        <MacroBar label="P" grams={150} max={200} color="#006958" />
        <MacroBar label="C" grams={250} max={400} color="#1c3fe7" />
        <MacroBar label="F" grams={65} max={100} color="#747675" />
      </div>
    </div>
  )
}

function MacroEducation() {
  const facts = [
    { icon: 'info', text: 'Protein: 4 kcal per gram. Essential for tissue synthesis.' },
    { icon: 'info', text: 'Carbohydrates: 4 kcal per gram. Primary glucose source.' },
    { icon: 'info', text: 'Fats: 9 kcal per gram. Critical for hormonal signaling.' },
  ]
  return (
    <div className="p-4 border border-[oklch(90%_0.005_260)] rounded-xl bg-surface">
      <h4 className="text-[14px] font-bold mb-2 text-[oklch(14%_0.012_260)]">Technical Guidance</h4>
      <ul className="space-y-2">
        {facts.map((fact) => (
          <li key={fact.text} className="flex items-start gap-2 text-[14px] text-[oklch(48%_0.010_260)]">
            <span
              className="material-symbols-outlined text-[16px] mt-0.5 text-fg-subtle shrink-0"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              {fact.icon}
            </span>
            {fact.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MealsInsightSidebar() {
  return (
    <div className="space-y-5">
      <div className="bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 p-4 rounded-xl relative overflow-hidden shadow-[0_20px_20px_-15px_rgba(28,63,231,0.1)]">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[oklch(52%_0.150_270)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-3 text-[oklch(52%_0.150_270)] relative z-10">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            auto_awesome
          </span>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]">Smart Recommendation</h3>
        </div>
        <div className="space-y-3 relative z-10">
          <p className="text-[18px] text-[oklch(14%_0.012_260)] leading-tight font-medium">
            Based on your current activity, aim for <span className="text-[oklch(52%_0.150_270)] font-bold">30g of protein</span> this meal.
          </p>
          <p className="text-[14px] text-[oklch(48%_0.010_260)]">
            Your heart rate variability indicates higher metabolic demand today. Increasing protein intake supports muscle recovery after your morning walk.
          </p>
          <div className="pt-3 border-t border-[oklch(90%_0.005_260)]">
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.04em] text-[oklch(48%_0.010_260)] mb-1">
              <span>Protein Target Progress</span>
              <span>85 / 160g</span>
            </div>
            <div className="w-full h-1 bg-[oklch(90%_0.005_260)] rounded-full overflow-hidden">
              <div className="h-full bg-[oklch(52%_0.150_270)] rounded-full" style={{ width: '53%' }} />
            </div>
          </div>
        </div>
      </div>
      <MacroEducation />
    </div>
  )
}