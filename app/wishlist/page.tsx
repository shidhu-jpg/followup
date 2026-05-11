'use client'

import { useState, useEffect, useCallback } from 'react'
import { WishlistItem } from '@/lib/types'
import { useToast } from '@/components/ui/ToastContext'
import WishlistForm from '@/components/wishlist/WishlistForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { PriorityBadge } from '@/components/ui/StatusBadge'
import { formatCurrency } from '@/lib/dateUtils'
import { Plus, ShoppingCart, CheckCircle2, Trash2, Edit2, RefreshCw, ShoppingBag } from 'lucide-react'

export default function WishlistPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<WishlistItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WishlistItem | null>(null)
  const [purchaseTarget, setPurchaseTarget] = useState<WishlistItem | null>(null)
  const [showPurchased, setShowPurchased] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist')
      setItems(await res.json())
    } catch { toast('Failed to load wishlist', 'error') } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleAdd = async (data: Partial<WishlistItem>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const created = await res.json()
      setItems(prev => [...prev, created])
      setAddOpen(false)
      toast('Added to wishlist')
    } catch { toast('Failed to add', 'error') } finally { setSaving(false) }
  }

  const handleEdit = async (data: Partial<WishlistItem>) => {
    if (!editItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/wishlist/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const updated = await res.json()
      setItems(prev => prev.map(w => w.id === updated.id ? updated : w))
      setEditItem(null)
      toast('Wishlist item updated')
    } catch { toast('Failed to update', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/wishlist/${deleteTarget.id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(w => w.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast('Item removed')
    } catch { toast('Failed to delete', 'error') }
  }

  const handleMarkPurchased = async () => {
    if (!purchaseTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/wishlist/${purchaseTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'mark_purchased' }),
      })
      const { wishlistItem } = await res.json()
      setItems(prev => prev.map(w => w.id === wishlistItem.id ? wishlistItem : w))
      setPurchaseTarget(null)
      toast(`"${wishlistItem.name}" marked as purchased and added to expenses`)
    } catch { toast('Failed to mark as purchased', 'error') } finally { setSaving(false) }
  }

  const unpurchased = items.filter(w => !w.isPurchased).sort((a, b) => {
    const p = { High: 0, Medium: 1, Low: 2 }
    return (p[a.priority] ?? 3) - (p[b.priority] ?? 3)
  })
  const purchased = items.filter(w => w.isPurchased)
  const totalCost = unpurchased.reduce((s, w) => s + w.estimatedCost, 0)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wishlist</h1>
          <p className="text-sm text-slate-500 mt-0.5">Items you want to purchase</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchItems} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Pending Items</p>
          <p className="text-2xl font-bold text-slate-800">{unpurchased.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Estimated Total</p>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Purchased</p>
          <p className="text-2xl font-bold text-green-700">{purchased.length}</p>
        </div>
      </div>

      {/* Pending items */}
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw size={24} className="animate-spin text-slate-400" /></div>
      ) : unpurchased.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShoppingCart size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">Your wishlist is empty. Add items you want to purchase.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600">Pending — {unpurchased.length} item{unpurchased.length !== 1 ? 's' : ''}</h2>
          {unpurchased.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-purple-50 shrink-0">
                <ShoppingBag size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    {item.reason && <p className="text-sm text-slate-500 mt-0.5">{item.reason}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-800">{formatCurrency(item.estimatedCost)}</p>
                    <div className="mt-1"><PriorityBadge priority={item.priority} /></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setPurchaseTarget(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 size={13} /> Mark Purchased
                  </button>
                  <button onClick={() => setEditItem(item)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchased section */}
      {purchased.length > 0 && (
        <div>
          <button
            onClick={() => setShowPurchased(v => !v)}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showPurchased ? '▾ Hide' : '▸ Show'} purchased items ({purchased.length})
          </button>
          {showPurchased && (
            <div className="mt-3 space-y-2">
              {purchased.map(item => (
                <div key={item.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-4 opacity-70">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 line-through">{item.name}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(item.estimatedCost)}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded hover:bg-red-100 text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add to Wishlist">
        <WishlistForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Wishlist Item">
        {editItem && <WishlistForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} loading={saving} />}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} title="Remove Item" message={`Remove "${deleteTarget?.name}" from wishlist?`} confirmLabel="Remove" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmDialog
        open={!!purchaseTarget}
        title="Mark as Purchased"
        message={`Mark "${purchaseTarget?.name}" as purchased? This will add ${formatCurrency(purchaseTarget?.estimatedCost ?? 0)} to your expenses.`}
        confirmLabel="Mark Purchased"
        danger={false}
        onConfirm={handleMarkPurchased}
        onCancel={() => setPurchaseTarget(null)}
      />
    </div>
  )
}
