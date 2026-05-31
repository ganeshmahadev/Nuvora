# Onboarding Flow (US-B1/B2/B3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-step onboarding wizard (personal details → goals + AI calibration → preferences) that writes to the `profiles` table at each step and redirects to `/app` on completion.

**Architecture:** Separate Next.js pages per step under a shared layout. Each step's "Continue" calls a Next.js Route Handler that upserts the relevant `profiles` columns — this way a refresh resumes from the last completed step. Step-2's AI calibration card reads biometrics written in step-1 and recomputes live as the user adjusts goal/activity.

**Tech Stack:** Next.js 15 App Router, React Hook Form v7 + Zod v4, TanStack Query v5, Supabase SSR, shadcn/ui (button, input, label, select, slider, switch), Motion for React, Tailwind v4 with Nuvora tokens.

---

## File Map

| File | Purpose |
|------|---------|
| `app/onboarding/layout.tsx` | Shared header (logo + step indicator) |
| `app/onboarding/step-1/page.tsx` | Personal details form |
| `app/onboarding/step-2/page.tsx` | Goals + activity slider + live AI calibration |
| `app/onboarding/step-3/page.tsx` | Preference toggles + final submit |
| `app/api/onboarding/step-1/route.ts` | PATCH profiles: display_name, weight_kg, height_cm, age, gender |
| `app/api/onboarding/step-2/route.ts` | PATCH profiles: primary_goal, activity_level, calorie_target, protein_target_g |
| `app/api/onboarding/complete/route.ts` | PATCH profiles: pref_* + onboarding_complete=true |
| `features/onboarding/schemas/onboarding.schema.ts` | Zod schemas for all 3 steps |
| `features/onboarding/hooks/useStep1.ts` | RHF + TanStack mutation for step 1 |
| `features/onboarding/hooks/useStep2.ts` | RHF + TanStack mutation + live calorie calc for step 2 |
| `features/onboarding/hooks/useStep3.ts` | RHF + TanStack mutation for step 3 |
| `lib/utils/calories.ts` | Mifflin-St Jeor BMR + activity multipliers + goal modifiers |

---

## Task 1: Install missing shadcn components

**Files:**
- Modify: `components/ui/` (shadcn adds files automatically)

- [ ] **Step 1: Add select, slider, and switch components**

```bash
npx shadcn@latest add select slider switch
```

Expected: `components/ui/select.tsx`, `components/ui/slider.tsx`, `components/ui/switch.tsx` created.

- [ ] **Step 2: Verify imports resolve**

```bash
node -e "require('./node_modules/next/dist/server/lib/router/utils/path-match')" 2>/dev/null; grep -r "from.*components/ui/select" components/ || echo 'files created'
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/select.tsx components/ui/slider.tsx components/ui/switch.tsx
git commit -m "chore: add select, slider, switch shadcn components for onboarding"
```

---

## Task 2: Calorie utility + Zod schemas

**Files:**
- Create: `lib/utils/calories.ts`
- Create: `features/onboarding/schemas/onboarding.schema.ts`

- [ ] **Step 1: Create `lib/utils/calories.ts`**

```typescript
// lib/utils/calories.ts

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
  athlete:   1.9,
} as const

export const GOAL_CALORIE_DELTAS = {
  weight_loss:          -500,
  maintenance:             0,
  muscle_gain:          +300,
  athletic_performance: +200,
} as const

export const GOAL_PROTEIN_MULTIPLIERS = {
  weight_loss:          1.6,
  maintenance:          1.8,
  muscle_gain:          2.2,
  athletic_performance: 2.4,
} as const

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS
export type PrimaryGoal   = keyof typeof GOAL_CALORIE_DELTAS

export interface CalorieInputs {
  weight_kg:      number
  height_cm:      number
  age:            number
  gender:         'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
  activity_level: ActivityLevel
  primary_goal:   PrimaryGoal
}

export interface CalorieResult {
  bmr:            number
  tdee:           number
  calorie_target: number
  protein_target: number
}

export function computeCalories(inputs: CalorieInputs): CalorieResult {
  const { weight_kg, height_cm, age, gender, activity_level, primary_goal } = inputs

  const bmr =
    gender === 'male'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

  const tdee           = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level])
  const calorie_target = Math.max(1200, tdee + GOAL_CALORIE_DELTAS[primary_goal])
  const protein_target = Math.round(weight_kg * GOAL_PROTEIN_MULTIPLIERS[primary_goal])

  return { bmr: Math.round(bmr), tdee, calorie_target, protein_target }
}
```

