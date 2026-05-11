import { NextResponse } from 'next/server'
import { readJson, writeJson, generateId } from '@/lib/jsonDb'
import { Client } from '@/lib/types'

export async function GET() {
  const clients = readJson<Client>('clients.json')
  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const body = await request.json()
  const clients = readJson<Client>('clients.json')
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
  writeJson('clients.json', clients)
  return NextResponse.json(newClient, { status: 201 })
}
