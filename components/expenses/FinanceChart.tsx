'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { Expense, Income } from '@/lib/types'
import { last6Months, isSameMonth, formatCurrency } from '@/lib/dateUtils'

interface Props {
  expenses: Expense[]
  income: Income[]
}

export default function FinanceChart({ expenses, income }: Props) {
  const months = last6Months()

  const data = months.map(({ year, month, label }) => ({
    label,
    Income: income.filter(i => isSameMonth(i.date, year, month)).reduce((s, i) => s + i.amount, 0),
    Expenses: expenses.filter(e => isSameMonth(e.date, year, month)).reduce((s, e) => s + e.amount, 0),
  }))

  const formatter = (value: number) => formatCurrency(value)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses — Last 6 Months</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={22} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={formatter} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
