import React, { useState, useMemo, useEffect } from 'react'
import {
  Compass,
  Camera,
  Box as BoxIcon,
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
} from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'
import type { Room, Space, ConfirmedReservation } from '@/types'
import { PanoramaViewer } from '@/components/panorama/PanoramaViewer'
import { Model3DViewer } from '@/components/model3d/Model3DViewer'
import { SpaceSelector } from '@/components/rooms/SpaceSelector'
import { BookingModal } from '@/components/booking/BookingModal'
import { GuestAccountButton } from '@/components/auth'
import { formatArea } from '@/lib/utils'
import { fetchRoomAvailability, type AvailabilityMap } from '@/services/api'

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
 * Displays available suites (Room 201, 202, 203) with:
 * - Photography (real photos from /IMG/)
 * - 360° Virtual Tour (equirectangular panoramas via PanoramaViewer)
 * - 3D Spatial Architecture (via Model3DViewer)
 * - Space navigation (Bedroom, Kitchen, Washroom, Garden)
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

  // Viewing Mode: Photography vs 360° Virtual Tour vs 3D View
  const [viewMode, setViewMode] = useState<'photo' | '360' | '3d'>('360')

  // Selected Space in Current Room (Bedroom, Kitchen, Washroom, Garden)
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

  // 3D Model Configuration
  const model3DConfig = useMemo(() => {
    return (
      activeSpace?.model3d || {
        isAvailable: false,
        isPlaceholder: true,
        placeholderNotes: 'Architectural model in preparation. Explore via 360° Tour or Photography.',
      }
    )
  }, [activeSpace])

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
      <header className="relative z-30 shrink-0 bg-[#16251C]/90 backdrop-blur-md border-b border-cream/15 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Brand & Back to Reception */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToReception}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-all border border-cream/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cream" />
            <span className="hidden sm:inline">Grand Lobby</span>
            <span className="sm:hidden">Lobby</span>
          </button>

          <div className="h-4 w-px bg-cream/20 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base sm:text-lg font-medium text-cream tracking-tight">
                RENOOS HOTEL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cream/15 text-cream/90 text-[10px] font-mono uppercase tracking-wider hidden md:inline-block">
                Suites Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cream/70">
              <span>
                {formatShortDate(checkInDate)} – {formatShortDate(checkOutDate)} ({nights}{' '}
                {nights === 1 ? 'nt' : 'nts'})
              </span>
              <span>·</span>
              <span>
                {adults} {adults === 1 ? 'Adult' : 'Adults'}
              </span>
              {onModifyDates && (
                <button
                  type="button"
                  onClick={onModifyDates}
                  className="text-amber-200 hover:text-white underline ml-1 cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Available Suites Selector Tabs (Room 201, 202, 203) */}
        <div className="flex items-center p-1 bg-[#0f1b13]/80 rounded-2xl border border-cream/20 shadow-inner">
          {ROOMS_DATA.map((room) => {
            const isSelected = room.id === selectedRoom.id
            const price = room.pricePerNight || 5200
            const roomAvail = availability[room.roomNumber] || availability[room.id]
            const isAvailable = roomAvail?.available !== false

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs transition-all ${
                  isSelected
                    ? isAvailable
                      ? 'bg-cream text-[#16251C] font-semibold shadow-md'
                      : 'bg-red-900/80 text-red-100 border border-red-400 font-semibold shadow-md'
                    : isAvailable
                      ? 'text-cream/70 hover:text-white hover:bg-cream/10'
                      : 'text-red-300/60 hover:text-red-200 hover:bg-red-950/40'
                }`}
              >
                <span className="font-mono font-bold">{room.roomNumber}</span>
                <span className="hidden md:inline font-serif">{room.name}</span>
                {isAvailable ? (
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-[#16251C]/80 font-bold' : 'text-amber-200'
                    }`}
                  >
                    ₹{(price).toLocaleString('en-IN')}
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

        {/* Right: Guest Account Portal & Three Viewing Modes Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GuestAccountButton variant="dark" />

          <div className="flex items-center p-1 bg-[#0f1b13]/80 rounded-2xl border border-cream/20 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('photo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'photo'
                  ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photography</span>
              <span className="sm:hidden">Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('360')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === '360'
                  ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">360° Tour</span>
              <span className="sm:hidden">360°</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === '3d'
                  ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <BoxIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D View</span>
              <span className="sm:hidden">3D</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN STAGE VIEWPORT (Photography, 360° Tour, 3D View)
          ========================================================================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
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
                  setSelectedSpaceKey(spaceId)
                }
              }}
              hideHotspotList={true}
              hideInternalHeader={true}
              viewportHeightClass="h-full w-full"
              className="h-full w-full"
            />
          </div>
        )}

        {/* MODE 3: 3D VIEW (via Model3DViewer) */}
        {viewMode === '3d' && (
          <div className="absolute inset-0 p-3 sm:p-5 flex items-center justify-center">
            <Model3DViewer
              config={model3DConfig}
              spaceTitle={activeSpace?.title || 'Suite'}
              roomNumber={selectedRoom.roomNumber}
              onReturnToPhoto={() => setViewMode('photo')}
              onExplore360={() => setViewMode('360')}
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          3. SPACE NAVIGATION BAR (Bedroom, Kitchen, Washroom, Garden)
          ========================================================================= */}
      <div className="relative z-20 shrink-0 px-3 sm:px-6 py-2 bg-[#16251C]/90 backdrop-blur-md border-t border-cream/15">
        <SpaceSelector
          spaces={selectedRoom.spaces}
          activeSpaceId={selectedSpaceKey}
          onSelectSpace={(spaceId) => setSelectedSpaceKey(spaceId)}
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
      <footer className="relative z-30 shrink-0 bg-[#0f1b13]/95 backdrop-blur-md border-t border-cream/20 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        {/* Left: Room Specifications Strip */}
        <div className="flex items-center gap-3 text-xs font-mono text-cream/70">
          <div className="flex items-center gap-1.5 text-cream">
            <Bed className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">Room {selectedRoom.roomNumber}</span>
          </div>
          <span>·</span>
          <span>{formatArea(selectedRoom.area)}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{selectedRoom.viewType}</span>
          <span>·</span>
          <span className="text-amber-200 font-bold">
            ₹{tariffPerNight.toLocaleString('en-IN')}/nt
          </span>
          {!isCurrentRoomAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold uppercase">
              Unavailable
            </span>
          )}
        </div>

        {/* Right: Tariff Total & Primary Booking CTA */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-cream/60">Total Tariff</span>
              <span className="text-base sm:text-lg font-serif font-bold text-cream">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cream/60 block">
              {nights} {nights === 1 ? 'night' : 'nights'} · incl. 12% GST
            </span>
          </div>

          <button
            type="button"
            disabled={!isCurrentRoomAvailable}
            onClick={() => setIsBookingModalOpen(true)}
            className={`py-2.5 sm:py-3 px-5 sm:px-6 rounded-2xl text-xs uppercase tracking-wider font-bold shadow-xl flex items-center gap-2 transition-all duration-300 ${
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
              <>
                <span>Room {selectedRoom.roomNumber} Booked</span>
                <span className="text-[10px] font-mono opacity-80">(Unavailable)</span>
              </>
            )}
          </button>
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

