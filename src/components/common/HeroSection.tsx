import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Eye, Sparkles, CalendarCheck } from 'lucide-react'

export const HeroSection: React.FC = () => {
  const handleScrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('book-rooms')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-ivory pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 animate-fade-in">
        {/* Large Rounded Primary Visual Container (Hero Image on Top) */}
        <div className="relative aspect-[16/10] sm:aspect-[21/10] lg:aspect-[2.4/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-warm-lg border border-[#E9E4DB] group bg-cream">
          <img
            src="/images/hero.jpg"
            alt="SB Farm sanctuary grounds and pavilion lounge"
            fetchPriority="high"
            width={1920}
            height={1080}
            className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
          />

          {/* Floating Information Card */}
          <div className="absolute bottom-2 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 flex items-center justify-between gap-2 sm:gap-4 bg-cream/95 backdrop-blur-md border border-[#E9E4DB] p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-warm max-w-full sm:max-w-md">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2.5 rounded-full bg-forest text-cream shrink-0">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider text-sage font-medium block">
                  FEATURED EXPERIENCE
                </span>
                <p className="text-[11px] sm:text-sm font-serif text-forest font-medium leading-snug truncate">
                  Garden · 360° Virtual Tour
                </p>
                <p className="hidden md:block text-[11px] text-charcoal-muted font-light mt-0.5 line-clamp-1">
                  Explore the Garden in an immersive 360° experience.
                </p>
              </div>
            </div>

            <Link
              to="/rooms/201?space=garden&mode=panorama#space-exploration-section"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-forest hover:bg-forest-dark text-cream text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm transition-all duration-300 shrink-0"
            >
              <span>Explore</span>
              <span className="hidden sm:inline">Garden</span>
            </Link>
          </div>
        </div>

        {/* Editorial Header Section Below Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end pt-2">
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta text-[11px] sm:text-xs tracking-wider uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SB Farm · Modern Farm Sanctuary</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-forest font-normal leading-[1.08] tracking-tight">
              Stay Inside the SB Farm 360° Experience
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-5 lg:pb-2">
            <p className="text-charcoal-muted text-sm sm:text-base md:text-lg font-light leading-relaxed">
              Explore every space before you arrive — through high-resolution photography, spherical 360° views, and interactive spatial experiences.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <a
                href="#book-rooms"
                onClick={handleScrollToBooking}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 min-h-[44px] bg-terracotta hover:bg-terracotta-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm text-center"
              >
                <CalendarCheck className="w-4 h-4 text-cream" />
                <span>Book Rooms</span>
              </a>

              <a
                href="#rooms-showcase"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 min-h-[44px] bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-sm text-center"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Rooms</span>
              </a>

              <Link
                to="/rooms/203"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 min-h-[44px] bg-cream hover:bg-ivory text-forest border border-[#E9E4DB] text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-sm text-center"
              >
                <Eye className="w-4 h-4 text-terracotta" />
                <span>Enter Virtual Tour</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Editorial Metrics / Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-[#E9E4DB] text-charcoal">
          <div>
            <span className="font-serif text-xl sm:text-2xl text-forest font-normal block">
              3 Suites
            </span>
            <span className="text-[11px] sm:text-xs text-charcoal-muted uppercase tracking-wider font-light">
              Bespoke Sanctuaries
            </span>
          </div>

          <div>
            <span className="font-serif text-xl sm:text-2xl text-forest font-normal block">
              360° Spherical
            </span>
            <span className="text-[11px] sm:text-xs text-charcoal-muted uppercase tracking-wider font-light">
              Interactive Room Tours
            </span>
          </div>

          <div>
            <span className="font-serif text-xl sm:text-2xl text-forest font-normal block">
              3 Living Spaces
            </span>
            <span className="text-[11px] sm:text-xs text-charcoal-muted uppercase tracking-wider font-light">
              Bedroom, Kitchen, Washroom
            </span>
          </div>

          <div>
            <span className="font-serif text-xl sm:text-2xl text-forest font-normal block">
              3D Spatial View
            </span>
            <span className="text-[11px] sm:text-xs text-charcoal-muted uppercase tracking-wider font-light">
              Architectural Walkthrough
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