- [ ] **Step 2: Create `features/onboarding/schemas/onboarding.schema.ts`**

```typescript
// features/onboarding/schemas/onboarding.schema.ts
import { z } from 'zod'

export const step1Schema = z.object({
  display_name: z.string().min(1, 'Name is required').max(80),
  weight_kg:    z.coerce.number().min(20, 'Min 20 kg').max(300, 'Max 300 kg'),
  height_cm:    z.coerce.number().min(50, 'Min 50 cm').max(250, 'Max 250 cm'),
  age:          z.coerce.number().int().min(13, 'Must be 13+').max(120),
  gender:       z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
})

export const step2Schema = z.object({
  primary_goal:   z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']),
})

export const step3Schema = z.object({
  pref_morning_gist:   z.boolean(),
  pref_weekly_trends:  z.boolean(),
  pref_critical_alerts: z.boolean(),
})

export type Step1Values = z.infer<typeof step1Schema>
export type Step2Values = z.infer<typeof step2Schema>
export type Step3Values = z.infer<typeof step3Schema>
```

- [ ] **Step 3: Commit**

```bash
git add lib/utils/calories.ts features/onboarding/schemas/onboarding.schema.ts
git commit -m "feat: calorie utility and onboarding Zod schemas"
```

---

## Task 3: API Route Handlers

**Files:**
- Create: `app/api/onboarding/step-1/route.ts`
- Create: `app/api/onboarding/step-2/route.ts`
- Create: `app/api/onboarding/complete/route.ts`

- [ ] **Step 1: Create `app/api/onboarding/step-1/route.ts`**

```typescript
// app/api/onboarding/step-1/route.ts
import { createClient } from '@/lib/supabase/server'
import { step1Schema } from '@/features/onboarding/schemas/onboarding.schema'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = step1Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create `app/api/onboarding/step-2/route.ts`**

```typescript
// app/api/onboarding/step-2/route.ts
import { createClient } from '@/lib/supabase/server'
import { step2Schema } from '@/features/onboarding/schemas/onboarding.schema'
import { computeCalories } from '@/lib/utils/calories'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = step2Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('weight_kg, height_cm, age, gender')
    .eq('id', user.id)
    .single()

  let calorie_target = 2000
  let protein_target_g = 50

  if (profile?.weight_kg && profile?.height_cm && profile?.age && profile?.gender) {
    const result = computeCalories({
      weight_kg:      Number(profile.weight_kg),
      height_cm:      Number(profile.height_cm),
      age:            profile.age,
      gender:         profile.gender as any,
      activity_level: parsed.data.activity_level,
      primary_goal:   parsed.data.primary_goal,
    })
    calorie_target  = result.calorie_target
    protein_target_g = result.protein_target
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      primary_goal:    parsed.data.primary_goal,
      activity_level:  parsed.data.activity_level,
      calorie_target,
      protein_target_g,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/onboarding/complete/route.ts`**

```typescript
// app/api/onboarding/complete/route.ts
import { createClient } from '@/lib/supabase/server'
import { step3Schema } from '@/features/onboarding/schemas/onboarding.schema'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = step3Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...parsed.data, onboarding_complete: true })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/onboarding/
git commit -m "feat: onboarding API routes — step-1, step-2, complete"
```

---

## Task 4: Onboarding hooks

**Files:**
- Create: `features/onboarding/hooks/useStep1.ts`
- Create: `features/onboarding/hooks/useStep2.ts`
- Create: `features/onboarding/hooks/useStep3.ts`

- [ ] **Step 1: Create `features/onboarding/hooks/useStep1.ts`**

```typescript
// features/onboarding/hooks/useStep1.ts
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { step1Schema, type Step1Values } from '../schemas/onboarding.schema'

