import { NextResponse } from 'next/server'
import { readJson, writeJson, generateId } from '@/lib/jsonDb'
import { WishlistItem } from '@/lib/types'

export async function GET() {
  const items = readJson<WishlistItem>('wishlist.json')
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const items = readJson<WishlistItem>('wishlist.json')
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
  writeJson('wishlist.json', items)
  return NextResponse.json(newItem, { status: 201 })
}
