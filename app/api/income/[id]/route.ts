import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonDb'
import { Income } from '@/lib/types'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const income = readJson<Income>('income.json')
  const idx = income.findIndex(i => i.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  income[idx] = { ...income[idx], ...body }
  writeJson('income.json', income)
  return NextResponse.json(income[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const income = readJson<Income>('income.json')
  const filtered = income.filter(i => i.id !== params.id)
  if (filtered.length === income.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  writeJson('income.json', filtered)
  return NextResponse.json({ ok: true })
}