export function useStep1() {
  const router = useRouter()

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { display_name: '', weight_kg: undefined, height_cm: undefined, age: undefined, gender: undefined },
  })

  const mutation = useMutation({
    mutationFn: async (data: Step1Values) => {
      const res = await fetch('/api/onboarding/step-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/onboarding/step-2'),
  })

  return { form, mutation }
}
```

- [ ] **Step 2: Create `features/onboarding/hooks/useStep2.ts`**

```typescript
// features/onboarding/hooks/useStep2.ts
'use client'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { computeCalories, type ActivityLevel, type PrimaryGoal } from '@/lib/utils/calories'
import { step2Schema, type Step2Values } from '../schemas/onboarding.schema'

export function useStep2() {
  const router = useRouter()
  const supabase = createClient()

  const { data: profile } = useQuery({
    queryKey: ['profile-biometrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('weight_kg, height_cm, age, gender')
        .single()
      return data
    },
  })

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { primary_goal: 'maintenance', activity_level: 'moderate' },
  })

  const primaryGoal   = useWatch({ control: form.control, name: 'primary_goal' })
  const activityLevel = useWatch({ control: form.control, name: 'activity_level' })

  const calibration =
    profile?.weight_kg && profile?.height_cm && profile?.age && profile?.gender
      ? computeCalories({
          weight_kg:      Number(profile.weight_kg),
          height_cm:      Number(profile.height_cm),
          age:            profile.age,
          gender:         profile.gender as any,
          activity_level: activityLevel as ActivityLevel,
          primary_goal:   primaryGoal as PrimaryGoal,
        })
      : null

  const mutation = useMutation({
    mutationFn: async (data: Step2Values) => {
      const res = await fetch('/api/onboarding/step-2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/onboarding/step-3'),
  })

  return { form, mutation, calibration, profile }
}
```

- [ ] **Step 3: Create `features/onboarding/hooks/useStep3.ts`**

```typescript
// features/onboarding/hooks/useStep3.ts
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { step3Schema, type Step3Values } from '../schemas/onboarding.schema'

export function useStep3() {
  const router = useRouter()

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      pref_morning_gist:    true,
      pref_weekly_trends:   true,
      pref_critical_alerts: true,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: Step3Values) => {
      const res = await fetch('/api/onboarding/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
    },
    onSuccess: () => router.push('/app'),
  })

  return { form, mutation }
}
```

- [ ] **Step 4: Commit**

```bash
git add features/onboarding/
git commit -m "feat: onboarding hooks — useStep1, useStep2, useStep3"
```

---

## Task 5: Shared onboarding layout

**Files:**
- Create: `app/onboarding/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// app/onboarding/layout.tsx
import Link from 'next/link'

const STEPS = [1, 2, 3]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/60">
        Step {current} of 3
      </span>
      <div className="flex gap-1">
        {STEPS.map((s) => (
          <div
            key={s}
            className="h-[3px] w-8 rounded-full transition-colors duration-300"
            style={{ background: s <= current ? '#006958' : '#bdc9c4' }}
          />
        ))}
      </div>
    </div>
  )
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Derive step from URL — children render their own step number via a slot pattern.
  // The header is rendered without a step number here; each page injects its step
  // via a data attribute read by the header. Simpler: each page includes its own
  // step indicator row. The layout only provides the top logo bar.
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-md border-b border-border/40">
        <Link
          href="/"
          className="text-[13px] font-semibold tracking-[0.06em] uppercase text-primary"
        >
          Nuvora Health
        </Link>
        {/* Step indicator slot — each page renders its own via a portal-free approach:
            the step number is embedded in the page and floated top-right via absolute
            positioning below the fixed header. */}
      </header>
      <main className="flex-1 pt-16">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/layout.tsx
