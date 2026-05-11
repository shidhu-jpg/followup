export type ProjectType = 'Website' | 'Dental' | 'Clinic' | 'Other'
export type ClientStatus = 'Lead' | 'Active' | 'Awaiting Payment' | 'Completed'
export type FollowUpType = 'Project Update' | 'Sales/Lead' | 'Invoice/Payment'
export type LeadStage = 'Cold' | 'Warm' | 'Hot' | 'Converted'
export type ExpenseCategory = 'Software' | 'Hardware' | 'Marketing' | 'Travel' | 'Freelancer' | 'Misc'
export type ExpenseType = 'Business' | 'Wishlist'
export type WishlistPriority = 'Low' | 'Medium' | 'High'
export type FollowUpHistoryType = 'contacted' | 'note' | 'snoozed'

export interface FollowUpHistoryEntry {
  id: string
  date: string
  note: string
  type: FollowUpHistoryType
}

export interface Client {
  id: string
  name: string
  businessName: string
  phone: string
  email: string
  projectType: ProjectType
  status: ClientStatus
  notes: string
  dateAdded: string
  lastContactDate: string | null
  nextFollowUpDate: string | null
  followUpType: FollowUpType
  leadStage: LeadStage | null
  amountDue: number | null
  paymentDueDate: string | null
  isPaid: boolean
  followUpHistory: FollowUpHistoryEntry[]
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  clientId: string | null
  receiptNote: string
  expenseType: ExpenseType
}

export interface Income {
  id: string
  clientName: string
  clientId: string | null
  amount: number
  date: string
  note: string
}

export interface WishlistItem {
  id: string
  name: string
  estimatedCost: number
  priority: WishlistPriority
  reason: string
  isPurchased: boolean
  purchasedDate: string | null
}

export type RowStatus = 'overdue' | 'today' | 'ok' | 'none'
