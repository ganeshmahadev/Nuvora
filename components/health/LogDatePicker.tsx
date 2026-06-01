'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface LogDatePickerProps {
  date: string
  onChange: (date: string) => void
}

function toDate(iso: string): Date {
  return new Date(iso + 'T12:00:00')
}

function formatLabel(iso: string): string {
  const d = toDate(iso)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEE, d MMM')
}

export function LogDatePicker({ date, onChange }: LogDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [tz, setTz] = useState<string | undefined>(undefined)

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  function handleSelect(d: Date | undefined) {
    if (!d) return
    const iso = format(d, 'yyyy-MM-dd')
    onChange(iso)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[oklch(90%_0.005_260)] bg-surface hover:bg-surface-low hover:border-primary/40 transition-colors text-[13px] font-medium text-fg-muted">
        <span
          className="material-symbols-outlined text-[16px] text-primary"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          calendar_today
        </span>
        {formatLabel(date)}
        <span
          className="material-symbols-outlined text-[14px] opacity-50"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          expand_more
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={toDate(date)}
          onSelect={handleSelect}
          disabled={{ after: new Date() }}
          timeZone={tz}
        />
      </PopoverContent>
    </Popover>
  )
}
