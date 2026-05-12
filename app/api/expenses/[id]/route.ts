import { NextResponse } from 'next/server'
import { readKv, writeKv } from '@/lib/kvDb'
import { Expense } from '@/lib/types'

export const runtime = 'edge'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const expenses = await readKv<Expense>('expenses')
  const idx = expenses.findIndex(e => e.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  expenses[idx] = { ...expenses[idx], ...body }
  await writeKv('expenses', expenses)
  return NextResponse.json(expenses[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const expenses = await readKv<Expense>('expenses')
  const filtered = expenses.filter(e => e.id !== params.id)
  if (filtered.length === expenses.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await writeKv('expenses', filtered)
  return NextResponse.json({ ok: true })
}
