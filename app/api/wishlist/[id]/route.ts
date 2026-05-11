import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonDb'
import { WishlistItem } from '@/lib/types'
import { Expense } from '@/lib/types'
import { generateId } from '@/lib/jsonDb'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const items = readJson<WishlistItem>('wishlist.json')
  const idx = items.findIndex(w => w.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If marking as purchased, move to expenses
  if (body._action === 'mark_purchased') {
    items[idx] = { ...items[idx], isPurchased: true, purchasedDate: new Date().toISOString() }
    writeJson('wishlist.json', items)

    // Add to expenses
    const expenses = readJson<Expense>('expenses.json')
    const newExpense: Expense = {
      id: generateId(),
      title: items[idx].name,
      amount: items[idx].estimatedCost,
      category: 'Misc',
      date: new Date().toISOString(),
      clientId: null,
      receiptNote: `Converted from wishlist: ${items[idx].reason}`,
      expenseType: 'Business',
    }
    expenses.push(newExpense)
    writeJson('expenses.json', expenses)
    return NextResponse.json({ wishlistItem: items[idx], expense: newExpense })
  }

  items[idx] = { ...items[idx], ...body }
  writeJson('wishlist.json', items)
  return NextResponse.json(items[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const items = readJson<WishlistItem>('wishlist.json')
  const filtered = items.filter(w => w.id !== params.id)
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  writeJson('wishlist.json', filtered)
  return NextResponse.json({ ok: true })
}
