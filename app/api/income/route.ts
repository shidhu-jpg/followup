import { NextResponse } from 'next/server'
import { readJson, writeJson, generateId } from '@/lib/jsonDb'
import { Income } from '@/lib/types'

export async function GET() {
  const income = readJson<Income>('income.json')
  return NextResponse.json(income)
}

export async function POST(request: Request) {
  const body = await request.json()
  const income = readJson<Income>('income.json')
  const newIncome: Income = {
    id: generateId(),
    clientName: body.clientName ?? '',
    clientId: body.clientId ?? null,
    amount: Number(body.amount) || 0,
    date: body.date ?? new Date().toISOString(),
    note: body.note ?? '',
  }
  income.push(newIncome)
  writeJson('income.json', income)
  return NextResponse.json(newIncome, { status: 201 })
}
