import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Mail, MapPin, Phone, ArrowUp } from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#EFEAE1] border-t border-[#DFD8CB] pt-20 pb-12 text-charcoal-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl text-forest tracking-wider font-normal group-hover:text-forest-dark transition-colors">
                RENOOS HOTEL
              </span>
              <span className="block text-[11px] uppercase tracking-widest text-terracotta mt-1 font-medium">
                Luxury Nature Sanctuary · India
              </span>
            </Link>
            <p className="text-charcoal-muted text-sm leading-relaxed max-w-sm font-light">
              An architectural sanctuary designed for contemplative luxury, combining monolithic stone forms, handcrafted wood millwork, and restorative hospitality.
            </p>
            <div className="pt-2 flex items-center gap-2.5 text-xs text-forest">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-medium">Immersive 360° Virtual Tour Experience</span>
            </div>
          </div>

          {/* Rooms Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-forest font-semibold mb-4">
              Suites & Rooms
            </h3>
            <ul className="space-y-3">
              {ROOMS_DATA.map((room) => (
                <li key={room.id}>
                  <Link
                    to={`/rooms/${room.roomNumber}`}
                    className="text-charcoal-muted hover:text-forest transition-colors text-xs flex items-center justify-between group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{room.roomNumber} — {room.name}</span>
                    <span className="text-[10px] text-charcoal-muted/70 group-hover:text-terracotta font-mono">
                      {room.area} m²
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  to="/rooms"
                  className="text-terracotta text-xs hover:underline flex items-center gap-1.5 font-medium"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Compare All Accommodations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Spaces Exploration */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-forest font-semibold mb-4">
              Spaces Explored
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <span className="text-charcoal font-medium">Master Bedrooms</span>
                <span className="block text-[11px] text-charcoal-muted mt-0.5">Acoustic suites & organic linen</span>
              </li>
              <li>
                <span className="text-charcoal font-medium">Private Balconies & Terraces</span>
                <span className="block text-[11px] text-charcoal-muted mt-0.5">Scenic mountain vistas & fresh alpine air</span>
              </li>
              <li>
                <span className="text-charcoal font-medium">Spa Marble Bathrooms</span>
                <span className="block text-[11px] text-charcoal-muted mt-0.5">Freestanding stone baths & rain showers</span>
              </li>
            </ul>
          </div>

          {/* Concierge & Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-forest font-semibold mb-4">
              Hotel Concierge
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <span className="text-charcoal-muted">Renoos Hotel, Foothills of the Himalayas, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-terracotta shrink-0" />
                <span className="text-charcoal-muted">+91 (800) 555-RENOOS (Demo)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-terracotta shrink-0" />
                <span className="text-charcoal-muted">concierge@renooshotel.demo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#DFD8CB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted/80 text-center sm:text-left">
          <p>© 2026 Renoos Hotel · India. Designed for 360° Virtual Tour Exploration.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="text-charcoal-muted/60 hidden sm:inline">360° Interactive Exploration</span>
            <Link
              to="/admin"
              className="text-forest hover:text-terracotta transition-colors font-medium underline underline-offset-4 flex items-center gap-1.5"
            >
              <span>Hotel Staff & PMS Admin</span>
            </Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-cream/50 text-forest hover:text-terracotta font-medium transition-colors focus:outline-none min-h-[36px]"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
