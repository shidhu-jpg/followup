import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { WishlistItem } from '@/lib/types'

export const runtime = 'edge'

export async function GET() {
  const items = await readKv<WishlistItem>('wishlist')
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const items = await readKv<WishlistItem>('wishlist')
  const newItem: WishlistItem = {
    id: generateId(),
    name: body.name ?? '',
    estimatedCost: Number(body.estimatedCost) || 0,
    priority: body.priority ?? 'Medium',
    reason: body.reason ?? '',
    isPurchased: false,
    purchasedDate: null,
  }
  items.push(newItem)
  await writeKv('wishlist', items)
  return NextResponse.json(newItem, { status: 201 })
}
