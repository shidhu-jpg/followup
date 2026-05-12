import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { Income } from '@/lib/types'

export const runtime = 'edge'

export async function GET() {
  const income = await readKv<Income>('income')
  return NextResponse.json(income)
}

export async function POST(request: Request) {
  const body = await request.json()
  const income = await readKv<Income>('income')
  const newIncome: Income = {
    id: generateId(),
    clientName: body.clientName ?? '',
    clientId: body.clientId ?? null,
    amount: Number(body.amount) || 0,
    date: body.date ?? new Date().toISOString(),
    note: body.note ?? '',
  }
  income.push(newIncome)
  await writeKv('income', income)
  return NextResponse.json(newIncome, { status: 201 })
}
