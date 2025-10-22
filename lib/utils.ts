import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function paginate<T>(items: T[], page = 1, perPage = 6) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  const end = start + perPage
  return {
    items: items.slice(start, end),
    total,
    perPage,
    current,
    totalPages,
  }
}
