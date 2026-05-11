import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonDb'
import { Expense } from '@/lib/types'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const expenses = readJson<Expense>('expenses.json')
  const idx = expenses.findIndex(e => e.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  expenses[idx] = { ...expenses[idx], ...body }
  writeJson('expenses.json', expenses)
  return NextResponse.json(expenses[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const expenses = readJson<Expense>('expenses.json')
  const filtered = expenses.filter(e => e.id !== params.id)
  if (filtered.length === expenses.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  writeJson('expenses.json', filtered)
  return NextResponse.json({ ok: true })
}
