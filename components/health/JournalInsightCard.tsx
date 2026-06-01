'use client'

import Link from 'next/link'

export function JournalInsightCard() {
  return (
    <div className="relative bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 rounded-xl p-6 overflow-hidden shadow-[0_20px_40px_-10px_rgba(28,63,231,0.12)]">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[oklch(52%_0.150_270)]/8 rounded-full blur-3xl pointer-events-none" />
      <svg
        className="absolute top-3 right-3 w-5 h-5 text-[oklch(52%_0.150_270)]/30 pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[20px] text-[oklch(52%_0.150_270)]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            auto_awesome
          </span>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[oklch(52%_0.150_270)]">
            Nutritional Congruence Detected
          </h3>
        </div>
        <p className="text-[15px] text-[oklch(14%_0.012_260)] leading-relaxed mb-3">
          Your protein intake and sleep quality are trending in alignment. This pattern suggests your current meal timing is supporting recovery cycles.
        </p>
        <div className="border-t border-[oklch(90%_0.005_260)]/50 pt-3">
          <p className="text-[13px] text-[oklch(48%_0.010_260)] italic">
            Maintaining evening meal protein above 25g correlates with your improved sleep scores this week.
          </p>
          <Link
            href="/dashboard/insights"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[oklch(52%_0.150_270)] hover:underline mt-2"
          >
            Explore insights
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}