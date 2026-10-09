import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Check,
  Maximize2,
  Bed,
  Eye,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tag,
  Wifi,
  Coffee,
  Bath,
  Wind,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Gift,
  FileCheck2,
  Lock,
  Camera,
  Image,
  Move,
  AlertTriangle,
} from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'
import type { Room, ConfirmedReservation } from '@/types'
import { SectionHeader } from '@/components/common'
import { PanoramaViewer } from '../panorama/PanoramaViewer'
import { BookingModal } from './BookingModal'
import { formatArea } from '@/lib/utils'
import { fetchRoomAvailability, type AvailabilityMap } from '@/services/api'

interface BookRoomsSectionProps {
  id?: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialAdults?: number
  initialChildren?: number
}

export const BookRoomsSection: React.FC<BookRoomsSectionProps> = ({
  id = 'book-rooms',
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialChildren = 0,
}) => {
  // Dates initialization (default tomorrow to +2 days)
  const defaultDates = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(tomorrow.getDate() + 2)

    return {
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0],
    }
  }, [])

  const [checkInDate, setCheckInDate] = useState<string>(
    initialCheckIn || defaultDates.checkIn
  )
  const [checkOutDate, setCheckOutDate] = useState<string>(
    initialCheckOut || defaultDates.checkOut
  )
  const [adults, setAdults] = useState<number>(initialAdults)
  const [children, setChildren] = useState<number>(initialChildren)

  useEffect(() => {
    if (initialCheckIn) setCheckInDate(initialCheckIn)
  }, [initialCheckIn])

  useEffect(() => {
    if (initialCheckOut) setCheckOutDate(initialCheckOut)
  }, [initialCheckOut])

  useEffect(() => {
    if (initialAdults !== undefined) setAdults(initialAdults)
  }, [initialAdults])

  useEffect(() => {
    if (initialChildren !== undefined) setChildren(initialChildren)
  }, [initialChildren])

  // Filters & Sorting
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Deluxe' | 'Premium' | 'Executive'>('All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'area-desc'>('featured')

  // Selected Room for Preview on the Right
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS_DATA[0].id)

  // Selected Space / Photo for the Right Preview Gallery
  const [selectedSpaceKey, setSelectedSpaceKey] = useState<string>('bedroom')

  // Preview Mode for the Right Column: Live 360° Tour vs High-Res Photo Preview
  const [previewViewMode, setPreviewViewMode] = useState<'360' | 'photo'>('360')
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null)

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [recentBooking, setRecentBooking] = useState<ConfirmedReservation | null>(() => {
    try {
      const stored = localStorage.getItem('renoos_hotel_reservations')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed[0] || null
      }
    } catch {
      // ignore
    }
    return null
  })

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

  // Poll availability every 4s to sync bookings made across multiple browsers/users
  useEffect(() => {
    refreshAvailability()
    const timer = setInterval(refreshAvailability, 4000)
    return () => clearInterval(timer)
  }, [checkInDate, checkOutDate])

  // Calculate nights
  const nights = useMemo(() => {
    try {
      const d1 = new Date(checkInDate).getTime()
      const d2 = new Date(checkOutDate).getTime()
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    } catch {
      return 1
    }
  }, [checkInDate, checkOutDate])

  // Get Room Price in INR
  const getRoomPrice = (room: Room) => {
    return room.pricePerNight || 5200
  }

  // Filtered and Sorted Rooms (Left Side)
  const availableRooms = useMemo(() => {
    let list = [...ROOMS_DATA]

    // Category filter
    if (categoryFilter !== 'All') {
      list = list.filter((r) => r.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    }

    // Guest capacity filter
    const totalGuests = adults + children
    list = list.filter((r) => r.guestCapacity >= totalGuests || r.guestCapacity >= adults)

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => getRoomPrice(a) - getRoomPrice(b))
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getRoomPrice(b) - getRoomPrice(a))
    } else if (sortBy === 'area-desc') {
      list.sort((a, b) => b.area - a.area)
    }

    return list
  }, [categoryFilter, sortBy, adults, children])

  // Selected Room Object
  const selectedRoom = useMemo(() => {
    const found = ROOMS_DATA.find((r) => r.id === selectedRoomId)
    return found || availableRooms[0] || ROOMS_DATA[0]
  }, [selectedRoomId, availableRooms])

  const selectedRoomAvail = availability[selectedRoom.roomNumber] || availability[selectedRoom.id]
  const isSelectedRoomAvailable = selectedRoomAvail?.available !== false
  const selectedConflictingBooking = selectedRoomAvail?.conflictingBooking

  // Reset selected space key when selected room changes if space doesn't exist
  const currentRoomSpaces = useMemo(() => {
    return Object.entries(selectedRoom.spaces)
      .filter(([_, space]) => Boolean(space))
      .map(([key, space]) => ({ key, space: space! }))
  }, [selectedRoom])

  const activeSpace = selectedRoom.spaces[selectedSpaceKey] || selectedRoom.spaces.bedroom

  // Live active preview image
  const previewImage = activeSpace?.images.main || selectedRoom.previewImages.hero

  // List of high-res perspective photos for current room / space
  const currentGalleryPhotos = useMemo(() => {
    if (activeSpace?.images?.gallery && activeSpace.images.gallery.length > 0) {
      return activeSpace.images.gallery
    }
    return selectedRoom.previewImages.gallery.map((g) => g.src)
  }, [activeSpace, selectedRoom])

  // Price calculations for preview
  const tariffPerNight = getRoomPrice(selectedRoom)
  const subtotal = tariffPerNight * nights
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0
  const conservationFee = Math.round(500 * nights)
  const taxableAmount = Math.max(0, subtotal - discount + conservationFee)
  const taxesAndGst = Math.round(taxableAmount * 0.18)
  const totalAmount = taxableAmount + taxesAndGst

  // Handle Promo Code submission
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError(null)
    const code = promoInput.trim().toUpperCase()
    if (!code) return

    if (code === 'RENOOS' || code === 'RENOOS10' || code === 'SBFARM' || code === 'SANCTUARY' || code === 'WELCOME10') {
      setAppliedPromo(code)
      setPromoError(null)
    } else {
      setPromoError('Invalid code. Try "RENOOS" for 10% discount.')
    }
  }

  // Handle Room Card Selection
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setSelectedSpaceKey('bedroom')
    setUserSelectedImage(null)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const previewEl = document.getElementById('room-preview-panel')
        if (previewEl) {
          previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
    }
  }

  return (
    <section id={id} className="py-24 md:py-32 bg-ivory scroll-mt-20 border-t border-[#E9E4DB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-forest/20 bg-forest/5 text-forest text-xs tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Real-World Hotel Booking System</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-forest font-normal leading-tight">
            Reserve Your Suite at Renoos Hotel
          </h2>

          <p className="text-charcoal-muted text-sm sm:text-base font-light leading-relaxed">
            Select an available accommodation on the left to inspect its live photo gallery, spatial layout, amenities, and real-time tariff breakdown on the right.
          </p>

          {/* Active Reservation Banner (if exists from previous booking) */}
          {recentBooking && (
            <div className="inline-flex items-center gap-3 p-2.5 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Active Reservation on file: <strong>{recentBooking.bookingReference}</strong> for Room {recentBooking.room.roomNumber} ({recentBooking.checkInDate})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId(recentBooking.room.id)
                  setIsBookingModalOpen(true)
                }}
                className="underline font-semibold hover:text-emerald-700 ml-1"
              >
                View Voucher
              </button>
            </div>
          )}
        </div>

        {/* Filter & Control Bar */}
        <div className="bg-cream border border-[#E9E4DB] rounded-3xl p-4 sm:p-5 shadow-warm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Check-In */}
            <div className="lg:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB]">
              <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-terracotta" />
                <span>Check-In</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value)
                  if (new Date(checkOutDate) <= new Date(e.target.value)) {
                    const next = new Date(e.target.value)
                    next.setDate(next.getDate() + 1)
                    setCheckOutDate(next.toISOString().split('T')[0])
                  }
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-forest focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-Out */}
            <div className="lg:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB]">
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold">
                  <CalendarDays className="w-3.5 h-3.5 text-terracotta" />
                  <span>Check-Out</span>
                </label>
                <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-1.5 py-0.2 rounded font-medium">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
              <input
                type="date"
                min={checkInDate}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-forest focus:outline-none cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="lg:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB] flex items-center justify-between">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold mb-1">
                  <Users className="w-3.5 h-3.5 text-terracotta" />
                  <span>Guests</span>
                </label>
                <div className="text-xs sm:text-sm font-semibold text-forest">
                  {adults} Adults{children > 0 ? `, ${children} Children` : ''}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="w-6 h-6 rounded-lg bg-cream border border-[#E9E4DB] text-forest font-bold text-xs disabled:opacity-40"
                  aria-label="Decrease adults"
                >
                  -
                </button>
                <span className="text-xs font-semibold px-1">{adults}</span>
                <button
                  type="button"
                  disabled={adults >= 4}
                  onClick={() => setAdults((a) => Math.min(4, a + 1))}
                  className="w-6 h-6 rounded-lg bg-cream border border-[#E9E4DB] text-forest font-bold text-xs disabled:opacity-40"
                  aria-label="Increase adults"
                >
                  +
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3 p-3 bg-ivory rounded-2xl border border-[#E9E4DB]">
              <label className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-sage font-semibold mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-terracotta" />
                <span>Sort Accommodations</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-forest focus:outline-none cursor-pointer"
              >
                <option value="featured">Curated · Recommended</option>
                <option value="price-asc">Tariff: Lowest to Highest</option>
                <option value="price-desc">Tariff: Highest to Lowest</option>
                <option value="area-desc">Floor Area: Largest First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills & Live Status */}
          <div className="pt-2 border-t border-[#E9E4DB] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-charcoal-muted uppercase font-mono mr-1">Filter:</span>
              {(['All', 'Deluxe', 'Premium', 'Executive'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-forest text-cream shadow-sm font-semibold'
                      : 'bg-ivory text-charcoal-muted hover:text-forest border border-[#E9E4DB]'
                  }`}
                >
                  {cat === 'All' ? `All Suites (${ROOMS_DATA.length})` : `${cat} Suites`}
                </button>
              ))}
            </div>

            <div className="text-xs text-forest font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {availableRooms.length} {availableRooms.length === 1 ? 'Suite' : 'Suites'} Available for Selected Dates
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MASTER-DETAIL SPLIT VIEW:
            LEFT: Available Rooms List
            RIGHT: Selected Room Live Interactive Preview
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: AVAILABLE ROOMS LIST ================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-sage font-semibold">
                Available Accommodations ({availableRooms.length})
              </span>
              <span className="text-[11px] text-charcoal-muted font-light">
                Click any suite to preview
              </span>
            </div>

            {availableRooms.length === 0 ? (
              <div className="p-8 bg-cream border border-[#E9E4DB] rounded-3xl text-center space-y-3">
                <p className="text-sm text-charcoal-muted">
                  No rooms match the selected guest count or filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('All')
                    setAdults(2)
                    setChildren(0)
                  }}
                  className="px-4 py-2 bg-forest text-cream text-xs uppercase tracking-wider rounded-full font-medium"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              availableRooms.map((room) => {
                const isSelected = room.id === selectedRoom.id
                const roomPrice = getRoomPrice(room)
                const roomTotal = roomPrice * nights
                const roomAvail = availability[room.roomNumber] || availability[room.id]
                const isRoomAvailable = roomAvail?.available !== false

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectRoom(room.id)
                      }
                    }}
                    className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer text-left group ${
                      isSelected
                        ? 'bg-cream border-forest ring-2 ring-forest/20 shadow-warm-lg scale-[1.01]'
                        : 'bg-cream/70 hover:bg-cream border-[#E9E4DB] hover:border-forest/40 shadow-sm hover:shadow-warm'
                    }`}
                  >
                    {/* Active Selected Marker Pill */}
                    {isSelected && (
                      <div className="absolute -top-3 right-4 sm:right-6 px-3 py-0.5 bg-forest text-cream text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full shadow-sm flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-terracotta-light" />
                        <span className="hidden lg:inline">Previewing on Right</span>
                        <span className="lg:hidden">Selected · View Details Below</span>
                      </div>
                    )}

                    {!isRoomAvailable && (
                      <div className="absolute -top-3 left-4 sm:left-6 px-2.5 py-0.5 bg-red-800 text-red-100 text-[9px] uppercase font-mono tracking-wider font-bold rounded-full shadow-sm">
                        Booked for Dates
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Room Thumbnail Image */}
                      <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-[#E9E4DB] bg-ivory">
                        <img
                          src={room.previewImages.thumbnail}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-forest-dark/85 backdrop-blur-sm text-cream text-[10px] font-mono rounded-full font-medium">
                          {room.roomNumber}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-emerald-300 text-[9px] font-mono rounded-full flex items-center gap-1 border border-white/20">
                          <Compass className="w-2.5 h-2.5 text-emerald-400" />
                          <span>360° Tour</span>
                        </span>
                      </div>

                      {/* Room Info */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between h-full space-y-2 w-full">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-sage font-semibold">
                              {room.category}
                            </span>
                            <span className="text-charcoal-muted text-[10px]">·</span>
                            <span className="text-[10px] text-charcoal-muted">
                              {room.floor.split('—')[0]}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg sm:text-xl text-forest font-semibold leading-snug group-hover:text-forest-dark transition-colors">
                            {room.name}
                          </h3>

                          {/* Quick Specs */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-muted font-light mt-1">
                            <span>{room.area} m²</span>
                            <span>·</span>
                            <span>Up to {room.guestCapacity} Guests</span>
                            <span>·</span>
                            <span className="truncate">{room.bedType.split('(')[0]}</span>
                          </div>
                        </div>

                        {/* Inclusions */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 bg-ivory border border-[#E9E4DB] text-[10px] text-charcoal-muted rounded-full">
                            Breakfast Included
                          </span>
                          <span className="px-2 py-0.5 bg-ivory border border-[#E9E4DB] text-[10px] text-emerald-700 font-medium rounded-full">
                            Free Cancellation
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Strip & Action Button */}
                    <div className="mt-4 pt-3 border-t border-[#E9E4DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-charcoal-muted font-mono">
                          Tariff Rate
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif text-lg sm:text-xl font-bold text-forest">
                            ₹{roomPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-charcoal-muted">/ night</span>
                        </div>
                        {nights > 1 && (
                          <span className="text-[10px] text-charcoal-muted block">
                            Total: ₹{roomTotal.toLocaleString('en-IN')} for {nights} nights
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 w-full sm:w-auto min-h-[44px] text-xs uppercase tracking-wider font-semibold rounded-full transition-all ${
                            !isRoomAvailable
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isSelected
                                ? 'bg-forest text-cream shadow-sm'
                                : 'bg-ivory text-forest hover:bg-forest/10 border border-[#E9E4DB]'
                          }`}
                        >
                          <span>
                            {!isRoomAvailable
                              ? 'Unavailable'
                              : isSelected
                                ? '360° & Preview Active'
                                : 'Select Room'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE LIVE PREVIEW ================= */}
          <div id="room-preview-panel" className="lg:col-span-7 lg:sticky lg:top-24 scroll-mt-24 w-full min-w-0">
            <div className="bg-cream border border-[#E9E4DB] rounded-3xl overflow-hidden shadow-warm-lg space-y-6 p-4 sm:p-6">
              {/* Header Preview Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9E4DB] pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2.5 py-0.5 bg-forest/10 text-forest text-[10px] font-mono uppercase tracking-wider font-semibold rounded-full">
                      Room {selectedRoom.roomNumber}
                    </span>
                    <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[10px] uppercase tracking-wider font-semibold rounded-full">
                      {selectedRoom.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      Available for {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-forest font-semibold mt-1">
                    {selectedRoom.name}
                  </h3>
                  <p className="text-xs text-charcoal-muted font-light mt-0.5">
                    {selectedRoom.viewType} · {selectedRoom.floor}
                  </p>
                </div>

                {/* View Mode Toggle Switcher: 360° Virtual Tour vs Photo Preview */}
                <div className="flex items-center gap-1.5 p-1 bg-ivory rounded-full border border-[#E9E4DB] shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('360')}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 min-h-[38px] rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex-1 sm:flex-initial ${
                      previewViewMode === '360'
                        ? 'bg-forest text-cream shadow-sm'
                        : 'text-charcoal-muted hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>360° Tour</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('photo')}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 min-h-[38px] rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex-1 sm:flex-initial ${
                      previewViewMode === 'photo'
                        ? 'bg-forest text-cream shadow-sm'
                        : 'text-charcoal-muted hover:text-forest hover:bg-cream/50'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photos</span>
                  </button>
                </div>
              </div>

              {/* Main Visual Display Stage: 360° Equirectangular Sphere OR High-Res Photo */}
              <div className="space-y-4">
                {previewViewMode === '360' ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E9E4DB] shadow-warm bg-black">
                    <PanoramaViewer
                      key={`${selectedRoom.id}-${selectedSpaceKey}`}
                      config={activeSpace.panorama}
                      spaceTitle={activeSpace.title}
                      roomNumber={selectedRoom.roomNumber}
                      onNavigateSpace={(targetSpaceId) => {
                        if (selectedRoom.spaces[targetSpaceId]) {
                          setSelectedSpaceKey(targetSpaceId)
                          setUserSelectedImage(null)
                        }
                      }}
                      onReturnToPhoto={() => setPreviewViewMode('photo')}
                      hideHotspotList={true}
                      viewportHeightClass="aspect-[16/10] min-h-[280px] sm:min-h-[380px] lg:min-h-[440px]"
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#E9E4DB] bg-ivory group shadow-warm">
                    <img
                      src={userSelectedImage || previewImage}
                      alt={`${selectedRoom.name} - ${activeSpace?.title || 'Preview'}`}
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent pointer-events-none" />

                    {/* Active Space Caption Badge & 360 Launch Button */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-cream pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-serif font-medium drop-shadow-md">
                          {activeSpace?.title || selectedRoom.name}
                        </span>
                        {activeSpace?.area && (
                          <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                            {activeSpace.area} m²
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewViewMode('360')}
                        className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream/95 hover:bg-white text-forest font-semibold rounded-full text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-forest" />
                        <span>Explore 360°</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Space Selector Tabs for Active Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-mono tracking-wider text-sage font-semibold">
                      Dedicated Spaces ({currentRoomSpaces.length})
                    </span>
                    {previewViewMode === '360' ? (
                      <span className="text-[10px] font-mono text-terracotta flex items-center gap-1">
                        <Move className="w-3 h-3 text-terracotta animate-pulse" />
                        <span>Drag in 360° to look around</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewViewMode('360')}
                        className="text-[10px] font-mono text-terracotta hover:underline flex items-center gap-1"
                      >
                        <Compass className="w-3 h-3 text-terracotta" />
                        <span>Switch to 360° view</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentRoomSpaces.map(({ key, space }) => {
                      const isActive = selectedSpaceKey === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedSpaceKey(key)
                            setUserSelectedImage(null)
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all border min-h-[38px] ${
                            isActive
                              ? 'bg-forest text-cream font-semibold border-forest shadow-sm ring-1 ring-forest/30'
                              : 'bg-ivory text-charcoal-muted hover:text-forest border-[#E9E4DB] hover:bg-cream'
                          }`}
                        >
                          <span className="capitalize">{space.type}</span>
                          {space.area && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isActive ? 'bg-cream/20 text-cream' : 'bg-black/5 text-charcoal-muted'
                              }`}
                            >
                              {space.area}m²
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Perspective Photos Thumbnail Filmstrip */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-charcoal-muted font-semibold">
                      Perspective Photography ({currentGalleryPhotos.length})
                    </span>
                    <span className="text-[10px] text-charcoal-muted/80">
                      Click any photo to preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                    {currentGalleryPhotos.map((imgSrc, idx) => {
                      const isSelectedPhoto =
                        previewViewMode === 'photo' &&
                        (userSelectedImage === imgSrc || (!userSelectedImage && idx === 0))
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setUserSelectedImage(imgSrc)
                            setPreviewViewMode('photo')
                          }}
                          aria-label={`View perspective photo ${idx + 1}`}
                          className={`relative aspect-[4/3] w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border transition-all ${
                            isSelectedPhoto
                              ? 'border-forest ring-2 ring-forest/40 scale-105 shadow-sm'
                              : 'border-[#E9E4DB] opacity-75 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                        >
                          <img
                            src={imgSrc}
                            alt={`${selectedRoom.name} photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Room Metric Specifications */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-3.5 bg-ivory rounded-2xl border border-[#E9E4DB] text-[11px] sm:text-xs">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase text-charcoal-muted flex items-center gap-1 mb-0.5">
                    <Maximize2 className="w-3 h-3 text-sage" />
                    Floor Area
                  </span>
                  <span className="font-semibold text-forest">
                    {formatArea(selectedRoom.area)}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase text-charcoal-muted flex items-center gap-1 mb-0.5">
                    <Users className="w-3 h-3 text-sage" />
                    Max Guests
                  </span>
                  <span className="font-semibold text-forest">
                    {selectedRoom.guestCapacity} Guests
                  </span>
                </div>

                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase text-charcoal-muted flex items-center gap-1 mb-0.5">
                    <Bed className="w-3 h-3 text-sage" />
                    Bedding
                  </span>
                  <span className="font-semibold text-forest truncate block">
                    {selectedRoom.bedType.split('(')[0]}
                  </span>
                </div>
              </div>

              {/* Architectural Description */}
              <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed">
                {selectedRoom.description}
              </p>

              {/* Highlighted Amenities */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-mono tracking-wider text-sage font-semibold block">
                  Included Amenities & Privileges
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-charcoal">
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Wifi className="w-3.5 h-3.5 text-forest" />
                    <span>Wi-Fi 6 Gigabit</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Coffee className="w-3.5 h-3.5 text-forest" />
                    <span>Artisan Espresso Bar</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Bath className="w-3.5 h-3.5 text-forest" />
                    <span>Monolithic Soaking Tub</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Wind className="w-3.5 h-3.5 text-forest" />
                    <span>Silent Zoned Climate</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Sparkles className="w-3.5 h-3.5 text-forest" />
                    <span>Aesop Organic Toiletries</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-ivory rounded-xl border border-[#E9E4DB]">
                    <Compass className="w-3.5 h-3.5 text-forest" />
                    <span>Renoos Nature Tour</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Tariff & Cost Calculator Card */}
              <div className="p-5 bg-ivory rounded-2xl border border-[#E9E4DB] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E9E4DB] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sage font-medium block">
                      Live Rate Calculator
                    </span>
                    <h4 className="font-serif text-lg text-forest font-semibold">
                      Tariff & Tax Breakdown
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-terracotta bg-terracotta/10 px-2 py-1 rounded-full font-semibold">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-charcoal">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">
                      Base Tariff (₹{tariffPerNight.toLocaleString('en-IN')} × {nights} nights)
                    </span>
                    <span className="font-medium text-forest">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        <span>Promo Code Discount ({appliedPromo} - 10%)</span>
                      </span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-charcoal-muted">
                    <span>Renoos Eco Conservation Fee</span>
                    <span>₹{conservationFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-charcoal-muted">
                    <span>GST & Hospitality Taxes (18%)</span>
                    <span>₹{taxesAndGst.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[#E9E4DB] flex gap-2">
                    <div className="relative flex-grow">
                      <Tag className="w-3.5 h-3.5 text-sage absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. RENOOS)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-cream border border-[#E9E4DB] rounded-xl text-xs uppercase tracking-wider text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-forest text-cream text-xs uppercase tracking-wider rounded-xl font-medium hover:bg-forest-dark transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {promoError && (
                    <span className="text-[11px] text-red-500 block">{promoError}</span>
                  )}
                  {appliedPromo && (
                    <span className="text-[11px] text-emerald-700 block font-medium">
                      ✓ Promo code {appliedPromo} applied! (10% discount on base rate)
                    </span>
                  )}

                  {/* Grand Total */}
                  <div className="pt-3 border-t border-[#E9E4DB] flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold block">
                        Estimated Grand Total
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        All taxes, levies & breakfast included
                      </span>
                    </div>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Policies & Reassurances */}
                <div className="pt-2 border-t border-[#E9E4DB] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-charcoal-muted">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sage shrink-0" />
                    <span>Free cancellation up to 48 hrs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
                    <span>Pay at Hotel option available</span>
                  </div>
                </div>
              </div>

              {/* Unavailability Conflict Banner */}
              {!isSelectedRoomAvailable && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-semibold block text-red-900">
                      Room {selectedRoom.roomNumber} is Unavailable for Selected Dates
                    </span>
                    <span className="font-light">
                      {selectedConflictingBooking
                        ? `Reserved from ${selectedConflictingBooking.checkInDate} to ${selectedConflictingBooking.checkOutDate}. `
                        : ''}
                      Another guest has already confirmed this suite in the PMS. Please select different dates or pick another suite.
                    </span>
                  </div>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  disabled={!isSelectedRoomAvailable}
                  onClick={() => setIsBookingModalOpen(true)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-4 text-xs sm:text-sm uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all duration-300 ${
                    isSelectedRoomAvailable
                      ? 'bg-forest hover:bg-forest-dark text-cream group'
                      : 'bg-red-950/70 border border-red-500/40 text-red-300 cursor-not-allowed opacity-90'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-cream" />
                  <span>
                    {isSelectedRoomAvailable
                      ? `Proceed to Reserve Room ${selectedRoom.roomNumber}`
                      : `Room ${selectedRoom.roomNumber} Booked (Unavailable)`}
                  </span>
                  {isSelectedRoomAvailable && (
                    <ArrowRight className="w-4 h-4 text-cream transform group-hover:translate-x-1 transition-transform" />
                  )}
                </button>

                <div className="text-center">
                  <span className="text-[11px] text-charcoal-muted font-light">
                    Instant confirmation voucher issued immediately upon reservation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Multi-Step Booking Modal */}
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
        promoCodeApplied={appliedPromo || undefined}
        conservationFee={conservationFee}
        taxesAndGst={taxesAndGst}
        totalAmount={totalAmount}
        onBookingSuccess={(res) => {
          setRecentBooking(res)
          refreshAvailability()
        }}
      />
    </section>
  )
}
