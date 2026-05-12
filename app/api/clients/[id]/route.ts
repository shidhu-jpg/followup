import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { Client, FollowUpHistoryEntry } from '@/lib/types'
import { addDays } from '@/lib/dateUtils'

export const runtime = 'edge'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const clients = await readKv<Client>('clients')
  const client = clients.find(c => c.id === params.id)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const clients = await readKv<Client>('clients')
  const idx = clients.findIndex(c => c.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body._action === 'mark_contacted') {
    const note = body.note ?? 'Marked as contacted'
    const entry: FollowUpHistoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      note,
      type: 'contacted',
    }
    clients[idx] = {
      ...clients[idx],
      lastContactDate: new Date().toISOString(),
      followUpHistory: [...clients[idx].followUpHistory, entry],
    }
    await writeKv('clients', clients)
    return NextResponse.json(clients[idx])
  }

  if (body._action === 'snooze') {
    const days: number = body.days ?? 7
    const entry: FollowUpHistoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      note: `Snoozed for ${days} days`,
      type: 'snoozed',
    }
    clients[idx] = {
      ...clients[idx],
      nextFollowUpDate: addDays(days),
      followUpHistory: [...clients[idx].followUpHistory, entry],
    }
    await writeKv('clients', clients)
    return NextResponse.json(clients[idx])
  }

  if (body._action === 'add_note') {
    const entry: FollowUpHistoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      note: body.note ?? '',
      type: 'note',
    }
    clients[idx] = {
      ...clients[idx],
      followUpHistory: [...clients[idx].followUpHistory, entry],
    }
    await writeKv('clients', clients)
    return NextResponse.json(clients[idx])
  }

  const { _action, ...updates } = body
  clients[idx] = { ...clients[idx], ...updates }
  await writeKv('clients', clients)
  return NextResponse.json(clients[idx])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const clients = await readKv<Client>('clients')
  const filtered = clients.filter(c => c.id !== params.id)
  if (filtered.length === clients.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await writeKv('clients', filtered)
  return NextResponse.json({ ok: true })
}
