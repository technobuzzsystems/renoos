import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Compass,
  Camera,
  Sparkles,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Tag,
  Wifi,
  Coffee,
  Bath,
  Wind,
  Bed,
  Layers,
  AlertTriangle,
  Volume2,
} from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'
import type { Room, Space, ConfirmedReservation } from '@/types'
import { PanoramaViewer } from '@/components/panorama/PanoramaViewer'
import { SpaceSelector } from '@/components/rooms/SpaceSelector'
import { BookingModal } from '@/components/booking/BookingModal'
import { GuestAccountButton } from '@/components/auth'
import { formatArea } from '@/lib/utils'
import { fetchRoomAvailability, type AvailabilityMap } from '@/services/api'
import { useLanguage } from '@/context/LanguageContext'
import { LanguageSelector } from '@/components/common/LanguageSelector'

interface RoomPreviewSceneProps {
  initialRoomId?: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  onBackToReception: () => void
  onBackToExterior: () => void
  onModifyDates?: () => void
}

/**
 * STAGE 3: Immersive Room Preview Scene
 * Displays available suites (Rooms 201–205) with:
 * - Photography (real photos from /IMG/)
 * - 360° Virtual Tour (equirectangular panoramas via PanoramaViewer)
 * - Space navigation (Bedroom, Bathroom)
 * - Direct client-side reservation flow & PDF tax invoice generation
 */
