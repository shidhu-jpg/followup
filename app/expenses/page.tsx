'use client'

import { useState, useEffect, useCallback } from 'react'
import { Expense, Income, Client } from '@/lib/types'
import { useToast } from '@/components/ui/ToastContext'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import IncomeForm from '@/components/expenses/IncomeForm'
import FinanceChart from '@/components/expenses/FinanceChart'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { toDateStr, formatCurrency, currentMonth, isSameMonth, monthLabel } from '@/lib/dateUtils'
import { PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, RefreshCw, Edit2 } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  Software: 'bg-blue-100 text-blue-700',
  Hardware: 'bg-purple-100 text-purple-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Travel: 'bg-amber-100 text-amber-700',
  Freelancer: 'bg-teal-100 text-teal-700',
  Misc: 'bg-slate-100 text-slate-600',
}

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [addExpOpen, setAddExpOpen] = useState(false)
  const [editExp, setEditExp] = useState<Expense | null>(null)
  const [addIncOpen, setAddIncOpen] = useState(false)
  const [deleteExpTarget, setDeleteExpTarget] = useState<Expense | null>(null)
  const [deleteIncTarget, setDeleteIncTarget] = useState<Income | null>(null)
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [e, i, c] = await Promise.all([
        fetch('/api/expenses').then(r => r.json()),
        fetch('/api/income').then(r => r.json()),
        fetch('/api/clients').then(r => r.json()),
      ])
      setExpenses(e)
      setIncome(i)
      setClients(c)
    } catch {
      toast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddExpense = async (data: Partial<Expense>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const created = await res.json()
      setExpenses(prev => [...prev, created])
      setAddExpOpen(false)
      toast('Expense added')
    } catch { toast('Failed to add expense', 'error') } finally { setSaving(false) }
  }

  const handleEditExpense = async (data: Partial<Expense>) => {
    if (!editExp) return
    setSaving(true)
    try {
      const res = await fetch(`/api/expenses/${editExp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const updated = await res.json()
      setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
      setEditExp(null)
      toast('Expense updated')
    } catch { toast('Failed to update', 'error') } finally { setSaving(false) }
  }

  const handleDeleteExpense = async () => {
    if (!deleteExpTarget) return
    try {
      await fetch(`/api/expenses/${deleteExpTarget.id}`, { method: 'DELETE' })
      setExpenses(prev => prev.filter(e => e.id !== deleteExpTarget.id))
      setDeleteExpTarget(null)
      toast('Expense deleted')
    } catch { toast('Failed to delete', 'error') }
  }

  const handleAddIncome = async (data: Partial<Income>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/income', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const created = await res.json()
      setIncome(prev => [...prev, created])
      setAddIncOpen(false)
      toast('Income entry added')
    } catch { toast('Failed to add income', 'error') } finally { setSaving(false) }
  }

  const handleDeleteIncome = async () => {
    if (!deleteIncTarget) return
    try {
      await fetch(`/api/income/${deleteIncTarget.id}`, { method: 'DELETE' })
      setIncome(prev => prev.filter(i => i.id !== deleteIncTarget.id))
      setDeleteIncTarget(null)
      toast('Income entry deleted')
    } catch { toast('Failed to delete', 'error') }
  }

  const { year, month } = currentMonth()
  const monthIncome = income.filter(i => isSameMonth(i.date, year, month)).reduce((s, i) => s + i.amount, 0)
  const monthExpenses = expenses.filter(e => isSameMonth(e.date, year, month)).reduce((s, e) => s + e.amount, 0)
  const net = monthIncome - monthExpenses

  const clientName = (id: string | null) => {
    if (!id) return null
    return clients.find(c => c.id === id)?.name ?? null
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedIncome = [...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expense Tracker</h1>
          <p className="text-sm text-slate-500 mt-0.5">{monthLabel(year, month)} overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setAddIncOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            <TrendingUp size={16} /> Add Income
          </button>
          <button onClick={() => setAddExpOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <PlusCircle size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(monthIncome), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Expenses', value: formatCurrency(monthExpenses), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Net Profit', value: formatCurrency(net), icon: DollarSign, color: net >= 0 ? 'text-indigo-600' : 'text-red-600', bg: net >= 0 ? 'bg-indigo-50' : 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`p-2 rounded-lg ${bg}`}><Icon size={16} className={color} /></div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">This month</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {!loading && <FinanceChart expenses={expenses} income={income} />}

      {/* Tabs */}
      <div>
        <div className="flex border-b border-slate-200 mb-4">
          {(['expenses', 'income'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t === 'expenses' ? `Expenses (${expenses.length})` : `Income (${income.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {sortedExpenses.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No expenses logged yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{exp.title}</p>
                        {exp.receiptNote && <p className="text-xs text-slate-400 truncate max-w-48">{exp.receiptNote}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[exp.category] ?? 'bg-slate-100 text-slate-600'}`}>{exp.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{clientName(exp.clientId) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{toDateStr(exp.date)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(exp.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditExp(exp)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteExpTarget(exp)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {activeTab === 'income' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {sortedIncome.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No income entries yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedIncome.map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{inc.clientName || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-60">{inc.note || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{toDateStr(inc.date)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(inc.amount)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteIncTarget(inc)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(income.reduce((s, i) => s + i.amount, 0))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal open={addExpOpen} onClose={() => setAddExpOpen(false)} title="Add Expense">
        <ExpenseForm clients={clients} onSubmit={handleAddExpense} onCancel={() => setAddExpOpen(false)} loading={saving} />
      </Modal>
      <Modal open={!!editExp} onClose={() => setEditExp(null)} title="Edit Expense">
        {editExp && <ExpenseForm initial={editExp} clients={clients} onSubmit={handleEditExpense} onCancel={() => setEditExp(null)} loading={saving} />}
      </Modal>
      <Modal open={addIncOpen} onClose={() => setAddIncOpen(false)} title="Add Income Entry">
        <IncomeForm clients={clients} onSubmit={handleAddIncome} onCancel={() => setAddIncOpen(false)} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteExpTarget} title="Delete Expense" message={`Delete "${deleteExpTarget?.title}"?`} confirmLabel="Delete" onConfirm={handleDeleteExpense} onCancel={() => setDeleteExpTarget(null)} />
      <ConfirmDialog open={!!deleteIncTarget} title="Delete Income Entry" message={`Delete income entry from ${deleteIncTarget?.clientName}?`} confirmLabel="Delete" onConfirm={handleDeleteIncome} onCancel={() => setDeleteIncTarget(null)} />
    </div>
  )
}
