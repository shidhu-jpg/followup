import { getRequestContext } from '@cloudflare/next-on-pages'

type Collection = 'clients' | 'expenses' | 'income' | 'wishlist'

interface KVNamespace {
  get(key: string, options: { type: 'json' }): Promise<unknown>
  put(key: string, value: string): Promise<void>
}

const SEED: Record<Collection, unknown[]> = {
  clients: [],
  expenses: [
    { id: 'e1', title: 'Figma Pro Subscription', amount: 1200, category: 'Software', date: '2026-05-01T00:00:00.000Z', clientId: null, receiptNote: 'Annual plan auto-renewed', expenseType: 'Business' },
    { id: 'e2', title: 'Domain & Hosting', amount: 3500, category: 'Software', date: '2026-05-02T00:00:00.000Z', clientId: null, receiptNote: 'GoDaddy invoice', expenseType: 'Business' },
    { id: 'e3', title: 'Facebook Ads — Lead Campaign', amount: 2000, category: 'Marketing', date: '2026-05-03T00:00:00.000Z', clientId: null, receiptNote: 'May campaign', expenseType: 'Business' },
    { id: 'e4', title: 'Freelance Copywriter', amount: 1800, category: 'Freelancer', date: '2026-05-05T00:00:00.000Z', clientId: null, receiptNote: 'Paid via UPI', expenseType: 'Business' },
    { id: 'e5', title: 'Mechanical Keyboard', amount: 5500, category: 'Hardware', date: '2026-05-07T00:00:00.000Z', clientId: null, receiptNote: 'Keychron K6', expenseType: 'Business' },
  ],
  income: [
    { id: 'i1', clientName: 'Priya Sharma', clientId: null, amount: 15000, date: '2026-04-12T00:00:00.000Z', note: '50% advance for website project' },
    { id: 'i2', clientName: 'Sunita Rao', clientId: null, amount: 22000, date: '2026-03-20T00:00:00.000Z', note: '50% advance for clinic website' },
  ],
  wishlist: [
    { id: 'w1', name: 'Adobe Creative Cloud', estimatedCost: 5000, priority: 'High', reason: 'Need Illustrator and After Effects', isPurchased: false, purchasedDate: null },
    { id: 'w2', name: 'Loom Pro Subscription', estimatedCost: 1500, priority: 'Medium', reason: 'Client walkthrough videos', isPurchased: false, purchasedDate: null },
    { id: 'w3', name: 'External SSD 1TB', estimatedCost: 4500, priority: 'Low', reason: 'Backup storage for project files', isPurchased: false, purchasedDate: null },
  ],
}

function getKV(): KVNamespace {
  const { env } = getRequestContext()
  return (env as Record<string, unknown>).KV as KVNamespace
}

export async function readKv<T>(collection: Collection): Promise<T[]> {
  const kv = getKV()
  const data = await kv.get(collection, { type: 'json' })
  if (data === null) {
    const seed = SEED[collection] as T[]
    await kv.put(collection, JSON.stringify(seed))
    return seed
  }
  return data as T[]
}

export async function writeKv<T>(collection: Collection, data: T[]): Promise<void> {
  await getKV().put(collection, JSON.stringify(data))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
