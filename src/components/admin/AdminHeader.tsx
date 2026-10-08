import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  RefreshCw,
  Compass,
  LogOut,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import type { AdminSession } from '@/services/adminApi'

interface AdminHeaderProps {
  session: AdminSession
  onRefresh: () => void
  isRefreshing: boolean
  onLogout: () => void
  onExitToWebsite: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  session,
  onRefresh,
  isRefreshing,
  onLogout,
  onExitToWebsite,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-[#142018]/95 backdrop-blur-md border-b border-cream/15 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 text-cream shadow-xl">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-amber-200 shadow-md">
          <Sparkles className="w-5 h-5 text-amber-200" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-cream">
              RENOOS HOTEL
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
              PMS Control
            </span>
          </div>
          <p className="text-[11px] font-mono text-cream/70 flex items-center gap-1.5">
            <span>Luxury Mountain Sanctuary PMS</span>
            <span className="text-amber-200/50">·</span>
            <span className="text-amber-200/90">Front Desk & Operations</span>
          </p>
        </div>
      </div>

      {/* Center: Live Clock & Sync indicator */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1611]/80 border border-cream/15 text-xs font-mono text-cream/80">
        <Clock className="w-3.5 h-3.5 text-amber-300" />
        <span>{currentTime || 'Syncing clock...'}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Real-time PMS sync active" />
      </div>

      {/* Right Actions: Sync, Visit 360 Site, User Pill, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh Sync */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#1c2c22] hover:bg-[#253d2f] text-cream border border-cream/15 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          title="Refresh live reservations and room occupancy"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-200 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Data</span>
        </button>

        {/* View Public 360 Site */}
        <button
          type="button"
          onClick={onExitToWebsite}
          className="px-3.5 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream border border-cream/20 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Return to 360° guest website"
        >
          <Compass className="w-3.5 h-3.5 text-amber-200" />
          <span className="hidden sm:inline">360° Hotel Tour</span>
        </button>

        {/* Admin User Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/30 text-xs font-mono text-amber-100">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-sans font-medium text-xs">{session.name}</span>
        </div>

        {/* Log Out */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-full text-red-300 hover:text-red-100 hover:bg-red-950/60 transition-colors border border-transparent hover:border-red-400/30 cursor-pointer"
          title="Sign out of Admin Console"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default AdminHeader

