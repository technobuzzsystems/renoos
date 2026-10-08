import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatArea(sqm: number): string {
  const sqft = Math.round(sqm * 10.7639)
  return `${sqm} m² / ${sqft} sq ft`
}
