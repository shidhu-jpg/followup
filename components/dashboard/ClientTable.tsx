'use client'

import { useState } from 'react'
import { Client, ClientStatus, ProjectType } from '@/lib/types'
import { getRowStatus } from '@/lib/statusCalculators'
import { toDateStr } from '@/lib/dateUtils'
import { StatusBadge, LeadBadge } from '@/components/ui/StatusBadge'
import { ChevronUp, ChevronDown, Eye, Edit2, Trash2, Search, Filter } from 'lucide-react'

interface Props {
  clients: Client[]
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

type SortKey = 'name' | 'status' | 'nextFollowUpDate' | 'lastContactDate'

const rowBg: Record<string, string> = {
  overdue: 'bg-red-50 hover:bg-red-100/80',
  today: 'bg-amber-50 hover:bg-amber-100/80',
  ok: 'bg-white hover:bg-slate-50',
  none: 'bg-white hover:bg-slate-50',
}

export default function ClientTable({ clients, onView, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'All'>('All')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'All'>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'nextFollowUpDate', dir: 1 })

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 })
  }

  const filtered = clients
    .filter(c => {
      const q = search.toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.businessName.toLowerCase().includes(q)) return false
      if (statusFilter !== 'All' && c.status !== statusFilter) return false
      if (typeFilter !== 'All' && c.projectType !== typeFilter) return false
      return true
    })
    .sort((a, b) => {
      const av = a[sort.key] ?? ''
      const bv = b[sort.key] ?? ''
      return String(av).localeCompare(String(bv)) * sort.dir
    })

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k
      ? sort.dir === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      : <ChevronDown size={14} className="opacity-30" />

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">No clients yet. Add your first client to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ClientStatus | 'All')}
        >
          <option value="All">All Statuses</option>
          {['Lead', 'Active', 'Awaiting Payment', 'Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ProjectType | 'All')}
        >
          <option value="All">All Types</option>
          {['Website', 'Dental', 'Clinic', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Legend */}
      <div className="px-5 py-2 border-b border-slate-100 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Overdue</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Due Today</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Up to Date</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              {[
                { label: 'Client', key: 'name' as SortKey },
                { label: 'Type', key: null },
                { label: 'Status', key: 'status' as SortKey },
                { label: 'Last Contact', key: 'lastContactDate' as SortKey },
                { label: 'Next Follow-Up', key: 'nextFollowUpDate' as SortKey },
                { label: 'Actions', key: null },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${key ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                  onClick={key ? () => toggleSort(key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && <SortIcon k={key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(client => {
              const rowStatus = getRowStatus(client)
              return (
                <tr key={client.id} className={`transition-colors ${rowBg[rowStatus]}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{client.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-40">{client.businessName}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{client.projectType}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={client.status} />
                      <LeadBadge stage={client.leadStage} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{toDateStr(client.lastContactDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${rowStatus === 'overdue' ? 'text-red-600 font-medium' : rowStatus === 'today' ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                      {toDateStr(client.nextFollowUpDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(client)} className="p-1.5 rounded hover:bg-indigo-100 text-indigo-600 transition-colors" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => onEdit(client)} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => onDelete(client)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