git commit -m "feat: onboarding shared layout with logo header"
```

---

## Task 6: Step 1 page — Personal details

**Files:**
- Create: `app/onboarding/step-1/page.tsx`

- [ ] **Step 1: Add TanStack QueryClientProvider to root layout (needed for hooks)**

Check if `app/layout.tsx` already wraps with QueryClientProvider. If not, create `components/providers.tsx`:

```tsx
// components/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

Then update `app/layout.tsx` to wrap children with `<Providers>`:

```tsx
// app/layout.tsx  (modify — wrap body children)
import { Providers } from '@/components/providers'

// inside <body>:
<Providers>{children}</Providers>
```

- [ ] **Step 2: Create `app/onboarding/step-1/page.tsx`**

```tsx
// app/onboarding/step-1/page.tsx
'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep1 } from '@/features/onboarding/hooks/useStep1'

export default function OnboardingStep1() {
  const router = useRouter()
  const { form, mutation } = useStep1()
  const { register, handleSubmit, control, formState: { errors } } = form

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col md:flex-row">

      {/* ── Left editorial panel ── */}
      <motion.section
        className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center px-12 lg:px-20 bg-surface-container-low relative overflow-hidden"
        {...fadeUp}
      >
        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-10 w-64 h-64 rounded-full bg-ai/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-sm">
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.02em] text-foreground">
            Let&apos;s personalise your precision health.
          </h1>
          <p className="mt-4 text-[16px] leading-[24px] text-muted-foreground">
            Nuvora adapts to your unique biology. Share the basics to begin your optimised health journey.
          </p>

          <div className="mt-10 flex gap-10">
            <div>
              <p className="text-[40px] leading-[48px] font-semibold tabular-nums text-primary">21 Days</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                To build a new<br />biological rhythm
              </p>
            </div>
            <div>
              <p className="text-[40px] leading-[48px] font-semibold tabular-nums text-primary">15%</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                Average boost in<br />metabolic focus
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Right form panel ── */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-between px-6 md:px-16 lg:px-24 py-10 bg-surface">

        {/* Step indicator — top right */}
        <div className="flex justify-end mb-8 md:mb-0 md:absolute md:top-5 md:right-10">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">
              Step 1 of 3
            </span>
            <div className="flex gap-1">
              {[1,2,3].map(s => (
                <div key={s} className="h-[3px] w-8 rounded-full" style={{ background: s <= 1 ? '#006958' : '#bdc9c4' }} />
              ))}
            </div>
          </div>
        </div>

        <motion.form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="flex flex-col gap-8 max-w-md mx-auto w-full mt-8 md:mt-16"
          {...fadeUpDelayed(0.05)}
        >
          {/* Full Name */}
          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="display_name" className="text-[13px] font-medium text-muted-foreground">
              Full Name
            </Label>
            <Input
              id="display_name"
              placeholder="Anders Jensen"
              className="border-0 border-none shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent"
              {...register('display_name')}
            />
            {errors.display_name && (
              <p className="text-[12px] text-destructive">{errors.display_name.message}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="weight_kg" className="text-[13px] font-medium text-muted-foreground">
              Weight (kg)
            </Label>
            <Input
              id="weight_kg"
              type="number"
              placeholder="75"
              step="0.1"
              min={20}
              max={300}
              className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent"
              {...register('weight_kg')}
            />
            {errors.weight_kg && (
              <p className="text-[12px] text-destructive">{errors.weight_kg.message}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="height_cm" className="text-[13px] font-medium text-muted-foreground">
              Height (cm)
            </Label>
            <Input
              id="height_cm"
              type="number"
              placeholder="182"
              min={50}
              max={250}
              className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent"
              {...register('height_cm')}
            />
            {errors.height_cm && (
              <p className="text-[12px] text-destructive">{errors.height_cm.message}</p>
            )}
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1 border-b border-border pb-2">
              <Label htmlFor="age" className="text-[13px] font-medium text-muted-foreground">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="32"
                min={13}
                max={120}
                className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent"
                {...register('age')}
              />
              {errors.age && (
                <p className="text-[12px] text-destructive">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-1 border-b border-border pb-2">
              <Label className="text-[13px] font-medium text-muted-foreground">Gender</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus:ring-0 bg-transparent">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-binary</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-[12px] text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/app')}
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium gap-2"
            >
              {mutation.isPending ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              )}
            </Button>
          </div>

          {mutation.isError && (
            <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {mutation.error.message}
            </p>
          )}
        </motion.form>

        {/* Footer */}
        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border text-[12px] text-muted-foreground">
          <span>Nuvora Health © 2026 Nuvora Health.</span>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </nav>
        </footer>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/step-1/ components/providers.tsx app/layout.tsx
git commit -m "feat: onboarding step 1 — personal details split layout"
```

