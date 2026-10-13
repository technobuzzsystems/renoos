import React from 'react'
import {
  Home,
  LayoutGrid,
  Calendar,
  Bed,
  Users,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export type AdminTabType = 'overview' | 'bookings' | 'rooms' | 'guests' | 'financials'

interface AdminSidebarRailProps {
  activeTab: AdminTabType
  onTabChange: (tab: AdminTabType) => void
  bookingsCount: number
  guestsCount: number
  onExitToWebsite: () => void
  onOpenSettings?: () => void
}

export const AdminSidebarRail: React.FC<AdminSidebarRailProps> = ({
  activeTab,
  onTabChange,
  bookingsCount,
  guestsCount,
  onExitToWebsite,
  onOpenSettings,
}) => {
  return (
    <>
      {/* Desktop Vertical Sidebar Rail (Fixed in place on desktop) */}
      <div className="hidden md:block w-28 shrink-0 select-none">
        <aside className="fixed top-4 left-4 w-20 h-[calc(100vh-2rem)] flex flex-col items-center justify-between py-6 bg-white/95 dark:bg-[#131D17]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-emerald-950/80 rounded-[32px] shadow-sm dark:shadow-2xl z-30 select-none text-slate-700 dark:text-slate-200 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-colors duration-300">
        {/* Top: Renoos Hotel Clover Emblem */}
        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange('overview')}
            className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-[#0B110E] border border-emerald-200 dark:border-emerald-950/80 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer shadow-sm"
            title="Renoos Hotel · PMS Console"
            aria-label="Renoos Hotel Dashboard"
          >
            {/* 4-petal clover emblem icon */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#059669] top-0 left-0 opacity-90 shadow-sm" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#10b981] top-0 right-0 opacity-90 shadow-sm" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#047857] bottom-0 left-0 opacity-90 shadow-sm" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#059669] bottom-0 right-0 opacity-90 shadow-sm" />
              <div className="absolute w-2 h-2 rounded-full bg-white dark:bg-[#131D17] z-10 shadow-xs" />
            </div>
          </button>

          {/* Primary Navigation Icons Dock */}
          <nav className="flex flex-col items-center gap-3" aria-label="Main Navigation">
            {/* 1. Home / Overview Dashboard */}
            <button
              type="button"
              onClick={() => onTabChange('overview')}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#047857] text-white shadow-md shadow-emerald-700/25 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
              title="Dashboard Overview (Bento View)"
              aria-label="Dashboard Overview"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* 2. Reservations & PMS Folios */}
            <button
              type="button"
              onClick={() => onTabChange('bookings')}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#047857] text-white shadow-md shadow-emerald-700/25 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
              title="All Reservations & Stays"
              aria-label="All Reservations"
            >
              <Calendar className="w-5 h-5" />
              {bookingsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#059669] ring-2 ring-white dark:ring-[#131D17] shadow-xs" />
              )}
            </button>

            {/* 3. Suites & Inventory */}
            <button
              type="button"
              onClick={() => onTabChange('rooms')}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-[#047857] text-white shadow-md shadow-emerald-700/25 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
              title="Suites & 14-Day Inventory"
              aria-label="Suites & Inventory"
            >
              <Bed className="w-5 h-5" />
            </button>

            {/* 4. Guest CRM & Directory */}
            <button
              type="button"
              onClick={() => onTabChange('guests')}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-[#047857] text-white shadow-md shadow-emerald-700/25 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
              title="Guest CRM Directory"
              aria-label="Guest CRM Directory"
            >
              <Users className="w-5 h-5" />
              {guestsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#059669] ring-2 ring-white dark:ring-[#131D17] shadow-xs" />
              )}
            </button>

            {/* 5. Financials & Operating Vault */}
            <button
              type="button"
              onClick={() => onTabChange('financials')}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-[#047857] text-white shadow-md shadow-emerald-700/25 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
              title="Operating Vault & Financials"
              aria-label="Operating Vault & Financials"
            >
              <Wallet className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Actions: Settings & Exit */}
        <div className="flex flex-col items-center gap-3">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center w-10 h-10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
              title="Preferences & PMS Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onExitToWebsite}
            className="flex items-center justify-center w-10 h-10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-[#047857] dark:hover:text-[#10b981] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
            title="Return to 360° Guest Experience"
            aria-label="Return to 360° Site"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </aside>
      </div>

      {/* Mobile Bottom Dock (Compact Floating Rail on Screens < md) */}
      <nav
        className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-white/95 dark:bg-[#131D17]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl flex items-center justify-around p-2 shadow-xl text-slate-600 dark:text-slate-300 pb-safe transition-colors duration-300"
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-[#047857] text-white font-bold shadow-md shadow-emerald-700/20'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] font-mono">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('bookings')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative ${
            activeTab === 'bookings'
              ? 'bg-[#047857] text-white font-bold shadow-md shadow-emerald-700/20'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-mono">Bookings</span>
          {bookingsCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#059669] ring-2 ring-white dark:ring-[#131D17]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('rooms')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'rooms'
              ? 'bg-[#047857] text-white font-bold shadow-md shadow-emerald-700/20'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span className="text-[9px] font-mono">Suites</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('guests')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative ${
            activeTab === 'guests'
              ? 'bg-[#047857] text-white font-bold shadow-md shadow-emerald-700/20'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] font-mono">Guests</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('financials')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'financials'
              ? 'bg-[#047857] text-white font-bold shadow-md shadow-emerald-700/20'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-[9px] font-mono">Vault</span>
        </button>
      </nav>
    </>
  )
}

export default AdminSidebarRail
