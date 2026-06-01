'use client'

interface AiInsightPlaceholderProps {
  title?: string
  description?: string
}

export function AiInsightPlaceholder({
  title = 'AI Recommendations',
  description = 'Personalized insights based on your logged data will appear here. Keep tracking to unlock AI-powered coaching.',
}: AiInsightPlaceholderProps) {
  return (
    <div className="bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 p-5 rounded-xl relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(28,63,231,0.08)]">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[oklch(52%_0.150_270)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-3 text-[oklch(52%_0.150_270)]">
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          auto_awesome
        </span>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">{title}</h3>
      </div>
      <p className="text-[14px] text-[oklch(48%_0.010_260)] leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  )
}