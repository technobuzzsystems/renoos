import React from 'react'
import { User, LogIn, Calendar, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface GuestAccountButtonProps {
  className?: string
  variant?: 'dark' | 'light' | 'gold'
  showTextOnMobile?: boolean
}

export const GuestAccountButton: React.FC<GuestAccountButtonProps> = ({
  className = '',
  variant = 'dark',
  showTextOnMobile = false,
}) => {
  const { user, isAuthenticated, setIsAuthModalOpen, setIsBookingsModalOpen, userBookings } =
    useAuth()

  const activeReservationsCount = userBookings.filter((b) => b.status !== 'cancelled').length

  if (isAuthenticated && user) {
    const displayName = user.fullName ? user.fullName.split(' ')[0] : user.phone

    const variantStyles = {
      dark: 'bg-[#16251C]/80 hover:bg-[#16251C] text-cream border-amber-300/30 hover:border-amber-300/60 shadow-lg',
      light:
        'bg-cream hover:bg-white text-forest border-[#E9E4DB] hover:border-forest/30 shadow-warm',
      gold: 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-100 border-amber-300/40 shadow-lg',
    }[variant]

    return (
      <button
        type="button"
        onClick={() => setIsBookingsModalOpen(true)}
        className={`group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer backdrop-blur-md ${variantStyles} ${className}`}
        title={`Signed in as ${user.fullName || user.phone} · Click to view reservations`}
        aria-label="Open My Reservations"
      >
        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
          <User className="w-3 h-3 text-amber-300" />
        </div>

        <div className={`flex items-center gap-1.5 ${showTextOnMobile ? 'flex' : 'hidden sm:flex'}`}>
          <span className="font-sans font-medium tracking-normal text-xs max-w-[90px] md:max-w-[120px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-cream/60 hidden md:inline">· Bookings</span>
        </div>

        {activeReservationsCount > 0 ? (
          <span
            className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold leading-none shrink-0 animate-pulse"
            title={`${activeReservationsCount} active booking(s)`}
          >
            {activeReservationsCount}
          </span>
        ) : (
          <Calendar className="w-3 h-3 text-cream/50 group-hover:text-amber-200 shrink-0" />
        )}
      </button>
    )
  }

  const signinStyles = {
    dark: 'bg-[#16251C]/80 hover:bg-[#16251C] text-cream border-cream/20 hover:border-cream/40 shadow-md',
    light:
      'bg-forest hover:bg-forest-dark text-cream border-forest hover:border-forest-dark shadow-sm',
    gold: 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border-amber-300/40 shadow-md',
  }[variant]

  return (
    <button
      type="button"
      onClick={() => setIsAuthModalOpen(true)}
      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer backdrop-blur-md ${signinStyles} ${className}`}
      title="Sign in with mobile number to view reservations"
      aria-label="Sign In with Mobile Number"
    >
      <LogIn className="w-3.5 h-3.5 text-amber-200" />
      <span className={showTextOnMobile ? 'inline' : 'hidden sm:inline font-medium'}>
        Sign In
      </span>
    </button>
  )
}

export default GuestAccountButton

