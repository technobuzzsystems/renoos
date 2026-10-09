import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroSection, SectionHeader, CTASection } from '@/components/common'
import { RoomGrid } from '@/components/rooms'
import { BookingBar, BookRoomsSection } from '@/components/booking'
import { ROOMS_DATA } from '@/data/rooms'
import { Compass, ArrowRight, Sparkles } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [checkInDate, setCheckInDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const after = new Date()
    after.setDate(after.getDate() + 3)
    return after.toISOString().split('T')[0]
  })
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const handleBookingSearchChange = (updates: {
    checkInDate?: string
    checkOutDate?: string
    adults?: number
    children?: number
  }) => {
    if (updates.checkInDate) setCheckInDate(updates.checkInDate)
    if (updates.checkOutDate) setCheckOutDate(updates.checkOutDate)
    if (updates.adults !== undefined) setAdults(updates.adults)
    if (updates.children !== undefined) setChildren(updates.children)
  }

  const handleScrollToBooking = () => {
    const el = document.getElementById('book-rooms')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-ivory text-charcoal">
      {/* 1. Warm Editorial Hotel Hero Section */}
      <HeroSection />

      {/* 2. Interactive Quick Booking Search Bar */}
      <BookingBar
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        adults={adults}
        children={children}
        onSearchChange={handleBookingSearchChange}
        onOpenBooking={handleScrollToBooking}
      />

      {/* Internal anchor for navigation links */}
      <div id="hotel-intro" className="sr-only" aria-hidden="true" />

      {/* 3. Real-World Hotel Booking System (Master-Detail: Available Rooms Left, Live Preview Right) */}
      <BookRoomsSection
        id="book-rooms"
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
        initialAdults={adults}
        initialChildren={children}
      />

      {/* 3. Featured Accommodations Section (All 3 Rooms) */}
      <section id="rooms-showcase" className="py-24 md:py-32 bg-cream/60 border-y border-[#E9E4DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <SectionHeader
            eyebrow="Accommodations"
            title="Curated Rooms & Suites"
            subtitle="Explore our three meticulously appointed residences. Each room features dedicated master bedrooms and spa bathrooms ready for virtual exploration."
            align="center"
          />

          {/* Three Room Cards */}
          <RoomGrid rooms={ROOMS_DATA} priorityFirst={false} />

          <div className="text-center pt-6">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
            >
              <Compass className="w-4 h-4 text-cream" />
              <span>Compare All 3 Accommodations</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Virtual-Tour Experience Section */}
      <section id="virtual-tour" className="py-24 md:py-32 bg-forest text-cream relative overflow-hidden">
        {/* Subtle warm ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-terracotta/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Teaser Mockup */}
            <div className="lg:col-span-7">
              <div className="relative group rounded-3xl overflow-hidden border border-forest-light/30 bg-forest-dark/80 shadow-warm-lg">
                {/* Header status bar */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-forest-dark/95 border-b border-forest-light/20 text-xs text-cream/70">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[11px] text-cream/90">Room 203 — Master Bedroom 360°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tracking-wider uppercase font-mono text-terracotta-light font-semibold">360° Spherical Active</span>
                  </div>
                </div>

                {/* Tour Canvas Image with Simulated Hotspots */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src="/IMG/203/BEDROOM1.avif"
                    alt="Room 203 360 virtual tour bedroom preview"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent pointer-events-none" />

                  {/* Simulated Interactive Hotspot Pin (Bathroom) */}
                  <div className="absolute top-[52%] right-[24%] translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-8 h-8 rounded-full bg-terracotta/40 animate-ping delay-300" />
                      <div className="w-6 h-6 rounded-full bg-terracotta text-cream flex items-center justify-center shadow-md border border-cream">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <span className="hidden sm:inline-block absolute right-full mr-2.5 px-2.5 py-1 bg-forest/90 backdrop-blur-md border border-cream/20 text-[10px] uppercase font-mono tracking-wider text-cream rounded-full whitespace-nowrap shadow-warm">
                        ← Marble Spa Bathroom
                      </span>
                    </div>
                  </div>

                  {/* Bottom Control Overlay Pill */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between text-xs text-cream/90 bg-forest-dark/85 backdrop-blur-md border border-cream/15 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-[11px] font-light text-cream/70">Spaces:</span>
                      <span className="px-2 py-0.5 rounded-full bg-terracotta/25 text-terracotta-light font-mono text-[9px] sm:text-[10px] font-medium">Bedroom</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-cream/80 font-mono text-[9px] sm:text-[10px]">Bathroom</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-terracotta-light uppercase tracking-wider hidden sm:inline-block font-semibold">Full Tour Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Feature Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-terracotta-light font-medium">
                <span className="w-5 h-px bg-current opacity-60 inline-block" />
                <span>Featured Experience</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream font-normal leading-tight">
                Seamless 360° Spherical Suite Navigation
              </h2>

              <p className="text-cream/80 font-light text-base leading-relaxed">
                Step beyond static photography. Our virtual suite tour immerses you directly inside Room 203, allowing you to freely look in any direction with complete 360° horizontal and vertical freedom.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta-light mt-2 flex-shrink-0" />
                  <p className="text-xs text-cream/80 font-light leading-relaxed">
                    <strong className="text-cream font-medium">Spatial Hotspot Transit:</strong> Click integrated door and corridor hotspots to transition fluidly between Bedroom and Bathroom.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta-light mt-2 flex-shrink-0" />
                  <p className="text-xs text-cream/80 font-light leading-relaxed">
                    <strong className="text-cream font-medium">Equirectangular Precision:</strong> Ultra-high-resolution photographic captures with inertia damping and mouse/touch controls.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta-light mt-2 flex-shrink-0" />
                  <p className="text-xs text-cream/80 font-light leading-relaxed">
                    <strong className="text-cream font-medium">Full Room Autonomy:</strong> Fully enabled across Rooms 201, 202, and 203 for comprehensive guest comparison.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/rooms/203"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cream text-forest hover:bg-ivory text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
                >
                  <Compass className="w-4 h-4 text-forest" />
                  <span>Launch Room 203 Virtual Tour</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3D Architectural Spatial Preview Teaser */}
      <section id="preview-3d" className="py-24 md:py-32 bg-cream/40 border-t border-[#E9E4DB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Editorial Content */}
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-terracotta font-medium">
                <span className="w-5 h-px bg-current opacity-60 inline-block" />
                <span>Future Innovation</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-forest font-normal leading-tight">
                Interactive 3D Walkthrough Coming Soon
              </h2>

              <p className="text-charcoal-muted font-light text-base leading-relaxed">
                We are developing true-to-scale 3D models for all suites. Once available, you will be able to inspect room volumes, architectural layouts, and perspectives in full interactive 3D.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 bg-cream rounded-2xl border border-[#E9E4DB]">
                  <div className="font-mono text-terracotta text-xs uppercase tracking-wider mb-1 font-semibold">True-to-Scale</div>
                  <p className="text-charcoal-muted text-[11px] leading-relaxed">Architectural proportions and layouts modeled after real suite plans.</p>
                </div>
                <div className="p-4 bg-cream rounded-2xl border border-[#E9E4DB]">
                  <div className="font-mono text-terracotta text-xs uppercase tracking-wider mb-1 font-semibold">Orbit Controls</div>
                  <p className="text-charcoal-muted text-[11px] leading-relaxed">Interactive rotation and zoom navigation on desktop and mobile.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/rooms/203"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
                >
                  <span>Preview 3D Mode</span>
                  <ArrowRight className="w-4 h-4 text-cream" />
                </Link>
              </div>
            </div>

            {/* 3D Blueprint / Client-Facing Preview Card */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative p-8 rounded-3xl bg-cream border border-[#E9E4DB] shadow-warm-lg">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#23483a08_1px,transparent_1px),linear-gradient(to_bottom,#23483a08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-3xl" />

                <div className="relative space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E9E4DB] pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block font-semibold">Suite Spatial Architecture</span>
                      <h4 className="font-serif text-xl text-forest">Interactive 3D Walkthrough</h4>
                    </div>
                    <span className="px-3 py-1 bg-terracotta/10 text-terracotta border border-terracotta/30 text-[10px] font-mono uppercase tracking-wider rounded-full font-semibold">
                      Coming Soon
                    </span>
                  </div>

                  <p className="text-sm text-charcoal-muted font-light leading-relaxed">
                    Interactive 3D spatial models are currently being authored for each suite. In the meantime, explore our suites through high-resolution photography and 360° virtual tours.
                  </p>

                  <div className="p-4 bg-ivory rounded-2xl border border-[#E9E4DB] space-y-2 text-xs text-charcoal-muted">
                    <div className="flex items-center justify-between">
                      <span>Available Accommodations:</span>
                      <span className="text-forest font-medium">Room 201, 202, 203</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Exploration Modes:</span>
                      <span className="text-terracotta font-medium">Photography · 360° Tour · 3D</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal anchor for experience section */}
      <div id="hotel-experience" className="sr-only" aria-hidden="true" />

      {/* 7. Call-to-action Section */}
      <CTASection />
    </div>
  )
}
