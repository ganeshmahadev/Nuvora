export default function NutritionPage() {
  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100dvh-4rem)] md:min-h-full">
      <div className="text-center max-w-sm px-6">
        <span
          className="material-symbols-outlined text-[48px] text-fg-subtle mb-4 block"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
        >
          nutrition
        </span>
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg mb-2">
          Nutrition
        </h1>
        <p className="text-[15px] text-fg-muted">
          Nutrition detail page coming soon.
        </p>
      </div>
    </div>
  )
}