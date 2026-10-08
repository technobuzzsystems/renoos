import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Sparkles, ArrowRight } from 'lucide-react'

export const CTASection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-forest text-cream border-t border-[#E9E4DB]">
      {/* Subtle warm ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(185,111,82,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-terracotta/40 bg-terracotta/15 text-terracotta-light text-xs tracking-wider uppercase font-medium">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-light" />
          <span>Interactive Architectural Showcase</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream font-normal leading-tight tracking-tight max-w-3xl mx-auto">
          Experience the Space Before You Arrive
        </h2>

        <p className="mt-6 text-base sm:text-lg text-cream/80 font-light max-w-2xl mx-auto leading-relaxed">
          Step inside our curated collection of deluxe rooms, premium accommodations, and executive suites. Explore bedrooms, artisan kitchenettes, and marble wet-rooms in unhurried high-definition detail.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/rooms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-cream text-forest hover:bg-ivory text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
          >
            <Compass className="w-4 h-4 text-forest" />
            <span>Explore Rooms</span>
          </Link>

          <Link
            to="/rooms/203"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-cream/30 hover:border-cream text-cream hover:bg-cream/10 text-xs uppercase tracking-wider font-medium transition-all duration-300 rounded-full"
          >
            <span>Start Virtual Tour</span>
            <ArrowRight className="w-4 h-4 text-terracotta-light" />
          </Link>
        </div>
      </div>
    </section>
  )
}
