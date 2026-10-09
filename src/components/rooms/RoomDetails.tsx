import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Users,
  Maximize2,
  Bed,
  MapPin,
  Eye,
  Compass,
  ArrowLeft,
  Calendar,
} from 'lucide-react'
import type { Room } from '@/types'
import { SpaceSelector } from './SpaceSelector'
import { AmenityList } from './AmenityList'
import { Gallery } from './Gallery'
import { RoomSwitcher } from './RoomSwitcher'
import { SpaceViewer } from '../spaces'
import { BookingModal } from '../booking/BookingModal'
import { SectionHeader } from '../common/SectionHeader'
import { formatArea } from '@/lib/utils'

interface RoomDetailsProps {
  room: Room
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({ room }) => {
  const [searchParams] = useSearchParams()
  const querySpace = searchParams.get('space')
  const queryMode = searchParams.get('mode') as 'photo' | 'panorama' | 'model3d' | null

  const availableSpaceKeys = Object.keys(room.spaces)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(
    querySpace && room.spaces[querySpace] ? querySpace : null
  )
  const [previousSpaceId, setPreviousSpaceId] = useState<string | null>(null)

  useEffect(() => {
    if (querySpace && room.spaces[querySpace]) {
      setSelectedSpaceId(querySpace)
    }
    if (querySpace || queryMode) {
      const el = document.getElementById('space-exploration-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [querySpace, queryMode, room.spaces])

  // Derived active space: ensure valid space for the current room
  const activeSpaceId =
    selectedSpaceId && room.spaces[selectedSpaceId]
      ? selectedSpaceId
      : availableSpaceKeys[0] || 'bedroom'

  const activeSpace = room.spaces[activeSpaceId] || room.spaces.bedroom

  const handleNavigateSpace = (targetSpaceId: string) => {
    if (room.spaces[targetSpaceId]) {
      setPreviousSpaceId(activeSpaceId)
      setSelectedSpaceId(targetSpaceId)
    }
  }

  // Format price in Indian Rupees (INR)
  const inrPrice = room.pricePerNight || 5200
  const formattedPrice = `₹${inrPrice.toLocaleString('en-IN')}`

  // Booking Modal State & Default Dates (2 nights starting tomorrow)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const { defaultCheckIn, defaultCheckOut } = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 3)
    return {
      defaultCheckIn: tomorrow.toISOString().split('T')[0],
      defaultCheckOut: dayAfter.toISOString().split('T')[0],
    }
  }, [])
  const defaultNights = 2
  const roomSubtotal = inrPrice * defaultNights
  const conservationFee = 500 * defaultNights
  const taxesAndGst = Math.round((roomSubtotal + conservationFee) * 0.12)
  const totalAmount = roomSubtotal + conservationFee + taxesAndGst

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      {/* 1. Large Hero Section */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-end overflow-hidden pb-16 pt-32">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={room.previewImages.hero}
            alt={`${room.name} (${room.roomNumber}) Hero View`}
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = room.previewImages.card
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.85]"
          />
          {/* Subtle cinematic hospitality gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/40 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          {/* Back Button & Breadcrumb Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cream/90 font-medium">
              <Link to="/" className="hover:text-terracotta-light transition-colors">
                Home
              </Link>
              <span className="text-cream/40">/</span>
              <Link to="/rooms" className="hover:text-terracotta-light transition-colors">
                Suites
              </Link>
              <span className="text-cream/40">/</span>
              <span className="text-terracotta-light">Room {room.roomNumber}</span>
            </div>

            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/15 hover:bg-cream/25 text-cream border border-cream/20 text-xs uppercase tracking-wider transition-colors backdrop-blur-sm font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-terracotta-light" />
              <span>Back to All Suites</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 bg-cream/95 backdrop-blur-md border border-[#E9E4DB] text-forest font-mono text-xs tracking-wider uppercase rounded-full font-semibold shadow-sm">
                  ROOM {room.roomNumber}
                </span>
                <span className="px-3.5 py-1 bg-forest/85 backdrop-blur-md text-cream text-xs uppercase tracking-wider rounded-full font-medium">
                  {room.category}
                </span>
                {room.badges?.map((badge, idx) => (
                  <span
                    key={idx}
                    className="hidden sm:inline-block px-3 py-1 bg-black/40 backdrop-blur-md text-cream/80 text-xs tracking-wider rounded-full border border-white/10"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Title & Tagline */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream font-normal leading-tight tracking-tight drop-shadow-sm">
                {room.name}
              </h1>

              <p className="text-base sm:text-lg text-cream/85 font-light max-w-2xl leading-relaxed">
                {room.tagline}
              </p>

              {/* Header Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-cream/80 font-light">
                <span className="flex items-center gap-1.5 font-medium">
                  <Maximize2 className="w-3.5 h-3.5 text-terracotta-light" />
                  {formatArea(room.area)}
                </span>
                <span className="text-cream/30">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-terracotta-light" />
                  {room.guestCapacity} Guests
                </span>
                <span className="text-cream/30">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Bed className="w-3.5 h-3.5 text-terracotta-light" />
                  {room.bedType.split('(')[0]}
                </span>
                <span className="text-cream/30">·</span>
                <span className="text-cream/70 font-mono text-[11px]">{room.viewType}</span>
              </div>
            </div>

            {/* Price & Action Box */}
            <div className="bg-cream/95 backdrop-blur-md border border-[#E9E4DB] p-6 rounded-3xl shadow-warm-lg space-y-4 shrink-0 max-w-sm w-full">
              {room.pricePerNight && (
                <div className="flex items-baseline justify-between border-b border-[#E9E4DB] pb-4">
                  <span className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
                    Tariff
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-3xl text-forest font-semibold">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-charcoal-muted"> / night</span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-terracotta hover:bg-terracotta-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm min-h-[44px] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-cream" />
                  <span>Reserve Suite Now</span>
                </button>

                <a
                  href="#space-exploration-section"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-forest text-cream hover:bg-forest-dark text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm min-h-[42px]"
                >
                  <Compass className="w-4 h-4 text-cream" />
                  <span>Explore Virtual Tour</span>
                </a>

                <a
                  href="#suite-gallery"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-ivory hover:bg-white text-forest text-xs uppercase tracking-wider font-medium transition-all duration-300 rounded-full border border-[#E9E4DB] shadow-sm min-h-[40px]"
                >
                  <Eye className="w-3.5 h-3.5 text-sage" />
                  <span>View Photo Gallery</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Specifications Bar */}
      <section className="border-y border-[#E9E4DB] bg-cream py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 text-charcoal">
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1.5 mb-1 font-medium">
                <Maximize2 className="w-3.5 h-3.5 text-sage shrink-0" />
                Floor Area
              </span>
              <span className="text-sm font-semibold text-forest block truncate">{formatArea(room.area)}</span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1.5 mb-1 font-medium">
                <Users className="w-3.5 h-3.5 text-sage shrink-0" />
                Occupancy
              </span>
              <span className="text-sm font-semibold text-forest block truncate">{room.guestCapacity} Guests</span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1.5 mb-1 font-medium">
                <Bed className="w-3.5 h-3.5 text-sage shrink-0" />
                Bedding
              </span>
              <span className="text-sm font-semibold text-forest truncate block">
                {room.bedType}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1.5 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-sage shrink-0" />
                Location
              </span>
              <span className="text-sm font-semibold text-forest truncate block">{room.floor}</span>
            </div>

            <div className="min-w-0 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1.5 mb-1 font-medium">
                <Eye className="w-3.5 h-3.5 text-sage shrink-0" />
                Outlook
              </span>
              <span className="text-sm font-semibold text-forest truncate block">{room.viewType}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Architectural Narrative / Room Description */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs uppercase tracking-wider text-terracotta font-medium">
              Architectural Concept
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest font-normal leading-tight">
              A Private Sanctuary of Restorative Silence
            </h2>
            <div className="w-12 h-0.5 bg-terracotta mt-4" />
          </div>

          <div className="lg:col-span-7 space-y-6 text-charcoal-muted font-light text-base md:text-lg leading-relaxed">
            <p>{room.longDescription}</p>
            <p className="text-sm text-charcoal-muted/80">
              Explore each space within Room {room.roomNumber} through high-resolution photography, 360° virtual tours, and space navigation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Space Exploration Section */}
      <section
        id="space-exploration-section"
        className="py-20 bg-cream/50 border-y border-[#E9E4DB] scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            eyebrow="Space Exploration"
            title="Explore Bedroom & Bathroom"
            subtitle={`Navigate through the dedicated spaces of Room ${room.roomNumber}. Experience high-resolution photography, immersive 360° virtual tours, and 3D spatial architecture.`}
            align="center"
          />

          {/* Space Selector Tabs */}
          <SpaceSelector
            spaces={room.spaces}
            activeSpaceId={activeSpaceId}
            onSelectSpace={(id) => {
              if (id !== activeSpaceId) {
                setPreviousSpaceId(activeSpaceId)
                setSelectedSpaceId(id)
              }
            }}
          />

          {/* Space Viewer Component */}
          <SpaceViewer
            key={`${room.roomNumber}-${activeSpaceId}`}
            space={activeSpace}
            roomNumber={room.roomNumber}
            initialMode={queryMode || undefined}
            previousSpaceTitle={previousSpaceId ? room.spaces[previousSpaceId]?.title : undefined}
            onReturnPreviousSpace={previousSpaceId ? () => handleNavigateSpace(previousSpaceId) : undefined}
            onNavigateSpace={handleNavigateSpace}
          />
        </div>
      </section>

      {/* 5. Amenities Section */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Curated Comforts"
          title="Bespoke Room Amenities"
          subtitle="Every convenience and tactile detail has been considered to ensure effortless relaxation and flawless connectivity."
          align="center"
        />

        <AmenityList amenities={room.amenities} />
      </section>

      {/* 6. Photo Gallery */}
      <section id="suite-gallery" className="py-20 bg-cream/50 border-t border-[#E9E4DB] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            eyebrow="Visual Portfolio"
            title={`Room ${room.roomNumber} Photography`}
            subtitle="Click on any photograph to view high-resolution imagery and architectural detail notes."
            align="center"
          />

          <Gallery images={room.previewImages.gallery} />
        </div>
      </section>

      {/* 7. Room Switcher & Navigation Footer */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-terracotta font-medium text-center">
            Continue Your Journey
          </div>
          <RoomSwitcher currentRoomId={room.id} />
        </div>
      </section>

      {/* 8. Reservation Modal */}
      <BookingModal
        room={room}
        checkInDate={defaultCheckIn}
        checkOutDate={defaultCheckOut}
        adults={2}
        children={0}
        nights={defaultNights}
        tariffPerNight={inrPrice}
        discount={0}
        conservationFee={conservationFee}
        taxesAndGst={taxesAndGst}
        totalAmount={totalAmount}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  )
}
