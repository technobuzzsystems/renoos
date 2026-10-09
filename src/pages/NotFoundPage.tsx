import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory text-charcoal flex items-center justify-center p-6 pt-32">
      <div className="max-w-lg w-full text-center space-y-6 bg-cream border border-[#E9E4DB] p-10 rounded-3xl shadow-warm">
        <span className="font-mono text-xs tracking-wider text-terracotta uppercase block font-semibold">
          404 · Destination Unreachable
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-forest font-normal">
          Beyond Renoos Hotel
        </h1>
        <p className="text-charcoal-muted text-sm font-light leading-relaxed">
          The horizon you seek has moved or does not exist. Allow our concierge to guide you back to our curated suites.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-forest text-cream text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-forest-dark transition-colors shadow-warm"
          >
            <ArrowLeft className="w-4 h-4 text-cream" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/rooms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ivory hover:bg-white text-forest border border-[#E9E4DB] text-xs uppercase tracking-wider font-semibold rounded-full transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4 text-forest" />
            <span>Explore Rooms</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
