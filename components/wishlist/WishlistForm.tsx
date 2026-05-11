'use client'

import { useState } from 'react'
import { WishlistItem, WishlistPriority } from '@/lib/types'

interface Props {
  initial?: Partial<WishlistItem>
  onSubmit: (data: Partial<WishlistItem>) => void
  onCancel: () => void
  loading?: boolean
}

export default function WishlistForm({ initial = {}, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    estimatedCost: initial.estimatedCost?.toString() ?? '',
    priority: (initial.priority ?? 'Medium') as WishlistPriority,
    reason: initial.reason ?? '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, estimatedCost: Number(form.estimatedCost) || 0 })
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Item Name *</label>
        <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Adobe Creative Cloud" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Estimated Cost (₹)</label>
          <input type="number" min="0" className={inputCls} value={form.estimatedCost} onChange={e => set('estimatedCost', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select className={inputCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Reason / Notes</label>
        <textarea rows={2} className={inputCls} value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Why do you want this?" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : 'Add to Wishlist'}
        </button>
      </div>
    </form>
  )
}
