import { NextResponse } from 'next/server'
import { readKv, writeKv, generateId } from '@/lib/kvDb'
import { Client } from '@/lib/types'

export const runtime = 'edge'

export async function GET() {
  const clients = await readKv<Client>('clients')
  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const body = await request.json()
  const clients = await readKv<Client>('clients')
  const newClient: Client = {
    id: generateId(),
    name: body.name ?? '',
    businessName: body.businessName ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    projectType: body.projectType ?? 'Website',
    status: body.status ?? 'Lead',
    notes: body.notes ?? '',
    dateAdded: new Date().toISOString(),
    lastContactDate: null,
    nextFollowUpDate: body.nextFollowUpDate ?? null,
    followUpType: body.followUpType ?? 'Project Update',
    leadStage: body.leadStage ?? null,
    amountDue: body.amountDue ?? null,
    paymentDueDate: body.paymentDueDate ?? null,
    isPaid: false,
    followUpHistory: [],
  }
  clients.push(newClient)
  await writeKv('clients', clients)
  return NextResponse.json(newClient, { status: 201 })
}
