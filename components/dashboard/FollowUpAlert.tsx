'use client'

import { Client } from '@/lib/types'
import { getOverdueClients, getTodayClients } from '@/lib/statusCalculators'
import { toDateStr } from '@/lib/dateUtils'
import { Bell, ChevronRight } from 'lucide-react'

interface Props {
  clients: Client[]
  onClientClick: (client: Client) => void
}

export default function FollowUpAlert({ clients, onClientClick }: Props) {
  const overdue = getOverdueClients(clients)
  const today = getTodayClients(clients)
  const all = [...overdue, ...today]

  if (all.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Bell size={16} className="text-green-600" />
        </div>
        <p className="text-sm text-green-700 font-medium">All follow-ups are up to date. Great work!</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
        <Bell size={16} className="text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-800">
          Today's Follow-Ups — {all.length} item{all.length !== 1 ? 's' : ''} need attention
        </h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {all.map(client => {
          const isOverdue = overdue.includes(client)
          return (
            <li key={client.id}>
              <button
                onClick={() => onClientClick(client)}
                className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{client.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {client.businessName} · {client.followUpType}
                    {isOverdue && (
                      <span className="text-red-500 ml-2">Overdue</span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{toDateStr(client.nextFollowUpDate)}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
