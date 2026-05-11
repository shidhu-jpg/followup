'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client } from '@/lib/types'
import { useToast } from '@/components/ui/ToastContext'
import SummaryCards from '@/components/dashboard/SummaryCards'
import FollowUpAlert from '@/components/dashboard/FollowUpAlert'
import ClientTable from '@/components/dashboard/ClientTable'
import ClientForm from '@/components/dashboard/ClientForm'
import ClientDetailPanel from '@/components/dashboard/ClientDetailPanel'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { UserPlus, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      setClients(await res.json())
    } catch {
      toast('Failed to load clients', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleAdd = async (data: Partial<Client>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const created = await res.json()
      setClients(prev => [...prev, created])
      setAddOpen(false)
      toast('Client added successfully')
    } catch {
      toast('Failed to add client', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data: Partial<Client>) => {
    if (!editClient) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${editClient.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const updated = await res.json()
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      setEditClient(null)
      if (viewClient?.id === updated.id) setViewClient(updated)
      toast('Client updated')
    } catch {
      toast('Failed to update client', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' })
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id))
      if (viewClient?.id === deleteTarget.id) setViewClient(null)
      setDeleteTarget(null)
      toast('Client deleted')
    } catch {
      toast('Failed to delete client', 'error')
    }
  }

  const handleClientAction = async (action: string, extra?: unknown) => {
    if (!viewClient) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${viewClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: action, ...((extra as object) ?? {}) }),
      })
      const updated = await res.json()
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      setViewClient(updated)
      const msgs: Record<string, string> = {
        mark_contacted: 'Marked as contacted',
        snooze: 'Follow-up snoozed',
        add_note: 'Note saved',
      }
      toast(msgs[action] ?? 'Updated')
    } catch {
      toast('Action failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!viewClient) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${viewClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true }),
      })
      const updated = await res.json()
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      setViewClient(updated)
      toast('Payment marked as received')
    } catch {
      toast('Failed to update payment', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Client Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage follow-ups, leads, and payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchClients}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus size={16} /> Add Client
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw size={24} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <SummaryCards clients={clients} />
          <FollowUpAlert clients={clients} onClientClick={setViewClient} />
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">All Clients</h2>
            <ClientTable
              clients={clients}
              onView={setViewClient}
              onEdit={setEditClient}
              onDelete={setDeleteTarget}
            />
          </div>
        </>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Client">
        <ClientForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editClient} onClose={() => setEditClient(null)} title="Edit Client">
        {editClient && (
          <ClientForm initial={editClient} onSubmit={handleEdit} onCancel={() => setEditClient(null)} loading={saving} />
        )}
      </Modal>

      {/* View/Action Modal */}
      <Modal open={!!viewClient} onClose={() => setViewClient(null)} title="Client Details" maxWidth="max-w-xl">
        {viewClient && (
          <ClientDetailPanel
            client={viewClient}
            loading={saving}
            onMarkContacted={note => handleClientAction('mark_contacted', { note })}
            onSnooze={days => handleClientAction('snooze', { days })}
            onAddNote={note => handleClientAction('add_note', { note })}
            onMarkPaid={handleMarkPaid}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Client"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
