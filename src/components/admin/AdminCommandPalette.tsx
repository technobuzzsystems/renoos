import React, { useState, useEffect } from 'react'
import {
  Command,
  Search,
  Plus,
  Calendar,
  Bed,
  Users,
  Wallet,
  ExternalLink,
  RefreshCw,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react'
import type { BookingRecord } from '@/services/adminApi'

interface AdminCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenWalkIn: () => void
  onNavigateToTab: (tab: 'overview' | 'bookings' | 'rooms' | 'guests' | 'financials') => void
  onRefresh: () => void
  onExitToWebsite: () => void
  bookings: BookingRecord[]
  onSelectBooking: (b: BookingRecord) => void
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenWalkIn,
  onNavigateToTab,
  onRefresh,
  onExitToWebsite,
  bookings,
  onSelectBooking,
}) => {
  const [query, setQuery] = useState('')

  // Handle Cmd+K / Ctrl+K / Cmd+Space keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'Space')) {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const actionItems = [
    {
      id: 'act-walkin',
      title: 'New Walk-In Reservation',
      category: 'Front Desk',
      icon: Plus,
      action: () => {
        onClose()
        onOpenWalkIn()
      },
    },
    {
      id: 'act-bookings',
      title: 'View Reservations & PMS Folios',
      category: 'PMS',
      icon: Calendar,
      action: () => {
        onClose()
        onNavigateToTab('bookings')
      },
    },
    {
      id: 'act-rooms',
      title: 'Manage Suites, Tariffs & 14-Day Calendar',
      category: 'Operations',
      icon: Bed,
      action: () => {
        onClose()
        onNavigateToTab('rooms')
      },
    },
    {
      id: 'act-guests',
      title: 'Guest CRM Directory & Profiles',
      category: 'CRM',
      icon: Users,
      action: () => {
        onClose()
        onNavigateToTab('guests')
      },
    },
    {
      id: 'act-financials',
      title: 'Operating Vault & Tax Invoices',
      category: 'Finance',
      icon: Wallet,
      action: () => {
        onClose()
        onNavigateToTab('financials')
      },
    },
    {
      id: 'act-refresh',
      title: 'Force Sync PMS Live Data',
      category: 'System',
      icon: RefreshCw,
      action: () => {
        onClose()
        onRefresh()
      },
    },
    {
      id: 'act-tour',
      title: 'Open 360° Public Hotel Website',
      category: 'Preview',
      icon: ExternalLink,
      action: () => {
        onClose()
        onExitToWebsite()
      },
    },
  ]

  const filteredActions = actionItems.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  )

  const filteredBookings = query.trim()
    ? bookings
        .filter(
          (b) =>
            b.bookingReference.toLowerCase().includes(query.toLowerCase()) ||
            b.guestDetails?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            b.roomNumber?.includes(query)
        )
        .slice(0, 4)
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-emerald-950/60 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#047857] dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search guest / booking reference..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Quick Actions Group */}
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#047857] dark:text-emerald-400 font-bold">
            Quick Actions
          </div>
          {filteredActions.map((act) => {
            const Icon = act.icon
            return (
              <button
                key={act.id}
                type="button"
                onClick={act.action}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0B110E]/70 flex items-center justify-between transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#0B110E] border border-slate-200 dark:border-emerald-950 flex items-center justify-center text-[#047857] dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-900 dark:text-white block">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">{act.category}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  ↵ Enter
                </span>
              </button>
            )
          })}

          {/* Matching Reservations if query entered */}
          {filteredBookings.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-100 dark:border-emerald-950/60">
                Matching Stays
              </div>
              {filteredBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    onSelectBooking(b)
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0B110E]/70 flex items-center justify-between text-left cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-900 dark:text-white block">
                      {b.guestDetails?.fullName} · Suite {b.roomNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {b.bookingReference} · {b.checkInDate} to {b.checkOutDate}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-[#0B110E] border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Renoos Hotel PMS Command Center</span>
          <div className="flex items-center gap-3">
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCommandPalette
