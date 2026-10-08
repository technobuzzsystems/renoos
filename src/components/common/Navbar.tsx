import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass, ChevronDown, CalendarCheck } from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [roomsDropdownOpen, setRoomsDropdownOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu and dropdown on route change during render
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setMobileMenuOpen(false)
    setRoomsDropdownOpen(false)
  }

  const handleBookRoomsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      const el = document.getElementById('book-rooms')
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
        setMobileMenuOpen(false)
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FBF8F1]/95 backdrop-blur-md py-3.5 border-b border-[#E9E4DB] shadow-warm'
          : 'bg-[#F5F0E6]/90 backdrop-blur-sm py-5 border-b border-[#E9E4DB]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo - SB Farm Wordmark */}
          <Link
            to="/"
            className="group flex flex-col items-start focus:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            aria-label="SB Farm Homepage"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-forest font-semibold group-hover:text-forest-dark transition-colors duration-300">
              SB Farm
            </span>
            <span className="text-[10px] tracking-widest uppercase text-sage font-medium">
              Farm Sanctuary · India
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {/* Direct Book Rooms link */}
            <a
              href="/#book-rooms"
              onClick={handleBookRoomsClick}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-terracotta hover:text-terracotta-dark transition-colors duration-200 py-1"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-terracotta" />
              <span>Book Rooms</span>
            </a>

            {/* Rooms Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setRoomsDropdownOpen(true)}
              onMouseLeave={() => setRoomsDropdownOpen(false)}
            >
              <Link
                to="/rooms"
                className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium transition-colors duration-200 py-1 ${
                  location.pathname === '/rooms'
                    ? 'text-forest font-semibold border-b-2 border-forest'
                    : 'text-charcoal hover:text-forest'
                }`}
              >
                <span>Rooms</span>
                <ChevronDown className="w-3.5 h-3.5 text-sage" />
              </Link>

              {/* Hover Menu */}
              {roomsDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 animate-fade-in">
                  <div className="bg-cream border border-[#E9E4DB] p-3 shadow-warm rounded-xl">
                    <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-sage font-medium border-b border-[#E9E4DB] mb-1.5">
                      The Residences
                    </div>
                    {ROOMS_DATA.map((room) => (
                      <Link
                        key={room.id}
                        to={`/rooms/${room.roomNumber}`}
                        className="block px-3 py-2 text-xs text-charcoal hover:text-forest hover:bg-ivory rounded-lg transition-colors"
                      >
                        <div className="font-serif text-sm text-forest font-medium">
                          {room.roomNumber} — {room.name}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          {room.area} m² · {room.bedType.split('(')[0]}
                        </div>
                      </Link>
                    ))}
                    <div className="pt-2 mt-1 border-t border-[#E9E4DB]">
                      <Link
                        to="/rooms"
                        className="block px-3 py-1.5 text-xs text-forest hover:underline uppercase tracking-wide font-medium"
                      >
                        View All Rooms →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/rooms/203"
              className={`text-xs uppercase tracking-wider font-medium transition-colors duration-200 py-1 ${
                location.pathname.startsWith('/rooms/203')
                  ? 'text-forest font-semibold'
                  : 'text-charcoal hover:text-forest'
              }`}
            >
              Virtual Tour
            </Link>

            <Link
              to="/rooms/203"
              className="text-xs uppercase tracking-wider font-medium text-charcoal hover:text-forest transition-colors duration-200 py-1"
            >
              3D View
            </Link>

            <a
              href="/#hotel-intro"
              className="text-xs uppercase tracking-wider font-medium text-charcoal hover:text-forest transition-colors duration-200 py-1"
            >
              About / Experience
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/#book-rooms"
              onClick={handleBookRoomsClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-cream text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Rooms</span>
            </a>

            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-medium transition-all duration-300 rounded-full shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Rooms</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-forest focus:outline-none focus:ring-1 focus:ring-forest rounded-lg"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-b border-[#E9E4DB] px-6 pt-4 pb-8 space-y-4 shadow-warm animate-fade-in">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-charcoal hover:text-forest py-2 font-medium"
            >
              Farm Home
            </Link>
            <Link
              to="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-charcoal hover:text-forest py-2 font-medium"
            >
              Rooms & Residences
            </Link>

            {/* Nested room links for direct navigation */}
            <div className="pl-4 py-1 space-y-1 border-l-2 border-sage/20 my-1">
              {ROOMS_DATA.map((room) => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.roomNumber}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center min-h-[40px] text-xs text-charcoal-muted hover:text-forest py-1"
                >
                  Room {room.roomNumber} — {room.name}
                </Link>
              ))}
            </div>

            <Link
              to="/rooms/203"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-charcoal hover:text-forest py-2 font-medium"
            >
              Virtual Tour (Room 203)
            </Link>
            <Link
              to="/rooms/203"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-charcoal hover:text-forest py-2 font-medium"
            >
              3D Spatial Preview
            </Link>
            <a
              href="/#hotel-intro"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-charcoal hover:text-forest py-2 font-medium"
            >
              About / Experience
            </a>
            <a
              href="/#book-rooms"
              onClick={handleBookRoomsClick}
              className="flex items-center min-h-[48px] text-sm uppercase tracking-wider text-terracotta hover:text-terracotta-dark py-2 font-semibold"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              <span>Book Rooms (Instant Reservation)</span>
            </a>
          </div>

          <div className="pt-3 border-t border-[#E9E4DB] space-y-2">
            <a
              href="/#book-rooms"
              onClick={handleBookRoomsClick}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta hover:bg-terracotta-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Rooms Now</span>
            </a>

            <Link
              to="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Rooms</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
