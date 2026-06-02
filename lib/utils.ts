import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns YYYY-MM-DD in the user's local timezone. */
export function localDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA')
}