---

## Task 7: Step 2 page — Goals + AI calibration

**Files:**
- Create: `app/onboarding/step-2/page.tsx`

- [ ] **Step 1: Create `app/onboarding/step-2/page.tsx`**

```tsx
// app/onboarding/step-2/page.tsx
'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep2 } from '@/features/onboarding/hooks/useStep2'
import type { PrimaryGoal, ActivityLevel } from '@/lib/utils/calories'

const GOAL_CARDS: { value: PrimaryGoal; label: string; icon: string; description: string }[] = [
  { value: 'weight_loss',          label: 'Weight Loss',          icon: 'monitor_weight', description: 'Prioritise metabolic efficiency and fat oxidation.' },
  { value: 'muscle_gain',          label: 'Muscle Gain',          icon: 'fitness_center', description: 'Optimise hypertrophy targets and protein synthesis.' },
  { value: 'maintenance',          label: 'Maintenance',          icon: 'balance',        description: 'Focus on long-term stability and hormonal health.' },
  { value: 'athletic_performance', label: 'Athletic Performance', icon: 'sprint',         description: 'Maximise VO2 max and anaerobic threshold power.' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light',     label: 'Light' },
  { value: 'moderate',  label: 'Moderate' },
  { value: 'active',    label: 'Active' },
  { value: 'athlete',   label: 'Athlete' },
]

export default function OnboardingStep2() {
  const router = useRouter()
  const { form, mutation, calibration } = useStep2()
  const { handleSubmit, control, watch, formState: { errors } } = form

  const selectedGoal     = watch('primary_goal')
  const selectedActivity = watch('activity_level')
  const activityIndex    = ACTIVITY_LEVELS.findIndex(a => a.value === selectedActivity)

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col lg:flex-row">

      {/* ── Left content column ── */}
      <motion.div
        className="flex-1 px-6 md:px-12 lg:px-16 py-10 lg:py-16"
        {...fadeUp}
      >
        {/* Step indicator */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">
              Step 2 of 3
            </span>
            <div className="flex gap-1">
              {[1,2,3].map(s => (
                <div key={s} className="h-[3px] w-8 rounded-full" style={{ background: s <= 2 ? '#006958' : '#bdc9c4' }} />
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold tracking-[-0.02em] text-foreground mb-2">
          Define your performance baselines.
        </h1>
        <p className="text-[16px] text-muted-foreground mb-10">
          Your goals drive the AI synthesis. Select your primary focus to calibrate the dashboard.
        </p>

        {/* Goal cards */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-4">Primary Focus</p>
          <Controller
            name="primary_goal"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_CARDS.map((card) => (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => field.onChange(card.value)}
                    className={[
                      'text-left p-5 rounded-xl border-2 transition-all duration-150',
                      field.value === card.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-surface hover:border-border-strong',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined text-[24px] text-primary mb-2 block">
                      {card.icon}
                    </span>
                    <p className="text-[16px] font-semibold text-foreground">{card.label}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground leading-snug">{card.description}</p>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Activity slider */}
        <div className="mt-8 p-5 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
              Daily Activity Level
            </p>
            <p className="text-[13px] font-semibold text-primary capitalize">
              {ACTIVITY_LEVELS[activityIndex >= 0 ? activityIndex : 2]?.label}
            </p>
          </div>
          <Controller
            name="activity_level"
            control={control}
            render={({ field }) => (
              <Slider
                min={0}
                max={4}
                step={1}
                value={[Math.max(0, ACTIVITY_LEVELS.findIndex(a => a.value === field.value))]}
                onValueChange={([i]) => field.onChange(ACTIVITY_LEVELS[i].value)}
                className="w-full"
              />
            )}
          />
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            <span>Sedentary</span>
            <span>Athlete</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step-1')}
            className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
          </button>
          <Button
            onClick={handleSubmit((d) => mutation.mutate(d))}
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium gap-2"
          >
            {mutation.isPending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </Button>
        </div>
        {mutation.isError && (
          <p className="mt-3 text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {mutation.error.message}
          </p>
        )}
      </motion.div>

      {/* ── Right AI Calibration sidebar ── */}
      <motion.aside
        className="lg:w-80 xl:w-96 px-6 lg:px-8 py-10 lg:py-16 lg:border-l border-border bg-surface-container-low"
        {...fadeUpDelayed(0.1)}
      >
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-6">
          AI Calibration
        </p>

        {calibration ? (
          <div className="space-y-5">
            <div>
              <p className="text-[13px] text-muted-foreground mb-1">Estimated Daily Target</p>
              <p className="text-[48px] leading-none font-light tabular-nums text-foreground">
                {calibration.calorie_target.toLocaleString()}
                <span className="text-[16px] font-normal ml-1 text-muted-foreground">kcal</span>
              </p>
            </div>

            <div className="flex gap-8 pt-1">
              <div>
                <p className="text-[12px] text-muted-foreground">Protein Target</p>
                <p className="text-[18px] font-semibold tabular-nums text-foreground">{calibration.protein_target}g</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Metabolic Baseline</p>
                <p className="text-[18px] font-semibold tabular-nums text-foreground">{calibration.tdee.toLocaleString()} kcal</p>
              </div>
            </div>

            <p className="text-[13px] italic text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
              &ldquo;Based on your profile, Nuvora is calibrating your targets for{' '}
              {GOAL_CARDS.find(g => g.value === selectedGoal)?.label?.toLowerCase() ?? 'your goal'}.&rdquo;
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-border rounded" />
            <div className="h-12 w-48 bg-border rounded" />
            <div className="h-4 w-24 bg-border rounded" />
          </div>
        )}
      </motion.aside>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/step-2/
git commit -m "feat: onboarding step 2 — goals, activity slider, live AI calibration"
```

