'use client'

import { useState } from 'react'
import { Income, Client } from '@/lib/types'

interface Props {
  clients: Client[]
  onSubmit: (data: Partial<Income>) => void
  onCancel: () => void
  loading?: boolean
}

export default function IncomeForm({ clients, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    clientName: '',
    clientId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleClientSelect = (clientId: string) => {
    const c = clients.find(c => c.id === clientId)
    setForm(f => ({ ...f, clientId, clientName: c ? `${c.name} — ${c.businessName}` : '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      clientName: form.clientName,
      clientId: form.clientId || null,
      amount: Number(form.amount) || 0,
      date: new Date(form.date).toISOString(),
      note: form.note,
    })
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Client (select or type name)</label>
        <select className={inputCls} value={form.clientId} onChange={e => handleClientSelect(e.target.value)}>
          <option value="">— Select client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>)}
        </select>
      </div>

      {!form.clientId && (
        <div>
          <label className={labelCls}>Or type client name manually</label>
          <input className={inputCls} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Client name" />
        </div>
      )}

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

      <div>
        <label className={labelCls}>Note</label>
        <input className={inputCls} value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. 50% advance for website" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : 'Save Income'}
        </button>
      </div>
    </form>
  )
}
