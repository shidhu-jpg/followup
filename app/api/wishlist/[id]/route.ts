import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { WishlistItem, Expense } from '@/lib/types'

export const runtime = 'edge'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const items = await readKv<WishlistItem>('wishlist')
  const idx = items.findIndex(w => w.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body._action === 'mark_purchased') {
    items[idx] = { ...items[idx], isPurchased: true, purchasedDate: new Date().toISOString() }
    await writeKv('wishlist', items)

    const expenses = await readKv<Expense>('expenses')
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
    await writeKv('expenses', expenses)
    return NextResponse.json({ wishlistItem: items[idx], expense: newExpense })
  }

  items[idx] = { ...items[idx], ...body }
  await writeKv('wishlist', items)
  return NextResponse.json(items[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const items = await readKv<WishlistItem>('wishlist')
  const filtered = items.filter(w => w.id !== params.id)
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await writeKv('wishlist', filtered)
  return NextResponse.json({ ok: true })
}