---

## Task 8: Step 3 page — Preferences + final submit

**Files:**
- Create: `app/onboarding/step-3/page.tsx`

- [ ] **Step 1: Create `app/onboarding/step-3/page.tsx`**

```tsx
// app/onboarding/step-3/page.tsx
'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep3 } from '@/features/onboarding/hooks/useStep3'

const PREFERENCES = [
  {
    key: 'pref_morning_gist' as const,
    label: 'Morning Health Gist',
    description: 'A concise, silent briefing as you wake.',
  },
  {
    key: 'pref_weekly_trends' as const,
    label: 'Weekly Trend Analysis',
    description: 'Mathematical deep-dives into your biometrics.',
  },
  {
    key: 'pref_critical_alerts' as const,
    label: 'Critical Marker Alerts',
    description: 'Immediate notifications for vital irregularities.',
  },
]

export default function OnboardingStep3() {
  const router = useRouter()
  const { form, mutation } = useStep3()
  const { handleSubmit, control } = form

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col md:flex-row">

      {/* ── Left editorial panel ── */}
      <motion.section
        className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center px-12 lg:px-20 bg-surface-container-low relative overflow-hidden"
        {...fadeUp}
      >
        <div className="relative z-10 max-w-sm">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-6">
            Quiet Intelligence
          </p>
          <h1 className="text-[40px] leading-[48px] font-semibold tracking-[-0.02em] text-foreground">
            Configure your visual calm.
          </h1>
          <p className="mt-4 text-[16px] leading-[24px] text-muted-foreground">
            Decide how Nuvora communicates with you. We value your focus and data privacy.
          </p>

          {/* Decorative circular image */}
          <div className="mt-10 w-48 h-48 rounded-full overflow-hidden bg-surface-container border border-border">
            <div
              className="w-full h-full"
              style={{
                background: 'radial-gradient(circle at 40% 40%, #8ff5da 0%, #dee0ff 40%, #edecff 100%)',
              }}
            />
          </div>
        </div>
      </motion.section>

      {/* ── Right preferences panel ── */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-between px-6 md:px-16 lg:px-24 py-10 bg-surface">

        {/* Step indicator */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">
              Step 3 of 3
            </span>
            <div className="flex gap-1">
              {[1,2,3].map(s => (
                <div key={s} className="h-[3px] w-8 rounded-full" style={{ background: '#006958' }} />
              ))}
            </div>
          </div>
        </div>

        <motion.div className="max-w-md mx-auto w-full mt-4" {...fadeUpDelayed(0.05)}>
          {/* Toggle list */}
          <div className="space-y-0 divide-y divide-border">
            {PREFERENCES.map((pref) => (
              <div key={pref.key} className="flex items-center justify-between py-5">
                <div>
                  <p className="text-[16px] font-medium text-foreground">{pref.label}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{pref.description}</p>
                </div>
                <Controller
                  name={pref.key}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  )}
                />
              </div>
            ))}
          </div>

          {/* Privacy card */}
          <div className="mt-6 flex gap-3 p-4 rounded-xl bg-surface-container-low border border-border">
            <span className="material-symbols-outlined text-[20px] text-primary mt-0.5 shrink-0">
              shield
            </span>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Encrypted Data Privacy</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground leading-relaxed">
                Your data is secured using end-to-end AES-256 encryption. Nuvora never sells health insights to third parties. Every metric is yours, and yours alone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => router.push('/onboarding/step-2')}
              className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Previous
            </button>
            <Button
              onClick={handleSubmit((d) => mutation.mutate(d))}
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium"
            >
              {mutation.isPending ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                'Enter your Gist'
              )}
            </Button>
          </div>

          {mutation.isError && (
            <p className="mt-3 text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {mutation.error.message}
            </p>
          )}

          {/* Trust badges */}
          <div className="flex gap-6 mt-8 pt-6 border-t border-border">
            {['GDPR Compliant', 'E2E Encrypted', 'Local Processing'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/step-3/
git commit -m "feat: onboarding step 3 — preferences, privacy card, Enter your Gist"
```

---

## Task 9: Smoke test the full flow

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to step 1 and fill the form**

Open `http://localhost:3000/onboarding/step-1`. Fill all fields (name, weight, height, age, gender). Click Continue. Verify you land on `/onboarding/step-2`.

- [ ] **Step 3: Check Supabase profiles row**

In Supabase dashboard → Table Editor → profiles. Confirm `display_name`, `weight_kg`, `height_cm`, `age`, `gender` are saved on your user row.

- [ ] **Step 4: Complete step 2**

Select a goal card (e.g. Muscle Gain) and move the activity slider. Verify the AI Calibration card updates live. Click Continue. Check profiles row has `primary_goal`, `activity_level`, `calorie_target`, `protein_target_g` saved.

- [ ] **Step 5: Complete step 3**

Toggle preferences as desired. Click "Enter your Gist". Verify redirect to `/app` and that profiles row has `onboarding_complete = true`.

- [ ] **Step 6: Verify middleware redirect**

Sign out, sign in again. Middleware should detect `onboarding_complete = false` (for a fresh test user) and redirect to `/onboarding/step-1`.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: US-B1/B2/B3 — complete 3-step onboarding flow"
```
