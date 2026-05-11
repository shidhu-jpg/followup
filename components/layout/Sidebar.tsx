'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  BrainCircuit,
  Menu,
  X,
  Building2,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/wishlist', label: 'Wishlist', icon: ShoppingCart },
  { href: '/advisor', label: 'AI Advisor', icon: BrainCircuit },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <nav className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-700 flex items-center gap-3">
        <Building2 className="text-indigo-400 shrink-0" size={22} />
        <div>
          <p className="text-white font-bold text-sm leading-tight">Agency Command</p>
          <p className="text-slate-400 text-xs">Center</p>
        </div>
      </div>

      <ul className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">Local use only • No auth</p>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-slate-900 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 flex items-center justify-between px-4 h-14 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="text-indigo-400" size={20} />
          <span className="text-white font-bold text-sm">Agency Command Center</span>
        </div>
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="text-slate-400 hover:text-white p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-56 bg-slate-900 h-full pt-14">
            <NavContent />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  )
}
