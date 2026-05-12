import { NextResponse } from 'next/server'
import { readKv, writeKv } from '@/lib/kvDb'
import { Income } from '@/lib/types'

export const runtime = 'edge'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const income = await readKv<Income>('income')
  const idx = income.findIndex(i => i.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  income[idx] = { ...income[idx], ...body }
  await writeKv('income', income)
  return NextResponse.json(income[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const income = await readKv<Income>('income')
  const filtered = income.filter(i => i.id !== params.id)
  if (filtered.length === income.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await writeKv('income', filtered)
  return NextResponse.json({ ok: true })
}
