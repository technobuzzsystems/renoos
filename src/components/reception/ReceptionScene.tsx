import React, { useState, useMemo, useEffect, useRef } from 'react'
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
  Volume2,
  VolumeX,
  RotateCcw,
  Info,
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

const RECEPTIONIST_AUDIO_PATH =
  '/audio/ElevenLabs_2026-10-09T05_21_42_Anika%20-%20Marathi%20Customer%20Care%20Agent_pvc_sp100_s50_sb75_v4.mp3'
const RECEPTIONIST_AUDIO_FALLBACK = '/audio/receptionist-voice.mp3'

/**
 * STAGE 2: Grand Lobby & Reception Scene
 * Styled with direct reference to Renoos Hotel Resort Welcome:
 * - Plays authentic high-fidelity receptionist greeting audio on customer arrival
 * - Modern luxury resort lobby with curved Calacatta marble counter and vertical timber fluting
 * - Real photographic presentation of the reception desk
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

  // Receptionist Audio State & Controller
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false)

  useEffect(() => {
    // Instantiate audio object with the customer receptionist voice file
    const audio = new Audio(RECEPTIONIST_AUDIO_PATH)
    audio.preload = 'auto'
    audioRef.current = audio

    const onPlay = () => setIsAudioPlaying(true)
    const onPause = () => setIsAudioPlaying(false)
    const onEnded = () => setIsAudioPlaying(false)
    const onError = () => {
      // Fallback to alias if URL encoding has any edge case
      if (audio.src.includes('ElevenLabs')) {
        audio.src = RECEPTIONIST_AUDIO_FALLBACK
        audio.play().catch(() => {})
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    // Automatically speak the voice when any customer arrives at reception
    const startPlayback = () => {
      if (!audioRef.current) return
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true)
        })
        .catch((err) => {
          console.log('Autoplay waiting for first customer interaction:', err)
          // If browser restricts initial unprompted autoplay, play on very first touch/click
          const unlockGesture = () => {
            if (audioRef.current) {
              audioRef.current
                .play()
                .then(() => setIsAudioPlaying(true))
                .catch(() => {})
            }
            window.removeEventListener('click', unlockGesture)
            window.removeEventListener('touchstart', unlockGesture)
            window.removeEventListener('pointerdown', unlockGesture)
          }

          window.addEventListener('click', unlockGesture, { once: true })
          window.addEventListener('touchstart', unlockGesture, { once: true })
          window.addEventListener('pointerdown', unlockGesture, { once: true })
        })
    }

    startPlayback()

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [])

  const toggleVoicePlayback = () => {
    if (!audioRef.current) return
    if (isAudioPlaying) {
      audioRef.current.pause()
    } else {
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0
      }
      audioRef.current.play().catch(console.error)
    }
  }

  const replayVoice = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(console.error)
  }

  const handleBackToExterior = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    onBackToExterior()
  }

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
    if (audioRef.current) {
      audioRef.current.pause()
    }
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
          id: 'hs-lobby-welcome',
          title: 'Welcome Menu',
          description: 'Explore concierge services & hotel welcome',
          type: 'feature' as const,
          spherical: { yaw: 166, pitch: -13 },
          category: 'Front Desk',
          icon: 'sparkles',
        },
        {
          id: 'hs-lobby-book',
          title: 'Book a Suite',
          description: 'Select reservation dates & check suite availability',
          type: 'navigation' as const,
          spherical: { yaw: 194, pitch: -13 },
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

          {/* Interactive Beacons Flanking Receptionist on Front Desk Photo */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {/* Left side of receptionist: Welcome Menu */}
            <div className="absolute top-[52%] sm:top-[54%] left-[28%] sm:left-[38%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setViewState('greeting')
                  replayVoice()
                }}
                className="group flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                aria-label="Welcome Menu"
              >
                <span className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/85 border border-amber-300/60 shadow-2xl backdrop-blur-md group-hover:border-emerald-300 group-hover:bg-[#1a2d21]">
                  <span className="absolute -inset-1 rounded-full bg-amber-400/25 animate-pulse" />
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 group-hover:text-emerald-300" />
                </span>
                <span className="px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-black/85 border border-cream/25 text-[9px] sm:text-xs font-mono uppercase tracking-wider text-cream font-medium shadow-md group-hover:border-amber-300 whitespace-nowrap">
                  Welcome Menu
                </span>
              </button>
            </div>

            {/* Right side of receptionist: Book a Suite */}
            <div className="absolute top-[52%] sm:top-[54%] left-[72%] sm:left-[62%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setViewState('dates')}
                className="group flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                aria-label="Book a Suite"
              >
                <span className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/85 border border-emerald-400/60 shadow-2xl backdrop-blur-md group-hover:border-amber-300 group-hover:bg-[#1a2d21]">
                  <span className="absolute -inset-1 rounded-full bg-emerald-400/25 animate-pulse" />
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 group-hover:text-amber-200" />
                </span>
                <span className="px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-black/85 border border-cream/25 text-[9px] sm:text-xs font-mono uppercase tracking-wider text-cream font-medium shadow-md group-hover:border-amber-300 whitespace-nowrap">
                  Book a Suite
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
              if (hs.id === 'hs-lobby-welcome') {
                setViewState('greeting')
                replayVoice()
                return true
              }
              if (hs.id === 'hs-lobby-book' || hs.targetSpaceId === 'dates') {
                setViewState('dates')
                return true
              }
              return false
            }}
            onNavigateSpace={() => setViewState('dates')}
            hideHotspotList={true}
            hideInternalHeader={true}
            bottomBarOffsetClass="bottom-28 sm:bottom-20"
            viewportHeightClass="h-full w-full"
            className="h-full w-full"
          />
        </div>
      )}

      {/* =========================================================================
          2. TOP NAVIGATION HUD (Minimal & Editorial)
          ========================================================================= */}
      <header className="relative z-30 min-h-12 sm:min-h-14 sm:h-16 px-2.5 sm:px-6 py-2 flex items-center justify-between border-b border-cream/15 bg-[#16251C]/85 backdrop-blur-md pt-safe w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBackToExterior}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-[11px] sm:text-xs font-mono transition-all border border-cream/15 cursor-pointer shrink-0 min-h-[34px]"
            title="Return to Hotel Exterior"
            aria-label="Return to Hotel Exterior"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cream shrink-0" />
            <span className="hidden sm:inline">Hotel Exterior</span>
            <span className="sm:hidden text-[10px]">Exterior</span>
          </button>

          <div className="h-4 w-px bg-cream/20 hidden sm:block" />

          <div className="hidden xs:flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-serif text-xs sm:text-base font-medium text-cream truncate max-w-[120px] sm:max-w-none">
              Grand Lobby
            </span>
            <span className="font-serif text-xs sm:text-base font-medium text-cream/70 hidden md:inline">
              & Reception Desk
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Voice Audio, Front Desk Photo vs 360° Lobby Tour & Guest Account */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Receptionist Voice Play/Pause Audio Button */}
          <button
            type="button"
            onClick={toggleVoicePlayback}
            className={`flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono transition-all cursor-pointer shadow-md min-h-[34px] min-w-[34px] justify-center shrink-0 ${
              isAudioPlaying
                ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200'
                : 'bg-cream/10 hover:bg-cream/20 border-cream/20 text-cream/80 hover:text-white'
            }`}
            title={
              isAudioPlaying
                ? 'Receptionist Voice is Playing (Click to Pause)'
                : 'Play Receptionist Voice Welcome (मराठी)'
            }
            aria-label="Toggle Receptionist Voice Audio"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isAudioPlaying ? 'text-emerald-300 animate-pulse' : 'text-amber-300'}`} />
            {isAudioPlaying ? (
              <>
                <span className="hidden md:inline">Voice Playing</span>
                <span className="hidden sm:flex items-center gap-0.5">
                  <span className="w-1 h-2 bg-emerald-400 animate-pulse rounded-full" />
                  <span className="w-1 h-3 bg-emerald-300 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                </span>
              </>
            ) : (
              <span className="hidden sm:inline">Voice</span>
            )}
          </button>

          <GuestAccountButton variant="dark" />

          <div className="flex items-center p-0.5 bg-[#0f1b13]/90 backdrop-blur-md rounded-full border border-cream/20 text-[10px] sm:text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => setReceptionMode('desk-photo')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                receptionMode === 'desk-photo'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
              title="Static Desk Photography"
            >
              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setReceptionMode('360-lobby')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                receptionMode === '360-lobby'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
              title="360° Grand Lobby Tour"
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
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

            {/* Receptionist Audio Greeting Bar */}
            <div className="p-3 rounded-2xl bg-black/45 border border-amber-300/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAudioPlaying
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-400/20 text-amber-200'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-mono text-amber-200 block font-medium truncate">
                    {isAudioPlaying ? 'Receptionist Speaking...' : 'Receptionist Voice Welcome'}
                  </span>
                  <span className="text-[10px] text-cream/60 block truncate">
                    मराठी स्वागत · Marathi Customer Care Voice
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleVoicePlayback}
                className="px-3 py-1.5 rounded-full bg-cream hover:bg-white text-[#16251C] text-xs font-mono font-semibold shrink-0 cursor-pointer shadow-sm transition-all"
              >
                {isAudioPlaying ? 'Pause' : 'Play / Replay'}
              </button>
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
                className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-cream border border-white/20 shadow-md flex items-center justify-between transition-all text-xs font-mono group cursor-pointer"
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
        <div className="relative z-20 px-3 py-2 sm:p-5 flex items-center justify-center pointer-events-none mb-1">
          <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                setViewState('greeting')
                replayVoice()
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#18261E]/95 hover:bg-[#18261E] text-cream text-[11px] sm:text-xs font-mono border border-cream/25 flex items-center gap-1.5 shadow-2xl transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span>Receptionist Voice</span>
            </button>

            <button
              type="button"
              onClick={() => setViewState('dates')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-cream hover:bg-white text-[#16251C] text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xl transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#16251C] shrink-0" />
              <span>Select Dates & Book Suite</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#16251C] shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM STATUS FOOTER
          ========================================================================= */}
      <footer className="relative z-30 h-10 sm:h-12 px-3 sm:px-6 flex items-center justify-between border-t border-cream/15 bg-[#16251C]/80 backdrop-blur-md text-[10px] sm:text-xs font-mono text-cream/70 pb-safe">
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
          onClick={handleBackToExterior}
          className="text-amber-200 hover:text-white underline font-medium shrink-0 cursor-pointer text-[10px] sm:text-xs hidden sm:inline-block"
        >
          ← Hotel Exterior
        </button>
      </footer>
    </div>
  )
}

export default ReceptionScene
