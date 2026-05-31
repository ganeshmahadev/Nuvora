'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FoodCardCompact } from '@/components/health/FoodCardCompact'
import { ServingAdjuster } from '@/components/health/ServingAdjuster'
import { FoodForm } from '@/features/foods/components/FoodForm'
import { useFoodSearch } from '@/features/foods/hooks/useFoodSearch'
import type { FoodItem } from '@/lib/api/foods'

interface FoodPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (food: FoodItem, quantityG: number) => void
}

type View = 'search' | 'adjust' | 'create'

export function FoodPickerDialog({ open, onOpenChange, onSelect }: FoodPickerDialogProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [view, setView] = useState<View>('search')
  const { results, isLoading, isRecent } = useFoodSearch(query)

  function handleSelect(food: FoodItem) {
    setSelected(food)
    setView('adjust')
  }

  function handleConfirm(food: FoodItem, quantityG: number) {
    onSelect(food, quantityG)
    handleClose()
  }

  function handleFoodCreated(food: FoodItem) {
    setSelected(food)
    setView('adjust')
  }

  function handleClose() {
    setSelected(null)
    setView('search')
    setQuery('')
    onOpenChange(false)
  }

  function handleBack() {
    if (view === 'adjust') {
      setView('search')
      setSelected(null)
    } else if (view === 'create') {
      setView('search')
    }
  }

  const title = view === 'adjust' ? 'Adjust serving' : view === 'create' ? 'Create custom food' : 'Add food'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border flex flex-row items-center gap-2">
          {(view !== 'search') && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1 rounded-md hover:bg-surface-low transition-colors"
            >
              <span
                className="material-symbols-outlined text-[20px] text-fg-muted"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
              >
                arrow_back
              </span>
            </button>
          )}
          <DialogTitle className="text-[16px] font-semibold text-fg">{title}</DialogTitle>
        </DialogHeader>

        {view === 'adjust' && selected ? (
          <div className="px-4 py-4">
            <ServingAdjuster
              food={selected}
              onConfirm={handleConfirm}
              onCancel={handleBack}
            />
          </div>
        ) : view === 'create' ? (
          <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
            <FoodForm
              onSuccess={handleFoodCreated}
              onCancel={() => setView('search')}
            />
          </div>
        ) : (
          <>
            <div className="px-3 py-2.5 border-b border-border">
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-fg-subtle pointer-events-none"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  search
                </span>
                <Input
                  autoFocus
                  placeholder="Search foods…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 h-9 text-[14px] border-0 bg-surface-low focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-fg-subtle"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                    >
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-[13px] text-fg-subtle">
                  <span
                    className="material-symbols-outlined text-[20px] mr-2 animate-spin"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                  >
                    progress_activity
                  </span>
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <span
                    className="material-symbols-outlined text-[32px] text-fg-subtle mb-2"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 32" }}
                  >
                    {isRecent ? 'history' : 'search_off'}
                  </span>
                  <p className="text-[14px] font-medium text-fg">
                    {isRecent ? 'No recent foods' : 'No results'}
                  </p>
                  <p className="text-[12px] text-fg-subtle mt-0.5">
                    {isRecent ? 'Foods you log will appear here' : `Nothing matched "${query}"`}
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {!query && isRecent && (
                    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                      Recent
                    </p>
                  )}
                  {results.map((food) => (
                    <FoodCardCompact
                      key={food.id}
                      food={food}
                      onClick={() => handleSelect(food)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border px-3 py-2.5">
              <button
                type="button"
                onClick={() => setView('create')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                >
                  add_circle
                </span>
                Create custom food
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}