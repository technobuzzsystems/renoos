import React, { useState, useMemo, useCallback } from 'react'
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
  Bell,
  Volume2,
  X,
  Bed,
  Coffee,
  Clock,
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

  // Interactive Concierge (Maya) State
  const [isMayaOpen, setIsMayaOpen] = useState(false)
  const [mayaTopic, setMayaTopic] = useState<'greeting' | 'recommend' | 'dining' | 'policies' | 'bell'>('greeting')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [bellRung, setBellRung] = useState(false)

  // Web Audio Brass Reception Bell Synthesizer
  const ringReceptionBell = useCallback(() => {
    setBellRung(true)
    setTimeout(() => setBellRung(false), 900)
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(1760, ctx.currentTime) // A6 chime
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(2640, ctx.currentTime) // E7 harmonic

        gain.gain.setValueAtTime(0.35, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.3)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)

        osc1.start()
        osc2.start()
        osc1.stop(ctx.currentTime + 1.3)
        osc2.stop(ctx.currentTime + 1.3)
      }
    } catch {
      // AudioContext fallback
    }
  }, [])

  // Web Speech API Voice Greeting in Marathi (Graceful Ladies Voice)
  const speakGreeting = useCallback((marathiText?: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const phrase =
          marathiText ||
          'नमस्कार! रेणूस हॉटेलमध्ये आपले सहर्ष स्वागत आहे. मी माया, आपली लेडीज कॉन्सिएर्ज. आपल्या सुखावह मुक्कामासाठी मी कशी मदत करू शकेन?'
        const utterance = new SpeechSynthesisUtterance(phrase)
        utterance.rate = 0.88 // Courteous, calm pacing
        utterance.pitch = 1.18 // Graceful, polite feminine pitch
        utterance.lang = 'mr-IN' // Marathi (India)

        const voices = window.speechSynthesis.getVoices()
        const femaleVoice =
          voices.find((v) => v.lang.startsWith('mr') || v.name.toLowerCase().includes('marathi')) ||
          voices.find(
            (v) =>
              v.lang.includes('IN') &&
              (v.name.includes('Heera') ||
                v.name.toLowerCase().includes('female') ||
                v.name.includes('Kalpana'))
          ) ||
          voices.find((v) => v.name.toLowerCase().includes('female') || v.name.includes('Zira')) ||
          voices.find((v) => v.lang.includes('IN'))

        if (femaleVoice) {
          utterance.voice = femaleVoice
        }

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } catch {
        setIsSpeaking(false)
      }
    }
  }, [])

  const openMayaConcierge = useCallback(
    (topic: 'greeting' | 'recommend' | 'dining' | 'policies' | 'bell' = 'greeting') => {
      setMayaTopic(topic)
      setIsMayaOpen(true)
      if (topic === 'bell') {
        ringReceptionBell()
      } else if (topic === 'recommend') {
        speakGreeting(
          'शांततेसाठी मी रूम २०१ झेन गार्डन सुचवेन, आणि निसर्गरम्य डोंगररांगांसाठी रूम २०३ एक्झिक्युटिव्ह सूट उत्तम आहे.'
        )
      } else if (topic === 'dining') {
        speakGreeting(
          'आमच्याकडे २४ तास इन-रूम डायनिंग, सेंद्रिय नाश्ता, आणि संध्याकाळी खास चहा लाउंजची सोय आहे.'
        )
      } else if (topic === 'policies') {
        speakGreeting('चेक-इन दुपारी २:०० वाजता आणि चेक-आउट सकाळी ११:०० वाजता आहे.')
      } else {
        speakGreeting()
      }
    },
    [ringReceptionBell, speakGreeting]
  )

  const closeMayaConcierge = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsMayaOpen(false)
  }, [])

  // Handle continuing to Room Preview
  const handleContinue = (_targetRoomId?: string) => {
    closeMayaConcierge()
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
          id: 'hs-lobby-receptionist',
          title: 'Meet Maya · कॉन्सिएर्ज',
          description: 'लेडीज कॉन्सिएर्ज · बोलण्यासाठी क्लिक करा (Click to talk in Marathi)',
          type: 'feature' as const,
          spherical: { yaw: 166, pitch: -13 },
          category: 'Front Desk Concierge',
          icon: 'concierge',
        },
        {
          id: 'hs-lobby-book',
          title: 'Book a Room · रूम बुक करा',
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

          {/* Interactive Beacons on Front Desk Photo */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {/* Beside Maya (Left side): Interactive Concierge Beacon */}
            <div className="absolute top-[54%] left-[40%] sm:left-[41%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => openMayaConcierge('greeting')}
                className="group flex flex-col items-center gap-1 cursor-pointer transition-all transform hover:scale-105"
              >
                <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/80 border border-amber-300/80 shadow-2xl backdrop-blur-md group-hover:bg-[#1a2d21]">
                  <span className="absolute -inset-1.5 rounded-full bg-amber-400/30 animate-pulse" />
                  <span className="absolute -inset-2 rounded-full bg-emerald-400/20 animate-ping opacity-50" />
                  <User className="w-4 h-4 text-amber-200" />
                </span>
                <span className="px-3 py-1 rounded-full bg-[#142319]/90 border border-amber-300/60 text-[10px] font-mono uppercase tracking-wider text-cream font-medium shadow-md flex items-center gap-1.5 group-hover:bg-black/95">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  माया · कॉन्सिएर्ज (मराठी)
                </span>
              </button>
            </div>

            {/* Beside Maya (Right side): Book a Room Beacon */}
            <div className="absolute top-[54%] left-[60%] sm:left-[59%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  closeMayaConcierge()
                  setViewState('dates')
                }}
                className="group flex flex-col items-center gap-1 cursor-pointer transition-all transform hover:scale-105"
              >
                <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/80 border border-white/40 shadow-2xl backdrop-blur-md group-hover:border-emerald-300 group-hover:bg-[#1a2d21]">
                  <span className="absolute -inset-1.5 rounded-full bg-emerald-400/25 animate-pulse" />
                  <Calendar className="w-4 h-4 text-emerald-300" />
                </span>
                <span className="px-3.5 py-1 rounded-full bg-black/80 border border-white/30 text-[10px] font-mono uppercase tracking-wider text-cream font-medium shadow-md group-hover:border-emerald-300 group-hover:bg-black/95">
                  Book a Room · रूम बुक करा
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
              if (hs.id === 'hs-lobby-receptionist') {
                openMayaConcierge('greeting')
                return true
              }
              if (hs.id === 'hs-lobby-book' || hs.targetSpaceId === 'dates') {
                closeMayaConcierge()
                setViewState('dates')
                return true
              }
              return false
            }}
            onNavigateSpace={() => setViewState('dates')}
            hideHotspotList={true}
            hideInternalHeader={true}
            bottomBarOffsetClass="bottom-16 sm:bottom-20"
            viewportHeightClass="h-full w-full"
            className="h-full w-full"
          />
        </div>
      )}

      {/* =========================================================================
          2. TOP NAVIGATION HUD (Minimal & Editorial)
          ========================================================================= */}
      <header className="relative z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-cream/15 bg-[#16251C]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToExterior}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-all border border-cream/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cream" />
            <span className="hidden sm:inline">Hotel Exterior</span>
            <span className="sm:hidden">Exterior</span>
          </button>

          <div className="h-4 w-px bg-cream/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-serif text-sm sm:text-base font-medium text-cream">
              Grand Lobby & Reception Desk
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Front Desk Photo vs 360° Lobby Tour & Guest Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GuestAccountButton variant="dark" />

          <div className="flex items-center p-1 bg-[#16251C]/75 backdrop-blur-md rounded-full border border-cream/20 text-xs font-mono">
            <button
              type="button"
              onClick={() => setReceptionMode('desk-photo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                receptionMode === 'desk-photo'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Front Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setReceptionMode('360-lobby')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                receptionMode === '360-lobby'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>360° Lobby</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. TRANSPARENT CONCIERGE INTERFACE SCREEN
          Placed gracefully to the right side of the counter (matching reference image)
          Soft blur, thin border, translucent cream/forest glass, minimal editorial content.
          ========================================================================= */}
      <div className="relative z-20 flex-1 flex items-center justify-center md:justify-end px-4 sm:px-8 md:pr-16 pointer-events-none">
        {viewState === 'greeting' && (
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full bg-[#18261E]/70 backdrop-blur-xl border border-amber-200/30 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 text-cream">
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
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full bg-[#18261E]/80 backdrop-blur-xl border border-amber-200/35 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-400 text-cream">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold block">
                  Reservation Dates
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-cream font-medium">
                  Select Check-in & Check-out
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewState('greeting')}
                className="text-xs font-mono text-cream/70 hover:text-cream px-2.5 py-1 rounded-full bg-cream/10 border border-cream/15"
              >
                ← Back
              </button>
            </div>

            {/* Date Pickers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Check-In */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15">
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
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15">
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
            <div className="p-3 rounded-2xl bg-[#0f1b13]/70 border border-cream/15 space-y-2.5">
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
                    className="w-7 h-7 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-4 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(4, adults + 1))}
                    className="w-7 h-7 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25"
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
                    className="w-7 h-7 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-4 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(3, children + 1))}
                    className="w-7 h-7 rounded-full bg-cream/15 text-cream flex items-center justify-center text-xs font-mono hover:bg-cream/25"
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
              className={`w-full py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
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

      {/* =========================================================================
          3B. INTERACTIVE CONCIERGE MAYA DIALOG
          Opens when user clicks on Receptionist Maya in 360° tour or photo
          ========================================================================= */}
      {isMayaOpen && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="pointer-events-auto max-w-lg w-full bg-[#15251B]/95 backdrop-blur-2xl border border-amber-300/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-cream">
            {/* Header with Maya's Profile, Status, and Controls */}
            <div className="flex items-start justify-between border-b border-cream/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-300/60 overflow-hidden bg-black shadow-lg">
                    <img
                      src="/images/receptionist-desk.jpg"
                      alt="Maya - Front Desk Concierge"
                      className="w-full h-full object-cover object-top scale-125"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center bg-[#1E3325]">
                      <User className="w-6 h-6 text-amber-200" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#15251B] animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl text-cream font-medium">
                      माया शर्मा · Maya
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9px] font-mono uppercase tracking-wider">
                      लेडीज कॉन्सिएर्ज (मराठी)
                    </span>
                  </div>
                  <p className="text-xs text-cream/70 font-light font-mono">
                    अतिथी सत्कार व आरक्षण · Front Desk Concierge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Bell Chime Trigger */}
                <button
                  type="button"
                  onClick={ringReceptionBell}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    bellRung
                      ? 'bg-amber-400 text-black border-amber-400 scale-110 shadow-lg'
                      : 'bg-cream/10 hover:bg-cream/20 text-amber-200 border-cream/20'
                  }`}
                  title="Ring Reception Bell"
                >
                  <Bell className={`w-4 h-4 ${bellRung ? 'animate-bounce' : ''}`} />
                </button>

                {/* Voice Greeting Trigger */}
                <button
                  type="button"
                  onClick={() => speakGreeting()}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 animate-pulse'
                      : 'bg-cream/10 hover:bg-cream/20 text-cream border-cream/20'
                  }`}
                  title="Speak Voice Greeting in Marathi"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Close Dialog */}
                <button
                  type="button"
                  onClick={closeMayaConcierge}
                  className="p-2 rounded-full bg-cream/10 hover:bg-cream/20 text-cream/70 hover:text-white border border-cream/20 transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Maya's Interactive Dialogue Bubble in Marathi */}
            <div className="p-4 rounded-2xl bg-[#0f1b13]/80 border border-cream/15 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-200/90 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                  माया बोलत आहेत · Maya Speaking (मराठी)
                </span>
                {isSpeaking && <span className="text-emerald-300 animate-pulse">🔊 आवाज चालू आहे...</span>}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm text-cream font-normal leading-relaxed">
                  {mayaTopic === 'greeting' &&
                    '“नमस्कार! रेणूस हॉटेलमध्ये आपले सहर्ष स्वागत आहे. मी माया, आपली लेडीज कॉन्सिएर्ज. आपल्या सुखावह आणि आनंदी मुक्कामासाठी मी कशी मदत करू शकेन?”'}
                  {mayaTopic === 'recommend' &&
                    '“शांततेसाठी आणि निसर्गाच्या सान्निध्यासाठी मी रूम २०१ (झेन वॉटर गार्डन व्ह्यू) सुचवेन. आणि डोंगररांगांच्या विहंगम दृश्यासाठी रूम २०३ (एक्झिक्युटिव्ह व्ह्यू) आमची सर्वोत्तम निवड आहे.”'}
                  {mayaTopic === 'dining' &&
                    '“आमच्या हॉटेलमध्ये २४ तास इन-रूम डायनिंग, ताजे सेंद्रिय नाश्ता, आणि संध्याकाळी खास निसर्गरम्य चहा लाउंजची सुंदर सोय आहे.”'}
                  {mayaTopic === 'policies' &&
                    '“चेक-इन दुपारी २:०० वाजता आणि चेक-आउट सकाळी ११:०० वाजता आहे. डायरेक्ट बुकिंगसाठी मोफत लगेज स्टोरेज आणि व्हॅलेट पार्किंग उपलब्ध आहे.”'}
                  {mayaTopic === 'bell' &&
                    '“टन-टन! मी लगेच आपल्या सेवेसाठी तत्पर आहे! आपल्याला रूम निवडण्यात किंवा आरक्षणात काही मदत हवी आहे का?”'}
                </p>
                <p className="text-[11px] text-cream/60 font-light italic leading-normal">
                  {mayaTopic === 'greeting' &&
                    '“Namaste! Warm welcome to Renoos Hotel. I am Maya, your front desk lady concierge. How may I assist your pleasant stay?”'}
                  {mayaTopic === 'recommend' &&
                    '“For serenity, I recommend Room 201 with its private Zen Garden. For high-altitude valley views, Executive Suite 203 is our crown jewel.”'}
                  {mayaTopic === 'dining' &&
                    '“Our hotel offers 24/7 in-suite dining, complimentary organic farm breakfast, and evening tea ceremonies.”'}
                  {mayaTopic === 'policies' &&
                    '“Check-in is from 2:00 PM and check-out is at 11:00 AM. Direct bookings include complimentary luggage holding.”'}
                  {mayaTopic === 'bell' &&
                    '“Ding! Right at your service! May I assist you with checking suite availability or bookings?”'}
                </p>
              </div>
            </div>

            {/* Interactive Quick Decision Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cream/60 block">
                कॉन्सिएर्ज पर्याय · Concierge Options
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Option 1: Book Room */}
                <button
                  type="button"
                  onClick={() => {
                    closeMayaConcierge()
                    setViewState('dates')
                  }}
                  className="p-2.5 rounded-xl bg-cream hover:bg-white text-[#16251C] font-semibold flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-[1.02] cursor-pointer col-span-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#16251C]" />
                  <span>तारखा निवडून रूम बुक करा · Book Room</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16251C]" />
                </button>

                {/* Option 2: Suite Recommendations */}
                <button
                  type="button"
                  onClick={() => openMayaConcierge('recommend')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    mayaTopic === 'recommend'
                      ? 'bg-amber-400/20 border-amber-300 text-amber-100'
                      : 'bg-white/5 hover:bg-white/10 border-cream/15 text-cream/90'
                  }`}
                >
                  <Bed className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">खोल्यांची माहिती · Suites</span>
                </button>

                {/* Option 3: Ring Bell */}
                <button
                  type="button"
                  onClick={() => openMayaConcierge('bell')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    mayaTopic === 'bell'
                      ? 'bg-amber-400/20 border-amber-300 text-amber-100'
                      : 'bg-white/5 hover:bg-white/10 border-cream/15 text-cream/90'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-300" />
                  <span className="truncate">घंटा वाजवा · Ring Bell</span>
                </button>

                {/* Option 4: Dining & Amenities */}
                <button
                  type="button"
                  onClick={() => openMayaConcierge('dining')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    mayaTopic === 'dining'
                      ? 'bg-amber-400/20 border-amber-300 text-amber-100'
                      : 'bg-white/5 hover:bg-white/10 border-cream/15 text-cream/90'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">भोजन आणि चहा · Dining</span>
                </button>

                {/* Option 5: Policies & Check-in */}
                <button
                  type="button"
                  onClick={() => openMayaConcierge('policies')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    mayaTopic === 'policies'
                      ? 'bg-amber-400/20 border-amber-300 text-amber-100'
                      : 'bg-white/5 hover:bg-white/10 border-cream/15 text-cream/90'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">चेक-इन व वेळा · Timings</span>
                </button>
              </div>

              {/* Direct Suite Preview Buttons when Recommended */}
              {mayaTopic === 'recommend' && (
                <div className="pt-2 flex items-center gap-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => handleContinue()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-mono text-emerald-200 hover:bg-emerald-500/30 whitespace-nowrap cursor-pointer"
                  >
                    रूम २०१ (गार्डन व्ह्यू) पहा →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContinue()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-[11px] font-mono text-amber-200 hover:bg-amber-500/30 whitespace-nowrap cursor-pointer"
                  >
                    रूम २०३ (व्हॅली व्ह्यू) पहा →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Re-Open Pill when User Minimized to Free Explore */}
      {viewState === 'free-explore' && !isMayaOpen && (
        <div className="relative z-20 p-4 sm:p-6 flex flex-wrap items-center justify-center gap-3 pointer-events-none">
          <button
            type="button"
            onClick={() => openMayaConcierge('greeting')}
            className="pointer-events-auto px-4 py-2.5 rounded-full bg-[#18261E]/90 hover:bg-[#18261E] text-cream text-xs font-mono border border-amber-300/40 flex items-center gap-2 shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <User className="w-3.5 h-3.5 text-amber-200" />
            <span>माया यांच्याशी बोला · Concierge (मराठी)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewState('dates')}
            className="pointer-events-auto px-5 py-2.5 rounded-full bg-cream hover:bg-white text-[#16251C] text-xs font-mono font-semibold flex items-center gap-2 shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#16251C]" />
            <span>तारखा निवडून रूम बुक करा · Book Room</span>
            <ArrowRight className="w-3 h-3 text-[#16251C]" />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM STATUS FOOTER
          ========================================================================= */}
      <footer className="relative z-30 h-12 px-4 sm:px-6 flex items-center justify-between border-t border-cream/15 bg-[#16251C]/60 backdrop-blur-md text-xs font-mono text-cream/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {receptionMode === 'desk-photo'
              ? 'Front Desk Presentation Active (Renoos Hotel)'
              : '360° Grand Lobby Tour Active · Drag to look around'}
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToExterior}
          className="text-amber-200 hover:text-white underline font-medium"
        >
          ← Hotel Exterior
        </button>
      </footer>
    </div>
  )
}

export default ReceptionScene
