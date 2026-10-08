import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Compass,
  Camera,
  Leaf,
  User,
  LogIn,
  X,
} from 'lucide-react'
import { PanoramaViewer } from '../panorama/PanoramaViewer'
import { GuestAccountButton } from '@/components/auth'
import { useAuth } from '@/context/AuthContext'

interface BookingDates {
  checkIn: string
  checkOut: string
  adults: number
  children: number
}

interface ReceptionSceneProps {
  onContinueToRoomPreview: (bookingDates: BookingDates) => void
  onBackToExterior: () => void
  initialDates?: Partial<BookingDates>
  initialMode?: 'desk-photo' | '360-lobby'
}

/**
 * STAGE 2: Grand Lobby & Reception Scene
 * Styled with direct reference to Renoos Hotel Resort Welcome:
 * - Modern luxury resort lobby with curved Calacatta marble counter and vertical timber fluting
 * - Real photographic presentation of the receptionist behind the desk
 * - Floating transparent/frosted-glass concierge interface (translucent cream/forest glass)
 * - In-scene compact date selection & smooth transition to Room Preview
 */
export const ReceptionScene: React.FC<ReceptionSceneProps> = ({
  onContinueToRoomPreview,
  onBackToExterior,
  initialDates,
  initialMode = '360-lobby',
}) => {
  const { user, isAuthenticated, setIsAuthModalOpen, setIsBookingsModalOpen, userBookings } =
    useAuth()
  // Mode: Front Desk View (Matching Reference Photo) vs 360° Grand Lobby Tour
  const [receptionMode, setReceptionMode] = useState<'desk-photo' | '360-lobby'>(initialMode)

  // Screen state inside the transparent concierge interface:
  // 'greeting' -> 'dates' -> 'free-explore' (minimized)
  const [viewState, setViewState] = useState<'greeting' | 'dates' | 'free-explore'>('free-explore')

  // Date Selection State
  const defaultDates = useMemo(() => {
    const today = new Date()
    const checkIn = new Date(today)
    checkIn.setDate(today.getDate() + 1)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkIn.getDate() + 2)
    return {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults: 2,
      children: 0,
    }
  }, [])

  const [checkInDate, setCheckInDate] = useState<string>(
    initialDates?.checkIn || defaultDates.checkIn
  )
  const [checkOutDate, setCheckOutDate] = useState<string>(
    initialDates?.checkOut || defaultDates.checkOut
  )
  const [adults, setAdults] = useState<number>(initialDates?.adults || defaultDates.adults)
  const [children, setChildren] = useState<number>(initialDates?.children || defaultDates.children)
  // Calculate nights & validate check-out > check-in cleanly without setState in render
  const { nights, dateError } = useMemo(() => {
    try {
      const d1 = new Date(checkInDate).getTime()
      const d2 = new Date(checkOutDate).getTime()
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
      if (diff <= 0) {
        return { nights: 0, dateError: 'Check-out must be after check-in date' }
      }
      return { nights: diff, dateError: null }
    } catch {
      return { nights: 1, dateError: 'Please enter valid dates' }
    }
  }, [checkInDate, checkOutDate])

  // Format date in Indian readable format (e.g. 14 Oct 2026)
  const formatIndianDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number)
      const d = new Date(year, month - 1, day)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Handle continuing to Room Preview
  const handleContinue = (_targetRoomId?: string) => {
    if (nights <= 0) return
    onContinueToRoomPreview({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children,
    })
  }

  // 360° Grand Lobby Configuration
  const lobbyPanoramaConfig = useMemo(
    () => ({
      imageSrc: '/images/Luxury Mountain Resort Lobby.png',
      aspectRatio: '2:1' as const,
      initialFov: 82,
      minFov: 42,
      maxFov: 105,
      initialPitch: -4,
      initialYaw: 180,
      isPlaceholder: false,
      isAvailable: true,
      caption: 'Renoos Hotel — 360° Grand Lobby & Reception Tour',
      hotspots: [
        {
          id: 'hs-lobby-book',
          title: 'Book a Suite · Select Dates',
          description: 'Select reservation dates & check suite availability',
          type: 'navigation' as const,
          spherical: { yaw: 180, pitch: -13 },
          targetSpaceId: 'dates',
          category: 'Reservation Desk',
          icon: 'calendar',
        },
      ],
    }),
    []
  )

  return (
    <div className="relative w-full h-full bg-[#0d1510] text-cream overflow-hidden flex flex-col justify-between select-none">
      {/* =========================================================================
          1. MAIN VISUAL ENVIRONMENT: 
             PHOTOREALISTIC FRONT DESK (MATCHING REFERENCE IMAGE) OR 360° GRAND LOBBY
          ========================================================================= */}
      {receptionMode === 'desk-photo' ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/Luxury Mountain Resort Lobby.png"
            alt="Renoos Hotel Front Desk Receptionist and Grand Lobby"
            className="w-full h-full object-cover object-center filter brightness-100 contrast-105"
          />
          {/* Subtle top gradient edge for header legibility */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Interactive Beacon on Front Desk Photo */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {/* Front Desk Reservation Beacon */}
            <div className="absolute top-[52%] sm:top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setViewState('dates')}
                className="group flex flex-col items-center gap-1.5 cursor-pointer transition-all transform hover:scale-105"
                aria-label="Book a Suite · Select Dates"
              >
                <span className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 border border-emerald-400/60 shadow-2xl backdrop-blur-md group-hover:border-amber-300 group-hover:bg-[#1a2d21]">
                  <span className="absolute -inset-1.5 rounded-full bg-emerald-400/25 animate-pulse" />
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 group-hover:text-amber-200" />
                </span>
                <span className="px-3.5 sm:px-4 py-1 rounded-full bg-black/85 border border-cream/25 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-cream font-medium shadow-md group-hover:border-amber-300 group-hover:bg-black/95 whitespace-nowrap">
                  Book Suite · Select Dates
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <PanoramaViewer
            config={lobbyPanoramaConfig}
            spaceTitle="Grand Lobby & Front Desk"
            roomNumber="Lobby"
            onHotspotClick={(hs) => {
              if (hs.id === 'hs-lobby-book' || hs.targetSpaceId === 'dates') {
                setViewState('dates')
                return true
              }
              return false
            }}
            onNavigateSpace={() => setViewState('dates')}
            hideHotspotList={true}
            hideInternalHeader={true}
            bottomBarOffsetClass="bottom-14 sm:bottom-20"
            viewportHeightClass="h-full w-full"
            className="h-full w-full"
          />
        </div>
      )}

      {/* =========================================================================
          2. TOP NAVIGATION HUD (Minimal & Editorial)
          ========================================================================= */}
      <header className="relative z-30 min-h-14 sm:h-16 px-3 sm:px-6 py-2 flex items-center justify-between border-b border-cream/15 bg-[#16251C]/75 backdrop-blur-md pt-safe">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToExterior}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-[11px] sm:text-xs font-mono transition-all border border-cream/15 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cream" />
            <span className="hidden sm:inline">Hotel Exterior</span>
            <span className="sm:hidden">Exterior</span>
          </button>

          <div className="h-4 w-px bg-cream/20 hidden sm:block" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-serif text-xs sm:text-base font-medium text-cream truncate max-w-[130px] xs:max-w-none">
              Grand Lobby
            </span>
            <span className="font-serif text-xs sm:text-base font-medium text-cream/70 hidden md:inline">
              & Reception Desk
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Front Desk Photo vs 360° Lobby Tour & Guest Account */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <GuestAccountButton variant="dark" />

          <div className="flex items-center p-0.5 sm:p-1 bg-[#16251C]/80 backdrop-blur-md rounded-full border border-cream/20 text-[11px] sm:text-xs font-mono">
            <button
              type="button"
              onClick={() => setReceptionMode('desk-photo')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                receptionMode === 'desk-photo'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Desk</span>
              <span className="xs:hidden">Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setReceptionMode('360-lobby')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                receptionMode === '360-lobby'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>360°</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. TRANSPARENT CONCIERGE INTERFACE SCREEN
          Placed gracefully to the right side of the counter (matching reference image)
          Soft blur, thin border, translucent cream/forest glass, minimal editorial content.
          ========================================================================= */}
      <div className="relative z-20 flex-1 flex items-center justify-center md:justify-end px-3 sm:px-8 md:pr-16 pointer-events-none py-2">
        {viewState === 'greeting' && (
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full max-h-[82dvh] overflow-y-auto no-scrollbar bg-[#18261E]/85 backdrop-blur-xl border border-amber-200/30 shadow-2xl rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 text-cream">
            {/* Golden Lotus Emblem */}
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-10 h-10 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-amber-200 shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-amber-200/80 uppercase mt-1">
                Welcome to
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-cream font-medium tracking-tight">
                Renoos Hotel
              </h2>
              <p className="text-xs sm:text-sm text-cream/80 font-light mt-1">
                Hello, and welcome to Renoos Hotel.
                <br />
                How can we help you today?
              </p>
            </div>

            {/* Action Buttons: Matching Reference Image Style */}
            <div className="space-y-2.5 pt-1">
              {/* Primary Action Button: Book a Room */}
              <button
                type="button"
                onClick={() => setViewState('dates')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1E3325] hover:bg-[#254230] text-cream border border-emerald-400/30 shadow-lg flex items-center justify-between transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs uppercase tracking-wider font-semibold font-mono">
                    Book a Room
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-cream/80 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Guest Portal Action: Reservations or Sign In */}
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => setIsBookingsModalOpen(true)}
                  className="w-full py-3 px-5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-100 border border-amber-300/30 shadow-md flex items-center justify-between transition-all text-xs font-mono group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-amber-300" />
                    <span className="tracking-wider">
                      My Reservations ({userBookings.filter((b) => b.status !== 'cancelled').length})
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-200/80 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-cream border border-white/20 shadow-md flex items-center justify-between transition-all text-xs font-mono group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-amber-200" />
                    <span className="tracking-wider">Guest Sign In / My Bookings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cream/70 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Secondary Action Button: Explore the Sanctuary */}
              <button
                type="button"
                onClick={() => setViewState('free-explore')}
                className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-cream border border-white/20 shadow-md flex items-center justify-between transition-all text-xs font-mono group"
              >
                <div className="flex items-center gap-2.5">
                  <Leaf className="w-4 h-4 text-amber-200" />
                  <span className="tracking-wider">Explore the Sanctuary</span>
                </div>
                <ArrowRight className="w-4 h-4 text-cream/70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* DATE SELECTION LAYER: Connected Visually in the Same Transparent Screen */}
        {viewState === 'dates' && (
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full max-h-[82dvh] overflow-y-auto no-scrollbar bg-[#18261E]/85 backdrop-blur-xl border border-amber-200/35 shadow-2xl rounded-3xl p-5 sm:p-7 space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-400 text-cream">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold block">
                  Reservation Dates
                </span>
                <h3 className="font-serif text-base sm:text-xl text-cream font-medium">
                  Select Check-in & Check-out
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewState('greeting')}
                className="text-xs font-mono text-cream/70 hover:text-cream px-2.5 py-1 rounded-full bg-cream/10 border border-cream/15 cursor-pointer"
              >
                ← Back
              </button>
            </div>

            {/* Date Pickers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {/* Check-In */}
              <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15">
                <label className="text-[10px] font-mono text-cream/60 uppercase tracking-wider block">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-cream text-xs font-mono outline-none cursor-pointer"
                />
                <span className="text-[11px] font-serif text-amber-200 block font-medium">
                  {formatIndianDate(checkInDate)}
                </span>
              </div>

              {/* Check-Out */}
              <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15">
                <label className="text-[10px] font-mono text-cream/60 uppercase tracking-wider block">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-transparent text-cream text-xs font-mono outline-none cursor-pointer"
                />
                <span className="text-[11px] font-serif text-amber-200 block font-medium">
                  {formatIndianDate(checkOutDate)}
                </span>
              </div>
            </div>

            {/* Validation Error if Check-out <= Check-in */}
            {dateError && (
              <p className="text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-1.5">
                {dateError}
              </p>
            )}

            {/* Guests Selector */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15 space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cream/60 uppercase tracking-wider block">
                    Adults
                  </span>
                  <span className="text-xs font-mono text-cream">
                    {adults} {adults === 1 ? 'Adult' : 'Adults'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25 cursor-pointer"
                    aria-label="Decrease adults"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-4 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(4, adults + 1))}
                    className="w-8 h-8 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25 cursor-pointer"
                    aria-label="Increase adults"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cream/10">
                <div>
                  <span className="text-[10px] font-mono text-cream/60 uppercase tracking-wider block">
                    Children
                  </span>
                  <span className="text-xs font-mono text-cream">
                    {children} {children === 1 ? 'Child' : 'Children'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25 cursor-pointer"
                    aria-label="Decrease children"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-4 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(3, children + 1))}
                    className="w-8 h-8 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25 cursor-pointer"
                    aria-label="Increase children"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Duration Summary */}
            <div className="flex items-center justify-between text-[11px] font-mono text-cream/70 px-1">
              <span>Duration:</span>
              <span className="text-amber-200 font-medium">
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              disabled={nights <= 0}
              onClick={() => handleContinue()}
              className={`w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-2xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
                nights > 0
                  ? 'bg-cream hover:bg-white text-[#16251C] cursor-pointer transform hover:scale-[1.01]'
                  : 'bg-cream/30 text-cream/50 cursor-not-allowed'
              }`}
            >
              <span>Continue to Room Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Re-Open Pill when User Minimized to Free Explore */}
      {viewState === 'free-explore' && (
        <div className="relative z-20 p-3 sm:p-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 pointer-events-none">
          <button
            type="button"
            onClick={() => setViewState('greeting')}
            className="pointer-events-auto px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#18261E]/90 hover:bg-[#18261E] text-cream text-[11px] sm:text-xs font-mono border border-cream/25 flex items-center gap-2 shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Welcome Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setViewState('dates')}
            className="pointer-events-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-cream hover:bg-white text-[#16251C] text-[11px] sm:text-xs font-mono font-semibold flex items-center gap-2 shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#16251C]" />
            <span>Select Dates & Book Suite</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#16251C]" />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM STATUS FOOTER
          ========================================================================= */}
      <footer className="relative z-30 h-10 sm:h-12 px-3 sm:px-6 flex items-center justify-between border-t border-cream/15 bg-[#16251C]/75 backdrop-blur-md text-[11px] sm:text-xs font-mono text-cream/70 pb-safe">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">
            {receptionMode === 'desk-photo'
              ? 'Front Desk · Renoos Hotel'
              : '360° Grand Lobby'}
            <span className="hidden sm:inline"> · Drag to look around</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToExterior}
          className="text-amber-200 hover:text-white underline font-medium shrink-0 cursor-pointer text-xs"
        >
          ← <span className="hidden xs:inline">Hotel </span>Exterior
        </button>
      </footer>
    </div>
  )
}

export default ReceptionScene
