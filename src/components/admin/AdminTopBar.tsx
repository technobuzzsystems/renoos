import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Command,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { AdminSession, BookingRecord } from '@/services/adminApi'

interface AdminTopBarProps {
  session: AdminSession
  bookings: BookingRecord[]
  isRefreshing: boolean
  onRefresh: () => void
  onOpenCommandPalette: () => void
  onLogout: () => void
  onExitToWebsite: () => void
  onSelectBooking?: (booking: BookingRecord) => void
  isDark?: boolean
  onToggleTheme?: () => void
  ambientMood?: 'midnight' | 'forest'
  onToggleAmbientMood?: () => void
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  session,
  bookings,
  isRefreshing,
  onRefresh,
  onOpenCommandPalette,
  onLogout,
  onExitToWebsite,
  onSelectBooking,
  isDark = false,
  onToggleTheme,
  ambientMood = 'midnight',
  onToggleAmbientMood,
}) => {
  const isDarkMode = isDark
  const handleToggleTheme = onToggleTheme ?? onToggleAmbientMood ?? (() => {})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? bookings
        .filter((b) => {
          const q = searchQuery.toLowerCase().trim()
          return (
            b.bookingReference.toLowerCase().includes(q) ||
            b.guestDetails?.fullName?.toLowerCase().includes(q) ||
            b.roomNumber?.includes(q) ||
            b.guestDetails?.phone?.includes(q)
          )
        })
        .slice(0, 5)
    : []

  // Simulated live notifications based on hotel operations
  const notifications = [
    {
      id: 'notif-1',
      title: 'Arrival Expected Today',
      description: 'Room 201 check-in scheduled after 14:00 hrs.',
      time: '10m ago',
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'Daily PMS Reconciliation',
      description: 'All folios balanced and locked for audit.',
      time: '1h ago',
      type: 'success',
    },
    {
      id: 'notif-3',
      title: 'Sanctuary Housekeeping',
      description: 'Room 202 inspection completed by staff.',
      time: '2h ago',
      type: 'status',
    },
  ]

  const managerInitials = session.name
    ? session.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'GM'

  return (
    <header className="shrink-0 sticky top-0 z-20 px-3 sm:px-6 pt-3 sm:pt-4 pb-2.5 flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 bg-white/95 dark:bg-[#131D17]/95 backdrop-blur-xl border-b border-slate-200/70 dark:border-emerald-950/80 select-none shadow-xs w-full transition-colors duration-300">
      {/* 1. Left Search Pill (Matching Reference Image) */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white dark:bg-[#0B110E]/90 dark:hover:bg-[#0E1712] dark:focus:bg-[#0B110E] border border-slate-200/80 dark:border-emerald-950/90 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 rounded-full text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-xs backdrop-blur-xl transition-all outline-none"
            aria-label="Search dashboard"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in max-h-80 overflow-y-auto text-slate-800 dark:text-slate-100">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2.5 py-1 font-semibold">
              Matching Reservations ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-mono">
                No reservations found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (onSelectBooking) onSelectBooking(b)
                      setIsSearchFocused(false)
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-sans font-medium text-slate-900 dark:text-white">
                        {b.guestDetails?.fullName || 'Guest'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {b.bookingReference} · Suite {b.roomNumber}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[#047857] dark:text-[#10b981] font-semibold">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Center Shortcut Pill (⌘ + Space) */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B110E] dark:hover:bg-[#16231B] border border-slate-200/80 dark:border-emerald-950/80 hover:border-emerald-300 dark:hover:border-emerald-800 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs backdrop-blur-xl cursor-pointer shrink-0"
        title="Open Command Palette (or press ⌘K / Ctrl+K)"
      >
        <Command className="w-3.5 h-3.5 text-[#047857] dark:text-[#10b981]" />
        <span className="text-[11px] font-medium">+ Space</span>
      </button>

      {/* 3. Right Utilities Dock */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Refresh Sync Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B110E] dark:hover:bg-[#16231B] border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xl shadow-xs disabled:opacity-50"
          title="Refresh PMS Live Data"
          aria-label="Refresh PMS Live Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#047857] dark:text-[#10b981]' : ''}`} />
        </button>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B110E] dark:hover:bg-[#16231B] border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xl shadow-xs"
            title="Hotel Operations Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-[#0B110E] animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 z-50 animate-in fade-in text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/80">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#047857] dark:text-[#10b981]" />
                  <span>Front Desk Alerts</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                  Live Sync
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-emerald-950/80 py-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white text-[11px]">{n.title}</span>
                      <span className="text-[9px] font-mono text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                      {n.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Black & White Theme Toggle (☀️ / 🌙) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B110E] dark:hover:bg-[#16231B] border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xl shadow-xs"
          title={isDarkMode ? 'Switch to White Theme (Daylight Clean)' : 'Switch to Black Theme (Midnight Sanctuary)'}
          aria-label="Toggle Black and White Theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* 4. Manager Profile Pill (Ethan Reynolds / Vikram Mehta) */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0B110E] dark:hover:bg-[#16231B] border border-slate-200/80 dark:border-emerald-950/80 rounded-full transition-all cursor-pointer backdrop-blur-xl shadow-xs"
            aria-label="Admin Profile Menu"
          >
            {/* Avatar Circle in Emerald Green */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#047857] to-[#10b981] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {managerInitials}
            </div>

            <div className="text-left hidden sm:block">
              <div className="font-sans font-semibold text-xs text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                {session.name || 'Ethan Reynolds'}
              </div>
              <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                @{session.role ? session.role.toLowerCase().replace(/\s+/g, '_') : 'ethan_reynolds'}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in text-slate-800 dark:text-slate-100">
              <div className="p-2.5 border-b border-slate-100 dark:border-emerald-950/80">
                <div className="font-sans font-semibold text-xs text-slate-900 dark:text-white">
                  {session.name || 'Ethan Reynolds'}
                </div>
                <div className="text-[10px] font-mono text-[#047857] dark:text-[#10b981] font-medium">
                  {session.role || 'Super Admin'} · Renoos Hotel
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onExitToWebsite()
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-emerald-950/50 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#047857] dark:text-[#10b981]" />
                  <span>360° Guest Tour</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-mono text-[#047857] dark:text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-400" />
                  <span>Log Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminTopBar
