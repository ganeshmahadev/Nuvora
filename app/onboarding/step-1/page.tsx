'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { type UseFormReturn, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fadeUp, fadeUpDelayed } from '@/lib/utils/motion'
import { useStep1 } from '@/features/onboarding/hooks/useStep1'
import type { Step1Values } from '@/features/onboarding/schemas/onboarding.schema'

export default function OnboardingStep1() {
  const router = useRouter()
  const { form, mutation } = useStep1()
  const { register, handleSubmit, control, formState: { errors } } = form as unknown as UseFormReturn<Step1Values>

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col md:flex-row">

      {/* Left editorial panel */}
      <motion.section
        className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center px-12 lg:px-20 bg-surface-container-low relative overflow-hidden"
        {...fadeUp}
      >
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
              <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">To build a new<br />biological rhythm</p>
            </div>
            <div>
              <p className="text-[40px] leading-[48px] font-semibold tabular-nums text-primary">15%</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">Average boost in<br />metabolic focus</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Right form panel */}
      <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-between px-6 md:px-16 lg:px-24 py-10 bg-surface">
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/50">Step 1 of 3</span>
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
          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="display_name" className="text-[13px] font-medium text-muted-foreground">Full Name</Label>
            <Input id="display_name" placeholder="Anders Jensen" className="border-0 border-none shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent" {...register('display_name')} />
            {errors.display_name && <p className="text-[12px] text-destructive">{errors.display_name.message}</p>}
          </div>

          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="weight_kg" className="text-[13px] font-medium text-muted-foreground">Weight (kg)</Label>
            <Input id="weight_kg" type="number" placeholder="75" step="0.1" min={20} max={300} className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent" {...register('weight_kg')} />
            {errors.weight_kg && <p className="text-[12px] text-destructive">{errors.weight_kg.message}</p>}
          </div>

          <div className="space-y-1 border-b border-border pb-2">
            <Label htmlFor="height_cm" className="text-[13px] font-medium text-muted-foreground">Height (cm)</Label>
            <Input id="height_cm" type="number" placeholder="182" min={50} max={250} className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent" {...register('height_cm')} />
            {errors.height_cm && <p className="text-[12px] text-destructive">{errors.height_cm.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1 border-b border-border pb-2">
              <Label htmlFor="age" className="text-[13px] font-medium text-muted-foreground">Age</Label>
              <Input id="age" type="number" placeholder="32" min={13} max={120} className="border-0 shadow-none px-0 h-9 text-[18px] font-light focus-visible:ring-0 bg-transparent" {...register('age')} />
              {errors.age && <p className="text-[12px] text-destructive">{errors.age.message}</p>}
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
              {errors.gender && <p className="text-[12px] text-destructive">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => router.push('/app')} className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 font-medium gap-2">
              {mutation.isPending
                ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                : <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
            </Button>
          </div>

          {mutation.isError && (
            <p className="text-[13px] text-destructive bg-destructive/10 px-3 py-2 rounded-md">{mutation.error.message}</p>
          )}
        </motion.form>

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
