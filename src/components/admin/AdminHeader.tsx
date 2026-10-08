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
    <div className="bg-[#142018]/95 backdrop-blur-md border-b border-cream/15 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 text-cream pt-safe w-full max-w-full overflow-hidden">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-amber-200 shadow-md shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-serif text-base sm:text-xl font-bold tracking-tight text-cream truncate">
              RENOOS HOTEL
            </h1>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold shrink-0">
              PMS
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-cream/70 hidden xs:flex items-center gap-1.5 truncate">
            <span>Mountain Sanctuary</span>
            <span className="text-amber-200/50">·</span>
            <span className="text-amber-200/90 truncate">Front Desk Operations</span>
          </p>
        </div>
      </div>

      {/* Center: Live Clock & Sync indicator (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1611]/80 border border-cream/15 text-xs font-mono text-cream/80 shrink-0">
        <Clock className="w-3.5 h-3.5 text-amber-300" />
        <span>{currentTime || 'Syncing clock...'}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Real-time PMS sync active" />
      </div>

      {/* Right Actions: Sync, Visit 360 Site, User Pill, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Refresh Sync */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#1c2c22] hover:bg-[#253d2f] text-cream border border-cream/15 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 min-h-[38px] min-w-[38px] justify-center"
          title="Refresh live reservations and room occupancy"
          aria-label="Refresh PMS data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-200 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Data</span>
        </button>

        {/* View Public 360 Site */}
        <button
          type="button"
          onClick={onExitToWebsite}
          className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream border border-cream/20 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[38px] min-w-[38px] justify-center"
          title="Return to 360° guest website"
          aria-label="Return to 360° hotel tour"
        >
          <Compass className="w-3.5 h-3.5 text-amber-200" />
          <span className="hidden sm:inline">360° Tour</span>
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
          className="p-2 rounded-full text-red-300 hover:text-red-100 hover:bg-red-950/60 transition-colors border border-transparent hover:border-red-400/30 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Sign out of Admin Console"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default AdminHeader

