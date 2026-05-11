import { NextResponse } from 'next/server'
import { readJson } from '@/lib/jsonDb'
import { Client, Expense, Income, WishlistItem } from '@/lib/types'
import { generateSummary } from '@/lib/summaryGenerator'

export async function GET() {
  const clients = readJson<Client>('clients.json')
  const expenses = readJson<Expense>('expenses.json')
  const income = readJson<Income>('income.json')
  const wishlist = readJson<WishlistItem>('wishlist.json')
  const summary = generateSummary(clients, expenses, income, wishlist)
  return NextResponse.json({ summary })
}
