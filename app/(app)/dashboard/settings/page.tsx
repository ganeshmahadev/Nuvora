'use client'

import { useState, useEffect, useRef } from 'react'
import { useProfile, useUpdateProfile, type ProfileData } from '@/features/profile/hooks/useProfile'
import { useRecentLogs } from '@/features/logs/hooks/useRecentLogs'
import { useInsight } from '@/features/insights/hooks/useInsight'

function computeBmi(weightKg: number | null, heightCm: number | null): string {
  if (!weightKg || !heightCm) return '—'
  const bmi = weightKg / (heightCm / 100) ** 2
  return bmi.toFixed(1)
}

function MetricInput({
  label,
  unit,
  value,
  onChange,
  inputClassName = '',
  size = 'sm',
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  inputClassName?: string
  size?: 'sm' | 'lg'
}) {
  return (
    <div className="flex flex-col border-b border-border pb-1">
      <label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">{label}</label>
      <div className="flex items-baseline gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-transparent border-none p-0 focus:outline-none text-fg ${inputClassName}`}
        />
        <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">{unit}</span>
      </div>
    </div>
  )
}

function GoalCard({
  icon,
  iconColor,
  title,
  subtitle,
  inputValue,
  inputUnit,
  displayValue,
  onInputChange,
  progress,
  progressColor = 'bg-primary',
  children,
}: {
  icon: string
  iconColor: string
  title: string
  subtitle: string
  inputValue: string
  inputUnit: string
  displayValue: string
  onInputChange: (v: string) => void
  progress: number
  progressColor?: string
  children?: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-[24px] font-medium tracking-[-0.01em] text-fg">{title}</h4>
            <p className="text-[14px] font-medium tracking-[0.02em] text-fg-muted">{subtitle}</p>
          </div>
          <span
            className={`material-symbols-outlined text-[32px] ${iconColor}`}
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-transparent border-none p-0 text-[48px] font-light tracking-[-0.04em] text-fg focus:outline-none w-36"
          />
          <span className="text-[24px] font-medium tracking-[-0.01em] text-fg-muted">{inputUnit}</span>
        </div>
      </div>
      <div className="w-full bg-surface-container-low h-2 rounded-full mt-6 overflow-hidden">
        <div
          className={`${progressColor} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {children}
    </div>
  )
}

function CircularProgress({ percentage, label }: { percentage: number; label: string }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  return (
    <div className="w-48 h-48 bg-surface-container-low rounded-full flex items-center justify-center relative">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--color-surface-variant, #e0e0fa)" strokeWidth="8" />
        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--color-primary-container, #00856f)" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-medium tracking-[-0.01em] text-fg">{Math.round(percentage)}%</span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">{label}</span>
      </div>
    </div>
  )
}

function DeveloperPopover({ onClose }: { onClose: () => void }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-surface-container-lowest border border-border rounded-xl p-4 shadow-lg z-50">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted mb-3">Developer API</p>
      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-fg-muted mb-1">Project URL</p>
          <div className="flex items-center gap-2">
            <code className="text-[13px] text-fg bg-surface-container-low px-2 py-1 rounded flex-1 truncate">{supabaseUrl}</code>
            <button onClick={() => copy(supabaseUrl, 'url')} className="text-[12px] font-medium text-primary hover:opacity-80 whitespace-nowrap">
              {copied === 'url' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-fg-muted mb-1">Anon Key</p>
          <div className="flex items-center gap-2">
            <code className="text-[13px] text-fg bg-surface-container-low px-2 py-1 rounded flex-1 truncate">{`${supabaseKey.slice(0, 20)}...`}</code>
            <button onClick={() => copy(supabaseKey, 'key')} className="text-[12px] font-medium text-primary hover:opacity-80 whitespace-nowrap">
              {copied === 'key' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-2 right-2 text-fg-muted hover:text-fg">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { data: logsData } = useRecentLogs(1)
  const { data: insight } = useInsight('daily_gist')

  const [form, setForm] = useState<Record<string, string>>({})
  const [showDevApi, setShowDevApi] = useState(false)
  const devRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profile) {
      const str: Record<string, string> = {}
      for (const [k, v] of Object.entries(profile)) {
        str[k] = v == null ? '' : String(v)
      }
      setForm(str)
      setWaterLiters((Number(profile.water_target_ml) / 1000).toFixed(1).replace(/\.0$/, ''))
    }
  }, [profile])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (devRef.current && !devRef.current.contains(e.target as Node)) {
        setShowDevApi(false)
      }
    }
    if (showDevApi) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDevApi])

  const todaySummary = logsData?.[0]?.summary
  const caloriesConsumed = todaySummary?.total_calories ?? 0
  const waterConsumed = todaySummary?.total_water_ml ?? 0
  const proteinConsumed = todaySummary?.total_protein_g ?? 0

  const calorieTarget = parseInt(form.calorie_target) || 2000
  const waterTargetMl = parseInt(form.water_target_ml) || 2500
  const proteinTargetG = parseFloat(form.protein_target_g) || 50
  const [waterLiters, setWaterLiters] = useState('')

  const bmiValue = computeBmi(
    form.weight_kg ? parseFloat(form.weight_kg) : null,
    form.height_cm ? parseFloat(form.height_cm) : null,
  )

function handleSave() {
    const patch: Record<string, unknown> = {}
    const numFields = ['weight_kg', 'height_cm', 'age', 'calorie_target', 'water_target_ml', 'protein_target_g']
    const fields = ['display_name', 'weight_kg', 'height_cm', 'age', 'gender', 'primary_goal', 'activity_level', 'calorie_target', 'water_target_ml', 'protein_target_g', 'location_city'] as const
    for (const key of fields) {
      const formVal = form[key] ?? ''
      if (numFields.includes(key)) {
        if (formVal === '') continue
        const num = Number(formVal)
        if (!isNaN(num)) patch[key] = num
      } else {
        if (formVal) patch[key] = formVal
      }
    }
    if (Object.keys(patch).length > 0) {
      updateProfile.mutate(patch as Partial<ProfileData>)
    }
  }

  function handleExport() {
    if (!profile) return
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nuvora-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100dvh-4rem)] md:min-h-full">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
          <div className="h-10 bg-border/40 rounded w-48" />
          <div className="h-6 bg-border/30 rounded w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="h-64 bg-border/30 rounded-xl" />
              <div className="h-48 bg-border/30 rounded-xl" />
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="h-12 bg-border/30 rounded-xl" />
              <div className="h-64 bg-border/30 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 max-w-[1280px] mx-auto">
      {/* Page header */}
      <header className="mb-10">
        <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.02em] text-fg mb-1">Command Center</h1>
        <p className="text-[18px] leading-relaxed text-fg-muted">
          Configure your biological baselines and performance targets.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left pane: Personal Details & Biometrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Personal Identity */}
          <section className="bg-surface-container-lowest border border-border rounded-xl p-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted mb-6">Personal Identity</h3>
            <div className="space-y-4">
              <div className="flex flex-col border-b border-border pb-1">
                <label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">Full Name</label>
                <input
                  type="text"
                  value={form.display_name || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  className="bg-transparent border-none p-0 text-[16px] leading-6 text-fg focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">Email</label>
                <p className="text-[16px] leading-6 text-fg-muted/70">{form.email ?? '—'}</p>
              </div>
            </div>
          </section>

          {/* Biometric Baselines */}
          <section className="bg-surface-container-lowest border border-border rounded-xl p-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted mb-6">Biometric Baselines</h3>
            <div className="grid gap-4 grid-cols-2">
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-1 text-fg-muted">Height</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.height_cm || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, height_cm: e.target.value }))}
                    className="bg-transparent border-none p-0 text-[24px] font-medium tracking-[-0.01em] text-fg w-16 text-center focus:outline-none"
                  />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">cm</span>
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-1 text-fg-muted">Weight</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.weight_kg || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight_kg: e.target.value }))}
                    className="bg-transparent border-none p-0 text-[24px] font-medium tracking-[-0.01em] text-fg w-16 text-center focus:outline-none"
                  />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">kg</span>
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-1 text-fg-muted">Age</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.age != null ? String(form.age) : ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                    className="bg-transparent border-none p-0 text-[24px] font-medium tracking-[-0.01em] text-fg w-16 text-center focus:outline-none"
                  />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">yrs</span>
                </div>
              </div>
              {/* BMI — auto-calculated */}
              <div className="p-3 bg-surface-container-highest/30 border border-border/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block">BMI</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Auto</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[24px] font-medium tracking-[-0.01em] text-fg-muted/70">{bmiValue}</span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted/50">idx</span>
                  </div>
                </div>
                <p className="text-[9px] text-fg-muted/60 leading-none mt-1">Auto-calculated</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right pane: Performance Targets */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-[24px] font-medium tracking-[-0.01em] text-fg">Performance Targets</h2>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving...' : 'Update Targets'}
            </button>
          </div>

          {updateProfile.isError && (
            <p className="text-[13px] text-error">Failed to save. Please try again.</p>
          )}
          {updateProfile.isSuccess && (
            <p className="text-[13px] text-primary">Targets updated successfully.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Energy */}
            <GoalCard
              icon="bolt"
              iconColor="text-primary"
              title="Daily Energy"
              subtitle="Caloric maintenance"
              inputValue={String(form.calorie_target ?? 2000)}
              inputUnit="kcal"
              displayValue={String(form.calorie_target ?? 2000)}
              onInputChange={(v) => setForm((prev) => ({ ...prev, calorie_target: v }))}
              progress={calorieTarget > 0 ? (caloriesConsumed / calorieTarget) * 100 : 0}
              progressColor="bg-primary"
            />

            {/* Hydration Base */}
            <GoalCard
              icon="water_drop"
              iconColor="text-secondary"
              title="Hydration Base"
              subtitle="Fluid intake target"
              inputValue={waterLiters}
              inputUnit="Liters"
              displayValue={waterLiters || '2.5'}
              onInputChange={(v) => {
                setWaterLiters(v)
                const ml = Math.round(parseFloat(v) * 1000) || 2500
                setForm((prev) => ({ ...prev, water_target_ml: String(ml) }))
              }}
              progress={waterTargetMl > 0 ? (waterConsumed / waterTargetMl) * 100 : 0}
              progressColor="bg-secondary"
            />

            {/* Protein Synthesis — full width */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-border rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="material-symbols-outlined text-[20px] text-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                    >
                      fitness_center
                    </span>
                    <h4 className="text-[24px] font-medium tracking-[-0.01em] text-fg">Protein Synthesis</h4>
                  </div>
                  <p className="text-[16px] leading-relaxed text-fg-muted mb-4">
                    Optimal intake for muscle recovery based on 2.2g per kg of body weight.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={String(form.protein_target_g ?? 50)}
                      onChange={(e) => setForm((prev) => ({ ...prev, protein_target_g: e.target.value }))}
                      className="bg-transparent border-none p-0 text-[48px] font-light tracking-[-0.04em] text-primary-container w-28 focus:outline-none"
                    />
                    <span className="text-[24px] font-medium tracking-[-0.01em] text-fg-muted">grams / day</span>
                  </div>
                </div>
                <CircularProgress
                  percentage={proteinTargetG > 0 ? (proteinConsumed / proteinTargetG) * 100 : 0}
                  label="Reached"
                />
              </div>
            </div>

            {/* AI Insight — full width */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-[oklch(52%_0.150_270)]/20 rounded-xl p-6 relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(28,63,231,0.12)]">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[oklch(52%_0.150_270)]/8 rounded-full blur-3xl pointer-events-none" />
              <svg className="absolute top-3 right-3 w-5 h-5 text-[oklch(52%_0.150_270)]/30 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
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
                  <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[oklch(52%_0.150_270)]">
                    Daily Health Gist
                  </h4>
                </div>

                {(!insight || insight.status === 'insufficient_data') && (
                  <p className="text-[15px] text-[oklch(14%_0.012_260)] leading-relaxed">
                    {insight?.hint || 'Keep logging your daily health data and we\'ll surface a personalised daily gist here.'}
                  </p>
                )}

                {insight?.status === 'complete' && insight.body && (
                  <>
                    <p className="text-[15px] text-[oklch(14%_0.012_260)] leading-relaxed mb-3">
                      &ldquo;{insight.body}&rdquo;
                    </p>
                    {insight.recommendation && (
                      <div className="border-t border-[oklch(90%_0.005_260)]/50 pt-3">
                        <p className="text-[13px] text-[oklch(48%_0.010_260)] italic">
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}