export const RoomPreviewScene: React.FC<RoomPreviewSceneProps> = ({
  initialRoomId = '201',
  checkInDate,
  checkOutDate,
  adults,
  children,
  onBackToReception,
  onBackToExterior,
  onModifyDates,
}) => {
  // Selected Room State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId)

  const {
    playAudio,
    playRoomAudio,
    hasRoomAudio,
    stopAudio,
    isPlaying: isAudioPlaying,
    currentText,
  } = useLanguage()

  // Optional notification when selecting a room without an announcement recording
  const [missingAudioNotice, setMissingAudioNotice] = useState<string | null>(null)

  // Clean up audio when leaving room preview
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  // Play room announcement once upon arriving at the Room Preview experience
  const hasAnnouncedInitialRoomRef = useRef(false)
  useEffect(() => {
    if (!hasAnnouncedInitialRoomRef.current) {
      hasAnnouncedInitialRoomRef.current = true
      const targetRoom = ROOMS_DATA.find((r) => r.id === selectedRoomId || r.roomNumber === selectedRoomId)
      const roomNum = targetRoom?.roomNumber || selectedRoomId || '201'
      if (hasRoomAudio(roomNum)) {
        playRoomAudio(roomNum, true)
      }
    }
  }, [selectedRoomId, hasRoomAudio, playRoomAudio])

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    const targetRoom = ROOMS_DATA.find((r) => r.id === roomId || r.roomNumber === roomId)
    const roomNum = targetRoom?.roomNumber || roomId

    // Stop previous room announcement, if playing
    stopAudio()
    setMissingAudioNotice(null)

    // Find and play matching recording for that room in selected language
    if (hasRoomAudio(roomNum)) {
      playRoomAudio(roomNum, true)
    } else {
      // If none exists, do not play another room's recording; continue normally with brief notice
      setMissingAudioNotice(`Viewing ${targetRoom?.name || `Room ${roomNum}`}`)
      setTimeout(() => setMissingAudioNotice(null), 3000)
    }
  }

  const handleSelectSpace = (spaceId: string) => {
    if (spaceId !== selectedSpaceKey) {
      setSelectedSpaceKey(spaceId)
      if (spaceId === 'washroom' || spaceId === 'bathroom') {
        playAudio('bathroomTour')
      } else if (spaceId === 'bedroom') {
        playAudio('bedroomTour')
      }
    }
  }

  const selectedRoom = useMemo(() => {
    return (
      ROOMS_DATA.find((r) => r.id === selectedRoomId || r.roomNumber === selectedRoomId) ||
      ROOMS_DATA[0]
    )
  }, [selectedRoomId])

  // Real-time PMS Room Availability (Multi-User Concurrency Sync)
  const [availability, setAvailability] = useState<AvailabilityMap>({
    '201': { available: true },
    '202': { available: true },
    '203': { available: true },
    '204': { available: true },
    '205': { available: true },
  })

  const refreshAvailability = async () => {
    try {
      const data = await fetchRoomAvailability(checkInDate, checkOutDate)
      setAvailability(data)
    } catch (err) {
      console.warn('Availability polling error:', err)
    }
  }

  // Poll availability every 4s to sync multi-user bookings in real time
  useEffect(() => {
    refreshAvailability()
    const timer = setInterval(refreshAvailability, 4000)
    return () => clearInterval(timer)
  }, [checkInDate, checkOutDate])

  const currentRoomAvail = availability[selectedRoom.roomNumber] || availability[selectedRoom.id]
  const isCurrentRoomAvailable = currentRoomAvail?.available !== false
  const conflictingBooking = currentRoomAvail?.conflictingBooking

  // Viewing Mode: Photography vs 360° Virtual Tour
  const [viewMode, setViewMode] = useState<'photo' | '360'>('360')

  // Selected Space in Current Room (Bedroom, Bathroom)
  const [selectedSpaceKey, setSelectedSpaceKey] = useState<string>('bedroom')

  // Ensure selected space exists in current room
  useEffect(() => {
    if (!selectedRoom.spaces[selectedSpaceKey]) {
      setSelectedSpaceKey('bedroom')
    }
  }, [selectedRoom, selectedSpaceKey])

  const activeSpace: Space =
    selectedRoom.spaces[selectedSpaceKey] || selectedRoom.spaces.bedroom || Object.values(selectedRoom.spaces)[0]!

  // Active Photo in Photography Mode
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0)

  // Reset photo index when room or space changes
  useEffect(() => {
    setActivePhotoIndex(0)
  }, [selectedRoomId, selectedSpaceKey])

  // Photos available for active room space
  const currentPhotos = useMemo(() => {
    const spaceGallery = activeSpace?.images?.gallery || []
    if (spaceGallery.length > 0) return spaceGallery

    const roomGallery = selectedRoom.previewImages?.gallery || []
    if (roomGallery.length > 0) return roomGallery.map((g) => g.src)

    return [selectedRoom.previewImages.hero]
  }, [activeSpace, selectedRoom])

  // 360° Panorama Configuration for Active Space
  const panoramaConfig = useMemo(() => {
    return (
      activeSpace?.panorama || {
        imageSrc: `/panoramas/room-${selectedRoom.roomNumber}/${activeSpace?.type || 'bedroom'}.jpg`,
        aspectRatio: '2:1' as const,
        initialFov: 82,
        minFov: 42,
        maxFov: 105,
        initialPitch: 0,
        initialYaw: 0,
        isPlaceholder: false,
        isAvailable: true,
        caption: `${selectedRoom.name} — 360° ${activeSpace?.title || 'Suite Tour'}`,
      }
    )
  }, [activeSpace, selectedRoom])

  // Tariff calculation (nights, gst, total)
  const nights = useMemo(() => {
    try {
      const d1 = new Date(checkInDate).getTime()
      const d2 = new Date(checkOutDate).getTime()
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    } catch {
      return 1
    }
  }, [checkInDate, checkOutDate])

  const tariffPerNight = selectedRoom.pricePerNight || 5200
  const subtotal = tariffPerNight * nights
  const discount = Math.round(subtotal * 0.1) // SBFARM 10% promo
  const taxesAndGst = Math.round((subtotal - discount) * 0.12)
  const totalAmount = subtotal - discount + taxesAndGst

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [recentBooking, setRecentBooking] = useState<ConfirmedReservation | null>(null)

  // Format date readable
  const formatShortDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number)
      const d = new Date(year, month - 1, day)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="relative w-full h-full bg-[#0d1510] text-cream flex flex-col justify-between overflow-hidden select-none">
      {/* =========================================================================
          1. TOP NAVIGATION & SUITE SWITCHER COCKPIT
          ========================================================================= */}
      {/* =========================================================================
          1. TOP NAVIGATION & SUITE SWITCHER COCKPIT
          ========================================================================= */}
      <header className="relative z-30 shrink-0 bg-[#16251C]/95 backdrop-blur-md border-b border-cream/15 px-3 sm:px-6 py-2 sm:py-3 lg:py-2.5 shadow-md pt-safe">
        {/* =========================================================================
            MOBILE VIEW (< lg): Preserved original two-row cockpit
            ========================================================================= */}
        <div className="lg:hidden">
          {/* Top Cockpit Row: Back, Brand, Dates, Guest */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onBackToReception}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-[11px] sm:text-xs font-mono transition-all border border-cream/15 cursor-pointer shrink-0"
                title="Return to Grand Lobby"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cream" />
                <span className="hidden sm:inline">Grand Lobby</span>
                <span className="sm:hidden">Lobby</span>
              </button>

              <div className="h-4 w-px bg-cream/20 hidden sm:block" />

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif text-sm sm:text-lg font-medium text-cream tracking-tight">
                    RENOOS HOTEL
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cream/15 text-cream/90 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider hidden xs:inline-block">
                    Suites
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cream/70">
                  <span>
                    {formatShortDate(checkInDate)} – {formatShortDate(checkOutDate)} ({nights}{' '}
                    {nights === 1 ? 'nt' : 'nts'})
                  </span>
                  <span className="hidden xs:inline">·</span>
                  <span className="hidden xs:inline">
                    {adults} {adults === 1 ? 'Adult' : 'Adults'}
                  </span>
                  {onModifyDates && (
                    <button
                      type="button"
                      onClick={onModifyDates}
                      className="text-amber-200 hover:text-white underline ml-1 cursor-pointer font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Language Selector & Guest Account Portal */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
              <LanguageSelector variant="compact" />
              <GuestAccountButton variant="dark" />
            </div>
          </div>

          {/* Second Row: View Mode Toggle (Left side) & Suite Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-cream/10">
            {/* Two Viewing Modes Toggle (Photo, 360°) - Left Side */}
            <div className="flex items-center p-0.5 sm:p-1 bg-[#0f1b13]/90 rounded-2xl border border-cream/20 text-[11px] sm:text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                    : 'text-cream/70 hover:text-white'
                }`}
              >
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('360')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === '360'
                    ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                    : 'text-cream/70 hover:text-white'
                }`}
              >
                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>360°</span>
              </button>
            </div>

            {/* Suite Switcher Tabs (Rooms 201–205) */}
            <div className="flex items-center p-0.5 sm:p-1 bg-[#0f1b13]/90 rounded-2xl border border-cream/20 shadow-inner overflow-x-auto no-scrollbar max-w-full touch-pan-x scroll-smooth overscroll-x-contain">
              {ROOMS_DATA.map((room) => {
                const isSelected = room.id === selectedRoom.id
                const price = room.pricePerNight || 5200
                const roomAvail = availability[room.roomNumber] || availability[room.id]
                const isAvailable = roomAvail?.available !== false

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => handleSelectRoom(room.id)}
                    className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? isAvailable
                          ? 'bg-cream text-[#16251C] font-bold shadow-md'
                          : 'bg-red-900/80 text-red-100 border border-red-400 font-bold shadow-md'
                        : isAvailable
                          ? 'text-cream/70 hover:text-white hover:bg-cream/10'
                          : 'text-red-300/60 hover:text-red-200 hover:bg-red-950/40'
                    }`}
                  >
                    <span className="font-mono font-bold">{room.roomNumber}</span>
                    <span className="hidden md:inline font-serif">{room.name}</span>
                    {isAvailable ? (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono ${
                          isSelected ? 'text-[#16251C]/80 font-bold' : 'text-amber-200'
                        }`}
                      >
                        ₹{(price).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-red-500/30 text-red-200 border border-red-500/50 font-bold">
                        Booked
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            LAPTOP / DESKTOP VIEW (lg:flex): Sleek single-row luxury cockpit
            ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between gap-3 xl:gap-5">
          {/* Left: Back to Lobby + Brand Wordmark + Reservation Dates Pill + View Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToReception}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-all border border-cream/15 cursor-pointer shrink-0 group"
              title="Return to Grand Lobby"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cream group-hover:-translate-x-0.5 transition-transform" />
              <span>Grand Lobby</span>
            </button>

            <div className="h-5 w-px bg-cream/20" />

            <div className="flex items-center gap-3">
              <span className="font-serif text-lg font-medium text-cream tracking-tight">
                RENOOS HOTEL
              </span>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cream/10 border border-cream/15 text-xs font-mono text-cream/80">
                <Calendar className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>
                  {formatShortDate(checkInDate)} – {formatShortDate(checkOutDate)} ({nights}{' '}
                  {nights === 1 ? 'nt' : 'nts'})
                </span>
                <span className="text-cream/40">·</span>
                <span>
                  {adults} {adults === 1 ? 'Adult' : 'Adults'}
                </span>
                {onModifyDates && (
                  <button
                    type="button"
                    onClick={onModifyDates}
                    className="text-amber-200 hover:text-white underline ml-1 cursor-pointer font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle (Photo, 360°) - Left Side */}
            <div className="flex items-center p-1 bg-[#0f1b13]/90 rounded-2xl border border-cream/20 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                    : 'text-cream/70 hover:text-white hover:bg-cream/10'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('360')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  viewMode === '360'
                    ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                    : 'text-cream/70 hover:text-white hover:bg-cream/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>360°</span>
              </button>
            </div>
          </div>

          {/* Center: Suite Switcher Tabs (Rooms 201–205) */}
          <div className="flex items-center p-1 bg-[#0f1b13]/90 rounded-2xl border border-cream/20 shadow-inner overflow-x-auto no-scrollbar shrink-0">
            {ROOMS_DATA.map((room) => {
              const isSelected = room.id === selectedRoom.id
              const price = room.pricePerNight || 5200
              const roomAvail = availability[room.roomNumber] || availability[room.id]
              const isAvailable = roomAvail?.available !== false

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? isAvailable
                        ? 'bg-cream text-[#16251C] font-bold shadow-md'
                        : 'bg-red-900/80 text-red-100 border border-red-400 font-bold shadow-md'
                      : isAvailable
                        ? 'text-cream/70 hover:text-white hover:bg-cream/10'
                        : 'text-red-300/60 hover:text-red-200 hover:bg-red-950/40'
                  }`}
                >
                  <span className="font-mono font-bold">{room.roomNumber}</span>
                  <span className="font-serif hidden xl:inline">{room.name}</span>
                  <span className="font-serif xl:hidden">
                    {room.roomNumber === '204'
                      ? 'Horizon'
                      : room.roomNumber === '205'
                      ? 'Bohemian'
                      : room.name.split(' ')[0]}
                  </span>
                  {isAvailable ? (
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-[#16251C]/80 font-bold' : 'text-amber-200'
                      }`}
                    >
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50 font-bold">
                      Booked
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Language Selector & Guest Portal */}
          <div className="flex items-center gap-2.5 xl:gap-3 shrink-0">
            <LanguageSelector variant="compact" />
            <GuestAccountButton variant="dark" />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN STAGE VIEWPORT (Photography, 360° Tour, 3D View)
          ========================================================================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Live Audio Announcement Floating Subtitle Pill */}
        {((isAudioPlaying && currentText) || missingAudioNotice) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-[92%] sm:max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-2 rounded-full bg-[#16251C]/92 backdrop-blur-md border border-emerald-400/35 text-cream text-[11px] sm:text-xs font-serif shadow-2xl flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-emerald-300 shrink-0 animate-pulse" />
              <span className="truncate italic">
                "{missingAudioNotice || currentText}"
              </span>
            </div>
          </div>
        )}
        {/* MODE 1: PHOTOGRAPHY (Real Images in public/IMG/) */}
        {viewMode === 'photo' && (
          <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-5 overflow-y-auto">
            {/* Main Featured Photo Container */}
            <div className="relative flex-1 w-full min-h-[300px] rounded-3xl overflow-hidden border border-cream/20 shadow-2xl bg-black">
              <img
                src={currentPhotos[activePhotoIndex] || currentPhotos[0]}
                alt={`${selectedRoom.name} - ${activeSpace?.title || 'Preview'}`}
                className="w-full h-full object-cover object-center transition-all duration-500 ease-out"
              />

              {/* Space & Photo Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest block">
                    {activeSpace?.title || 'Suite Space'}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl text-cream font-medium">
                    {selectedRoom.name} · Room {selectedRoom.roomNumber}
                  </h3>
                  <p className="text-xs text-cream/70 font-light mt-0.5 max-w-md hidden sm:block">
                    {selectedRoom.tagline}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono text-cream/80">
                  {activePhotoIndex + 1} / {currentPhotos.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Filmstrip */}
            {currentPhotos.length > 1 && (
              <div className="shrink-0 pt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {currentPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activePhotoIndex === idx
                        ? 'border-cream scale-105 shadow-md'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: 360° VIRTUAL TOUR (Equirectangular Panoramas via PanoramaViewer) */}
        {viewMode === '360' && (
          <div className="absolute inset-0">
            <PanoramaViewer
              config={panoramaConfig}
              spaceTitle={activeSpace?.title || 'Suite'}
              roomNumber={selectedRoom.roomNumber}
              onNavigateSpace={(spaceId) => {
                if (selectedRoom.spaces[spaceId]) {
                  handleSelectSpace(spaceId)
                }
              }}
              hideHotspotList={true}
              hideInternalHeader={true}
              viewportHeightClass="h-full w-full"
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          3. SPACE NAVIGATION BAR (Bedroom, Bathroom) — Mobile only (< lg)
          ========================================================================= */}
      <div className="lg:hidden relative z-20 shrink-0 px-3 sm:px-6 py-2 bg-[#16251C]/90 backdrop-blur-md border-t border-cream/15">
        <SpaceSelector
          variant="dark"
          spaces={selectedRoom.spaces}
          activeSpaceId={selectedSpaceKey}
          onSelectSpace={handleSelectSpace}
        />
      </div>

      {/* Unavailability Conflict Notice Strip (if room booked for selected dates) */}
      {!isCurrentRoomAvailable && (
        <div className="relative z-30 shrink-0 bg-red-950/95 border-t border-red-500/50 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-red-200 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong className="text-white">Room {selectedRoom.roomNumber} is unavailable</strong>
              {conflictingBooking ? ` (${conflictingBooking.checkInDate} to ${conflictingBooking.checkOutDate})` : ''} — Another guest has confirmed this suite in the PMS.
            </span>
          </div>
          {onModifyDates && (
            <button
              type="button"
              onClick={onModifyDates}
              className="underline hover:text-white text-xs font-mono ml-3 cursor-pointer shrink-0 font-medium"
            >
              Modify Dates
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM RESERVATION BAR (Pricing breakdown & Instant Booking Modal)
          ========================================================================= */}
      <footer className="relative z-30 shrink-0 bg-[#0f1b13]/95 backdrop-blur-xl border-t border-cream/20 px-3 sm:px-6 py-2.5 sm:py-3 lg:py-2.5 shadow-2xl pb-safe">
        {/* MOBILE FOOTER (< lg): Preserved original layout */}
        <div className="flex lg:hidden items-center justify-between gap-2 sm:gap-3 w-full">
          {/* Left: Room Specifications Strip */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-mono text-cream/70">
            <div className="flex items-center gap-1 sm:gap-1.5 text-cream">
              <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span className="font-semibold">Room {selectedRoom.roomNumber}</span>
            </div>
            <span>·</span>
            <span>{formatArea(selectedRoom.area)}</span>
            <span className="hidden xs:inline">·</span>
            <span className="text-amber-200 font-bold hidden xs:inline">
              ₹{tariffPerNight.toLocaleString('en-IN')}/nt
            </span>
            {!isCurrentRoomAvailable && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-200 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                Unavailable
              </span>
            )}
          </div>

          {/* Right: Tariff Total & Primary Booking CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase text-cream/60 hidden xs:inline">Total</span>
                <span className="text-sm sm:text-lg font-serif font-bold text-cream">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-cream/60 block">
                {nights} {nights === 1 ? 'nt' : 'nts'} · incl. GST
              </span>
            </div>

            <button
              type="button"
              disabled={!isCurrentRoomAvailable}
              onClick={() => setIsBookingModalOpen(true)}
              className={`py-2 sm:py-3 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs uppercase tracking-wider font-bold shadow-xl flex items-center gap-1.5 transition-all duration-300 ${
                isCurrentRoomAvailable
                  ? 'bg-cream hover:bg-white text-[#16251C] transform hover:scale-105 cursor-pointer'
                  : 'bg-red-950/70 border border-red-500/40 text-red-300 cursor-not-allowed opacity-90'
              }`}
            >
              {isCurrentRoomAvailable ? (
                <>
                  <span>Book <span className="hidden xs:inline">Room </span>{selectedRoom.roomNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16251C]" />
                </>
              ) : (
                <span>Booked</span>
              )}
            </button>
          </div>
        </div>

        {/* LAPTOP / DESKTOP FOOTER (lg:flex): Unified Luxury Console with Integrated Space Selector */}
        <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-8 w-full">
          {/* Left: Suite Details & Architectural Metadata */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cream/10 border border-cream/20 flex items-center justify-center text-amber-200 shrink-0 shadow-inner">
              <Bed className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-amber-200 text-xs px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                  Room {selectedRoom.roomNumber}
                </span>
                <h4 className="font-serif text-base font-medium text-cream tracking-tight truncate max-w-[200px] xl:max-w-xs">
                  {selectedRoom.name}
                </h4>
                {!isCurrentRoomAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold uppercase">
                    Unavailable
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cream/70 mt-0.5">
                <span>{formatArea(selectedRoom.area)}</span>
                <span>·</span>
                <span className="text-amber-200 font-bold">₹{tariffPerNight.toLocaleString('en-IN')}/night</span>
                <span className="hidden xl:inline">·</span>
                <span className="hidden xl:inline text-cream/60 truncate max-w-[200px]">
                  {selectedRoom.tagline}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Integrated Space Switcher (Bedroom / Bathroom) */}
          <div className="flex items-center justify-center shrink-0">
            <SpaceSelector
              variant="dark"
              spaces={selectedRoom.spaces}
              activeSpaceId={selectedSpaceKey}
              onSelectSpace={handleSelectSpace}
              className="w-auto min-w-[260px]"
            />
          </div>

          {/* Right: Tariff Total & Primary Booking CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] font-mono uppercase text-cream/60">Total</span>
                <span className="text-xl font-serif font-bold text-cream">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cream/60 block">
                {nights} {nights === 1 ? 'night' : 'nights'} · taxes & GST incl.
              </span>
            </div>

            <button
              type="button"
              disabled={!isCurrentRoomAvailable}
              onClick={() => setIsBookingModalOpen(true)}
              className={`py-3 px-6 rounded-xl text-xs uppercase tracking-wider font-bold shadow-xl flex items-center gap-2 transition-all duration-300 ${
                isCurrentRoomAvailable
                  ? 'bg-cream hover:bg-white text-[#16251C] transform hover:scale-105 cursor-pointer'
                  : 'bg-red-950/70 border border-red-500/40 text-red-300 cursor-not-allowed opacity-90'
              }`}
            >
              {isCurrentRoomAvailable ? (
                <>
                  <span>Book Room {selectedRoom.roomNumber}</span>
                  <ArrowRight className="w-4 h-4 text-[#16251C]" />
                </>
              ) : (
                <span>Unavailable</span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          5. CLIENT-SIDE BOOKING MODAL WITH PDF TAX INVOICE GENERATION
          ========================================================================= */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={selectedRoom}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        adults={adults}
        children={children}
        nights={nights}
        tariffPerNight={tariffPerNight}
        discount={discount}
        promoCodeApplied="RENOOS"
        conservationFee={0}
        taxesAndGst={taxesAndGst}
        totalAmount={totalAmount}
        onBookingSuccess={(reservation) => {
          setRecentBooking(reservation)
          refreshAvailability()
        }}
      />
    </div>
  )
}

export default RoomPreviewScene

