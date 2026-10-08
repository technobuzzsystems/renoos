import React, { useState } from 'react'
import {
  CalendarDays,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react'

interface BookingBarProps {
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  onSearchChange: (updates: {
    checkInDate?: string
    checkOutDate?: string
    adults?: number
    children?: number
  }) => void
  onOpenBooking: () => void
}

export const BookingBar: React.FC<BookingBarProps> = ({
  checkInDate,
  checkOutDate,
  adults,
  children,
  onSearchChange,
  onOpenBooking,
}) => {
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false)

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkInDate).getTime()
      const d2 = new Date(checkOutDate).getTime()
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    } catch {
      return 1
    }
  }

  const nights = calculateNights()

  // Format today's minimum string
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto -mt-6 sm:-mt-8 px-4">
      <div className="bg-cream/95 backdrop-blur-md border border-[#E9E4DB] rounded-3xl p-3 sm:p-4 shadow-warm-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Check-In Date */}
          <div className="md:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB]/80 hover:border-forest/40 transition-colors">
            <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-terracotta" />
              <span>Check-In Date</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkInDate}
              onChange={(e) => {
                const newCheckIn = e.target.value
                onSearchChange({ checkInDate: newCheckIn })
                // ensure checkout is after checkin
                if (new Date(checkOutDate) <= new Date(newCheckIn)) {
                  const nextDay = new Date(newCheckIn)
                  nextDay.setDate(nextDay.getDate() + 1)
                  onSearchChange({ checkOutDate: nextDay.toISOString().split('T')[0] })
                }
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-forest focus:outline-none cursor-pointer"
            />
          </div>

          {/* Check-Out Date */}
          <div className="md:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB]/80 hover:border-forest/40 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold">
                <CalendarDays className="w-3.5 h-3.5 text-terracotta" />
                <span>Check-Out Date</span>
              </label>
              <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-1.5 py-0.2 rounded font-medium">
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
            <input
              type="date"
              min={checkInDate || todayStr}
              value={checkOutDate}
              onChange={(e) => onSearchChange({ checkOutDate: e.target.value })}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-forest focus:outline-none cursor-pointer"
            />
          </div>

          {/* Guests Selector */}
          <div className="md:col-span-3 relative">
            <div
              onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
              className="p-3 bg-ivory rounded-2xl border border-[#E9E4DB]/80 hover:border-forest/40 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold mb-1">
                  <Users className="w-3.5 h-3.5 text-terracotta" />
                  <span>Guests & Occupancy</span>
                </label>
                <div className="text-xs sm:text-sm font-semibold text-forest">
                  {adults} {adults === 1 ? 'Adult' : 'Adults'}
                  {children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-sage transition-transform ${guestDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Guests Popover */}
            {guestDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20 md:hidden"
                  onClick={() => setGuestDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-cream border border-[#E9E4DB] rounded-2xl shadow-warm-lg z-30 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-forest block">Adults</span>
                      <span className="text-[10px] text-charcoal-muted">Ages 13+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSearchChange({ adults: Math.max(1, adults - 1) })
                        }}
                        className="w-9 h-9 rounded-full border border-[#E9E4DB] bg-ivory text-forest font-bold text-sm disabled:opacity-40 flex items-center justify-center min-w-[36px] min-h-[36px]"
                        aria-label="Decrease adults"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-forest">{adults}</span>
                      <button
                        type="button"
                        disabled={adults >= 4}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSearchChange({ adults: Math.min(4, adults + 1) })
                        }}
                        className="w-9 h-9 rounded-full border border-[#E9E4DB] bg-ivory text-forest font-bold text-sm disabled:opacity-40 flex items-center justify-center min-w-[36px] min-h-[36px]"
                        aria-label="Increase adults"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E9E4DB] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-forest block">Children</span>
                      <span className="text-[10px] text-charcoal-muted">Ages 0-12</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSearchChange({ children: Math.max(0, children - 1) })
                        }}
                        className="w-9 h-9 rounded-full border border-[#E9E4DB] bg-ivory text-forest font-bold text-sm disabled:opacity-40 flex items-center justify-center min-w-[36px] min-h-[36px]"
                        aria-label="Decrease children"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-forest">{children}</span>
                      <button
                        type="button"
                        disabled={children >= 2}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSearchChange({ children: Math.min(2, children + 1) })
                        }}
                        className="w-9 h-9 rounded-full border border-[#E9E4DB] bg-ivory text-forest font-bold text-sm disabled:opacity-40 flex items-center justify-center min-w-[36px] min-h-[36px]"
                        aria-label="Increase children"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGuestDropdownOpen(false)}
                    className="w-full py-2.5 bg-forest text-cream text-xs uppercase tracking-wider font-semibold rounded-xl min-h-[44px]"
                  >
                    Apply Selection
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Button: Check Availability / Book Rooms */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={onOpenBooking}
              className="w-full h-full min-h-[48px] sm:min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-2xl shadow-warm group"
            >
              <Search className="w-4 h-4 text-cream group-hover:scale-110 transition-transform" />
              <span>Check Rates & Book</span>
              <ArrowRight className="w-4 h-4 text-cream transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Reassurance Bar under the inputs */}
        <div className="mt-3 pt-2.5 border-t border-[#E9E4DB] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-[11px] text-charcoal-muted gap-2 px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
            <span>Direct Booking Guarantee · Best Rate Guaranteed</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-light">
            <span>Free Cancellation up to 48 hrs</span>
            <span className="hidden sm:inline">·</span>
            <span>Organic Breakfast Included</span>
            <span className="hidden sm:inline">·</span>
            <span>360° Room Tours</span>
          </div>
        </div>
      </div>
    </div>
  )
}

