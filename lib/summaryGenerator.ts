import { Client, Expense, Income, WishlistItem } from './types'
import {
  getOverdueClients,
  getHotLeads,
  getPendingPayments,
  getNoContactIn14Days,
  getOverdueInvoices,
} from './statusCalculators'
import { toDateStr, daysDiff, formatCurrency, last6Months, isSameMonth } from './dateUtils'

export function generateSummary(
  clients: Client[],
  expenses: Expense[],
  income: Income[],
  wishlist: WishlistItem[]
): string {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const lines: string[] = []

  lines.push(`AGENCY SITUATION REPORT — ${today}`)
  lines.push('='.repeat(60))
  lines.push('')

  // Section 1 — Client Overview
  lines.push('SECTION 1 — CLIENT OVERVIEW')
  lines.push('-'.repeat(40))
  lines.push(`Total Clients: ${clients.length}`)

  const byStatus = ['Lead', 'Active', 'Awaiting Payment', 'Completed'].map(s => ({
    label: s,
    count: clients.filter(c => c.status === s).length,
  }))
  byStatus.forEach(({ label, count }) => {
    if (count > 0) lines.push(`  • ${label}: ${count}`)
  })
  lines.push('')

  const overdue = getOverdueClients(clients)
  lines.push(`Overdue Follow-Ups (${overdue.length}):`)
  if (overdue.length === 0) {
    lines.push('  None')
  } else {
    overdue.forEach(c => {
      const daysAgo = Math.abs(daysDiff(c.nextFollowUpDate) ?? 0)
      lines.push(`  • ${c.name} (${c.businessName}) — ${c.followUpType} — ${daysAgo} day(s) overdue`)
    })
  }
  lines.push('')

  const hotLeads = getHotLeads(clients)
  lines.push(`Hot Leads (${hotLeads.length}):`)
  if (hotLeads.length === 0) {
    lines.push('  None')
  } else {
    hotLeads.forEach(c => lines.push(`  • ${c.name} — ${c.businessName} — ${c.projectType}`))
  }
  lines.push('')

  const pending = getPendingPayments(clients)
  lines.push(`Pending Invoices (${pending.length}):`)
  if (pending.length === 0) {
    lines.push('  None')
  } else {
    pending.forEach(c =>
      lines.push(`  • ${c.name} — ${formatCurrency(c.amountDue ?? 0)} — Due: ${toDateStr(c.paymentDueDate)}`)
    )
  }
  lines.push('')

  // Section 2 — Financial Snapshot
  lines.push('SECTION 2 — FINANCIAL SNAPSHOT')
  lines.push('-'.repeat(40))

  const now = new Date()
  const curY = now.getFullYear()
  const curM = now.getMonth()

  const monthIncome = income.filter(i => isSameMonth(i.date, curY, curM)).reduce((s, i) => s + i.amount, 0)
  const monthExpenses = expenses.filter(e => isSameMonth(e.date, curY, curM)).reduce((s, e) => s + e.amount, 0)
  const net = monthIncome - monthExpenses

  lines.push(`This Month (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}):`)
  lines.push(`  Income:   ${formatCurrency(monthIncome)}`)
  lines.push(`  Expenses: ${formatCurrency(monthExpenses)}`)
  lines.push(`  Net:      ${formatCurrency(net)} ${net >= 0 ? '✓' : '⚠ DEFICIT'}`)
  lines.push('')

  const catTotals: Record<string, number> = {}
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount
  })
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 3)
  lines.push('Top Expense Categories (all time):')
  topCats.forEach(([cat, amt]) => lines.push(`  • ${cat}: ${formatCurrency(amt)}`))
  lines.push('')

  const unpurchasedWishlist = wishlist.filter(w => !w.isPurchased)
  const wishlistTotal = unpurchasedWishlist.reduce((s, w) => s + w.estimatedCost, 0)
  lines.push(`Wishlist Items Pending (${unpurchasedWishlist.length}) — Est. Total: ${formatCurrency(wishlistTotal)}`)
  unpurchasedWishlist.forEach(w => lines.push(`  • ${w.name} — ${formatCurrency(w.estimatedCost)} [${w.priority}]`))
  lines.push('')

  // Section 3 — Flags & Concerns
  lines.push('SECTION 3 — FLAGS & CONCERNS')
  lines.push('-'.repeat(40))

  const noContact = getNoContactIn14Days(clients)
  lines.push(`Clients with no contact in 14+ days (${noContact.length}):`)
  noContact.forEach(c => {
    const days = c.lastContactDate ? Math.abs(daysDiff(c.lastContactDate) ?? 0) : 'never'
    lines.push(`  • ${c.name} — last contact: ${c.lastContactDate ? toDateStr(c.lastContactDate) : 'never'} (${days} days ago)`)
  })
  if (noContact.length === 0) lines.push('  None')
  lines.push('')

  const overdueInvoices = getOverdueInvoices(clients)
  lines.push(`Unpaid invoices older than 7 days (${overdueInvoices.length}):`)
  overdueInvoices.forEach(c =>
    lines.push(`  • ${c.name} — ${formatCurrency(c.amountDue ?? 0)} — Due: ${toDateStr(c.paymentDueDate)}`)
  )
  if (overdueInvoices.length === 0) lines.push('  None')
  lines.push('')

  const months = last6Months()
  const deficitMonths = months.filter(({ year, month }) => {
    const mIncome = income.filter(i => isSameMonth(i.date, year, month)).reduce((s, i) => s + i.amount, 0)
    const mExpenses = expenses.filter(e => isSameMonth(e.date, year, month)).reduce((s, e) => s + e.amount, 0)
    return mExpenses > mIncome
  })
  lines.push(`Months where expenses exceeded income (last 6 months):`)
  deficitMonths.forEach(({ label }) => lines.push(`  • ${label}`))
  if (deficitMonths.length === 0) lines.push('  None')
  lines.push('')

  // Section 4 — Questions (placeholder)
  lines.push('SECTION 4 — OPEN QUESTIONS FOR ADVISOR')
  lines.push('-'.repeat(40))
  lines.push('[Your questions will appear here]')
  lines.push('')
  lines.push('='.repeat(60))

  return lines.join('\n')
}
