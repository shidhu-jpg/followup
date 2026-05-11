import { FollowUpHistoryEntry } from '@/lib/types'
import { toDateStr } from '@/lib/dateUtils'
import { MessageSquare, PhoneCall, Clock } from 'lucide-react'

const iconMap = {
  contacted: <PhoneCall size={14} className="text-green-600" />,
  note: <MessageSquare size={14} className="text-blue-600" />,
  snoozed: <Clock size={14} className="text-amber-600" />,
}

const bgMap = {
  contacted: 'bg-green-50 border-green-200',
  note: 'bg-blue-50 border-blue-200',
  snoozed: 'bg-amber-50 border-amber-200',
}

export default function FollowUpHistory({ entries }: { entries: FollowUpHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400 italic text-center py-4">No history yet.</p>
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <ol className="space-y-2">
      {sorted.map(entry => (
        <li key={entry.id} className={`flex gap-3 p-3 rounded-lg border text-sm ${bgMap[entry.type]}`}>
          <div className="mt-0.5 shrink-0">{iconMap[entry.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-700">{entry.note}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(entry.date).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
