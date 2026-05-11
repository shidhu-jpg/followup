import { NextResponse } from 'next/server'
import { readJson, writeJson, generateId } from '@/lib/jsonDb'
import { Expense } from '@/lib/types'

export async function GET() {
  const expenses = readJson<Expense>('expenses.json')
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const body = await request.json()
  const expenses = readJson<Expense>('expenses.json')
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
  writeJson('expenses.json', expenses)
  return NextResponse.json(newExpense, { status: 201 })
}
