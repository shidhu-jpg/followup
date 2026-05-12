import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { Expense } from '@/lib/types'

export const runtime = 'edge'

export async function GET() {
  const expenses = await readKv<Expense>('expenses')
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const body = await request.json()
  const expenses = await readKv<Expense>('expenses')
  const newExpense: Expense = {
    id: generateId(),
    title: body.title ?? '',
    amount: Number(body.amount) || 0,
    category: body.category ?? 'Misc',
    date: body.date ?? new Date().toISOString(),
    clientId: body.clientId ?? null,
    receiptNote: body.receiptNote ?? '',
    expenseType: body.expenseType ?? 'Business',
  }
  expenses.push(newExpense)
  await writeKv('expenses', expenses)
  return NextResponse.json(newExpense, { status: 201 })
}
