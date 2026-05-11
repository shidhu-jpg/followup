export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function toDateStr(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function daysDiff(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const d = new Date(isoDate)
  d.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

export function isOverdue(isoDate: string | null | undefined): boolean {
  const diff = daysDiff(isoDate)
  return diff !== null && diff < 0
}

export function isDueToday(isoDate: string | null | undefined): boolean {
  const diff = daysDiff(isoDate)
  return diff === 0
}

export function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function currentMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

export function isSameMonth(isoDate: string, year: number, month: number): boolean {
  const d = new Date(isoDate)
  return d.getFullYear() === year && d.getMonth() === month
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export function last6Months(): Array<{ year: number; month: number; label: string }> {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth(), label: monthLabel(d.getFullYear(), d.getMonth()) })
  }
  return result
}
