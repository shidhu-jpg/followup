import { Client } from '@/lib/types'
import { getOverdueClients, getHotLeads, getPendingPayments } from '@/lib/statusCalculators'
import { formatCurrency } from '@/lib/dateUtils'
import { Users, AlertCircle, IndianRupee, Flame } from 'lucide-react'

export default function SummaryCards({ clients }: { clients: Client[] }) {
  const overdue = getOverdueClients(clients)
  const hotLeads = getHotLeads(clients)
  const pendingPay = getPendingPayments(clients)
  const pendingTotal = pendingPay.reduce((s, c) => s + (c.amountDue ?? 0), 0)

  const cards = [
    {
      label: 'Total Clients',
      value: clients.length,
      sub: `${clients.filter(c => c.status === 'Active').length} active`,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Overdue Follow-Ups',
      value: overdue.length,
      sub: overdue.length > 0 ? 'Needs attention' : 'All caught up',
      icon: AlertCircle,
      color: overdue.length > 0 ? 'text-red-600' : 'text-green-600',
      bg: overdue.length > 0 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(pendingTotal),
      sub: `${pendingPay.length} client(s)`,
      icon: IndianRupee,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Hot Leads',
      value: hotLeads.length,
      sub: hotLeads.map(c => c.name).slice(0, 2).join(', ') || 'None right now',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>
        </div>
      ))}
    </div>
  )
}
