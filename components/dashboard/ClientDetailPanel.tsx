'use client'

import { useState } from 'react'
import { Client } from '@/lib/types'
import { toDateStr, formatCurrency } from '@/lib/dateUtils'
import { StatusBadge, LeadBadge } from '@/components/ui/StatusBadge'
import FollowUpHistory from './FollowUpHistory'
import { Phone, Mail, Calendar, IndianRupee, MessageSquare, Clock, PhoneCall } from 'lucide-react'

interface Props {
  client: Client
  onMarkContacted: (note: string) => void
  onSnooze: (days: number) => void
  onAddNote: (note: string) => void
  onMarkPaid: () => void
  loading?: boolean
}

export default function ClientDetailPanel({ client, onMarkContacted, onSnooze, onAddNote, onMarkPaid, loading }: Props) {
  const [note, setNote] = useState('')
  const [tab, setTab] = useState<'details' | 'history'>('details')

  const handleMarkContacted = () => {
    onMarkContacted(note || 'Marked as contacted')
    setNote('')
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    onAddNote(note)
    setNote('')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{client.name}</h3>
          <p className="text-sm text-slate-500">{client.businessName}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <StatusBadge status={client.status} />
          <LeadBadge stage={client.leadStage} />
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {client.phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={14} className="text-slate-400" />
            <a href={`tel:${client.phone}`} className="hover:text-indigo-600">{client.phone}</a>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail size={14} className="text-slate-400" />
            <a href={`mailto:${client.email}`} className="hover:text-indigo-600 truncate">{client.email}</a>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>Last contact: {toDateStr(client.lastContactDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>Next follow-up: {toDateStr(client.nextFollowUpDate)}</span>
        </div>
      </div>

      {/* Payment info */}
      {client.amountDue && (
        <div className={`p-3 rounded-lg border text-sm ${client.isPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee size={14} className={client.isPaid ? 'text-green-600' : 'text-amber-600'} />
              <span className={client.isPaid ? 'text-green-700' : 'text-amber-700'}>
                {formatCurrency(client.amountDue)} — {client.isPaid ? 'Paid ✓' : `Due: ${toDateStr(client.paymentDueDate)}`}
              </span>
            </div>
            {!client.isPaid && (
              <button
                onClick={onMarkPaid}
                disabled={loading}
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Mark Paid
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-medium text-slate-400 mb-1">Notes</p>
          <p>{client.notes}</p>
        </div>
      )}

      {/* Quick note + actions */}
      <div>
        <textarea
          rows={2}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a note (optional)…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={handleMarkContacted}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <PhoneCall size={13} /> Mark Contacted
          </button>
          <button
            onClick={handleAddNote}
            disabled={loading || !note.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            <MessageSquare size={13} /> Save Note
          </button>
          {[3, 7, 14].map(days => (
            <button
              key={days}
              onClick={() => onSnooze(days)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Clock size={13} /> +{days}d
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-slate-200 mb-3">
          {(['details', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'details' && (
          <div className="text-sm space-y-2 text-slate-600">
            <p><span className="font-medium">Project Type:</span> {client.projectType}</p>
            <p><span className="font-medium">Follow-Up Type:</span> {client.followUpType}</p>
            <p><span className="font-medium">Added:</span> {toDateStr(client.dateAdded)}</p>
          </div>
        )}
        {tab === 'history' && <FollowUpHistory entries={client.followUpHistory} />}
      </div>
    </div>
  )
}
