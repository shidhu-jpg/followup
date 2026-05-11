import { Client, RowStatus } from './types'
import { daysDiff, isOverdue, isDueToday } from './dateUtils'

export function getRowStatus(client: Client): RowStatus {
  if (!client.nextFollowUpDate) return 'none'
  if (isOverdue(client.nextFollowUpDate)) return 'overdue'
  if (isDueToday(client.nextFollowUpDate)) return 'today'
  return 'ok'
}

export function getOverdueClients(clients: Client[]): Client[] {
  return clients.filter(c => getRowStatus(c) === 'overdue')
}

export function getTodayClients(clients: Client[]): Client[] {
  return clients.filter(c => getRowStatus(c) === 'today')
}

export function getHotLeads(clients: Client[]): Client[] {
  return clients.filter(c => c.leadStage === 'Hot' && c.status !== 'Completed')
}

export function getPendingPayments(clients: Client[]): Client[] {
  return clients.filter(c => c.amountDue && c.amountDue > 0 && !c.isPaid)
}

export function getNoContactIn14Days(clients: Client[]): Client[] {
  return clients.filter(c => {
    if (!c.lastContactDate) return true
    const diff = daysDiff(c.lastContactDate)
    return diff !== null && diff <= -14
  })
}

export function getOverdueInvoices(clients: Client[]): Client[] {
  return clients.filter(c => {
    if (!c.amountDue || c.isPaid) return false
    return isOverdue(c.paymentDueDate)
  })
}
