import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  try { return format(new Date(date), 'dd.MM.yyyy') } catch { return '—' }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  try { return format(new Date(date), 'dd.MM.yyyy HH:mm') } catch { return '—' }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const PROJECT_STATUSES = {
  NEW:          { label: 'Yangi',          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  CONCEPT:      { label: 'Konsept',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  SKETCH:       { label: 'Eskiz',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  THREE_D:      { label: '3D',             color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  WORKING_DESIGN:{ label: 'Ishchi loyiha', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  CONSTRUCTION: { label: 'Qurilish',       color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  COMPLETED:    { label: 'Tugallangan',    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
} as const

export const TASK_PRIORITIES = {
  LOW:    { label: 'Past',    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  MEDIUM: { label: "O'rta",  color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' },
  HIGH:   { label: 'Yuqori', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
} as const

export const TASK_STATUSES = {
  TODO:        { label: 'Bajarilmagan', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  IN_PROGRESS: { label: 'Jarayonda',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  DONE:        { label: 'Bajarildi',   color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
} as const

export const EXPENSE_CATEGORIES: Record<string, string> = {
  RENT: 'Ijara', SOFTWARE: "Dasturiy ta'minot", EQUIPMENT: 'Jihozlar',
  OFFICE_SUPPLIES: 'Ofis mahsulotlari', TRANSPORT: 'Transport',
  MARKETING: 'Marketing', SALARY: 'Maosh', UTILITIES: 'Kommunal', OTHER: 'Boshqa',
}

export const INCOME_CATEGORIES: Record<string, string> = {
  PROJECT_PAYMENT: "Loyiha to'lovi", CONSULTATION: 'Konsultatsiya',
  ADVANCE: 'Avans', OTHER: 'Boshqa',
}

export const DOCUMENT_FOLDERS: Record<string, string> = {
  CONTRACTS: 'Shartnomalar', DRAWINGS: 'Chizmalar',
  REPORTS: 'Hisobotlar', PERMITS: 'Ruxsatnomalar', OTHER: 'Boshqa',
}
