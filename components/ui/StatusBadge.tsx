import { ClientStatus, LeadStage } from '@/lib/types'

const statusColors: Record<ClientStatus, string> = {
  Lead: 'bg-blue-100 text-blue-700',
  Active: 'bg-green-100 text-green-700',
  'Awaiting Payment': 'bg-amber-100 text-amber-700',
  Completed: 'bg-slate-100 text-slate-600',
}

const leadColors: Record<LeadStage, string> = {
  Cold: 'bg-sky-100 text-sky-700',
  Warm: 'bg-orange-100 text-orange-700',
  Hot: 'bg-red-100 text-red-700',
  Converted: 'bg-purple-100 text-purple-700',
}

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  )
}

export function LeadBadge({ stage }: { stage: LeadStage | null }) {
  if (!stage) return null
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leadColors[stage]}`}>
      {stage}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority] ?? 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  )
}
