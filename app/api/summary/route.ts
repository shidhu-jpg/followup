import { NextResponse } from 'next/server'
import { readKv } from '@/lib/kvDb'
import { Client, Expense, Income, WishlistItem } from '@/lib/types'
import { generateSummary } from '@/lib/summaryGenerator'

export const runtime = 'edge'

export async function GET() {
  const [clients, expenses, income, wishlist] = await Promise.all([
    readKv<Client>('clients'),
    readKv<Expense>('expenses'),
    readKv<Income>('income'),
    readKv<WishlistItem>('wishlist'),
  ])
  const summary = generateSummary(clients, expenses, income, wishlist)
  return NextResponse.json({ summary })
}
