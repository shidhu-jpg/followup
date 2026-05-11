'use client'

import { useState } from 'react'
import { Expense, ExpenseCategory, ExpenseType, Client } from '@/lib/types'

interface Props {
  initial?: Partial<Expense>
  clients: Client[]
  onSubmit: (data: Partial<Expense>) => void
  onCancel: () => void
  loading?: boolean
}

export default function ExpenseForm({ initial = {}, clients, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    title: initial.title ?? '',
    amount: initial.amount?.toString() ?? '',
    category: (initial.category ?? 'Software') as ExpenseCategory,
    date: initial.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
    clientId: initial.clientId ?? '',
    receiptNote: initial.receiptNote ?? '',
    expenseType: (initial.expenseType ?? 'Business') as ExpenseType,
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      amount: Number(form.amount) || 0,
      clientId: form.clientId || null,
      date: new Date(form.date).toISOString(),
    })
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Title *</label>
        <input required className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Figma subscription" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Amount (₹) *</label>
          <input required type="number" min="0" className={inputCls} value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {['Software', 'Hardware', 'Marketing', 'Travel', 'Freelancer', 'Misc'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={form.expenseType} onChange={e => set('expenseType', e.target.value)}>
            <option value="Business">Business Expense</option>
            <option value="Wishlist">Wishlist / Want to Buy</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Client (optional)</label>
        <select className={inputCls} value={form.clientId} onChange={e => set('clientId', e.target.value)}>
          <option value="">— Not client-specific —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Receipt / Note</label>
        <input className={inputCls} value={form.receiptNote} onChange={e => set('receiptNote', e.target.value)} placeholder="e.g. Invoice #123" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : 'Save Expense'}
        </button>
      </div>
    </form>
  )
}
