'use client'

import { useState } from 'react'
import { Client, ProjectType, ClientStatus, FollowUpType, LeadStage } from '@/lib/types'

interface Props {
  initial?: Partial<Client>
  onSubmit: (data: Partial<Client>) => void
  onCancel: () => void
  loading?: boolean
}

export default function ClientForm({ initial = {}, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    businessName: initial.businessName ?? '',
    phone: initial.phone ?? '',
    email: initial.email ?? '',
    projectType: (initial.projectType ?? 'Website') as ProjectType,
    status: (initial.status ?? 'Lead') as ClientStatus,
    notes: initial.notes ?? '',
    followUpType: (initial.followUpType ?? 'Project Update') as FollowUpType,
    leadStage: (initial.leadStage ?? '') as LeadStage | '',
    nextFollowUpDate: initial.nextFollowUpDate ? initial.nextFollowUpDate.split('T')[0] : '',
    amountDue: initial.amountDue?.toString() ?? '',
    paymentDueDate: initial.paymentDueDate ? initial.paymentDueDate.split('T')[0] : '',
    isPaid: initial.isPaid ?? false,
  })

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      leadStage: form.leadStage || null,
      nextFollowUpDate: form.nextFollowUpDate ? new Date(form.nextFollowUpDate).toISOString() : null,
      amountDue: form.amountDue ? Number(form.amountDue) : null,
      paymentDueDate: form.paymentDueDate ? new Date(form.paymentDueDate).toISOString() : null,
    })
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Business Name</label>
          <input className={inputCls} value={form.businessName} onChange={e => set('businessName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Project Type</label>
          <select className={inputCls} value={form.projectType} onChange={e => set('projectType', e.target.value)}>
            {['Website', 'Dental', 'Clinic', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {['Lead', 'Active', 'Awaiting Payment', 'Completed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Follow-Up Type</label>
          <select className={inputCls} value={form.followUpType} onChange={e => set('followUpType', e.target.value)}>
            {['Project Update', 'Sales/Lead', 'Invoice/Payment'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Next Follow-Up Date</label>
          <input type="date" className={inputCls} value={form.nextFollowUpDate} onChange={e => set('nextFollowUpDate', e.target.value)} />
        </div>
      </div>

      {form.followUpType === 'Sales/Lead' && (
        <div>
          <label className={labelCls}>Lead Stage</label>
          <select className={inputCls} value={form.leadStage} onChange={e => set('leadStage', e.target.value)}>
            <option value="">— None —</option>
            {['Cold', 'Warm', 'Hot', 'Converted'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      {form.followUpType === 'Invoice/Payment' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount Due (₹)</label>
            <input type="number" className={inputCls} value={form.amountDue} onChange={e => set('amountDue', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Payment Due Date</label>
            <input type="date" className={inputCls} value={form.paymentDueDate} onChange={e => set('paymentDueDate', e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Notes</label>
        <textarea rows={3} className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {form.followUpType === 'Invoice/Payment' && (
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)} className="rounded" />
          Mark as Paid
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Client'}
        </button>
      </div>
    </form>
  )
}
