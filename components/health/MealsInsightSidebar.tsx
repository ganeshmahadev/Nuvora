'use client'

import { AiInsightCard } from '@/components/health/AiInsightCard'

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
      <AiInsightCard category="meal_nutrition" title="Smart Recommendation" icon="auto_awesome" fallbackDescription="Log meals consistently and we'll analyze your macro distribution, identify gaps, and suggest optimal food choices based on your activity and recovery needs." />
      <MacroEducation />
    </div>
  )
}