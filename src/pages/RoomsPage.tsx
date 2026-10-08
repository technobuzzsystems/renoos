import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CTASection } from '@/components/common/CTASection'
import { RoomGrid } from '@/components/rooms/RoomGrid'
import { ROOMS_DATA } from '@/data/rooms'
import { Compass, Sparkles } from 'lucide-react'

export const RoomsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  const filterOptions = [
    { key: 'all', label: 'All Accommodations' },
    { key: 'Deluxe', label: 'Deluxe Room' },
    { key: 'Premium', label: 'Premium Room' },
    { key: 'Executive Suite', label: 'Executive Suite' },
  ]

  const filteredRooms =
    selectedFilter === 'all'
      ? ROOMS_DATA
      : ROOMS_DATA.filter((r) => r.category === selectedFilter)

  return (
    <div className="min-h-screen bg-ivory text-charcoal pt-28">
      {/* Header Banner */}
      <section className="py-16 md:py-24 border-b border-[#E9E4DB] bg-cream/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta text-xs tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Virtual Tour Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-forest font-normal leading-tight tracking-tight max-w-4xl mx-auto">
            Rooms & Private Suites
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-charcoal-muted font-light leading-relaxed">
            Discover three unique architectural concepts. Explore bedrooms, kitchenettes, and marble bathrooms in high-definition virtual preview.
          </p>

          {/* Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedFilter(opt.key)}
                className={`px-5 py-2 text-xs uppercase tracking-wider rounded-full transition-all duration-300 font-medium ${
                  selectedFilter === opt.key
                    ? 'bg-forest text-cream font-semibold shadow-warm'
                    : 'bg-cream text-charcoal-muted border border-[#E9E4DB] hover:text-forest hover:bg-ivory'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Rooms Grid */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RoomGrid rooms={filteredRooms} priorityFirst={true} />
      </section>

      {/* Architectural Comparison Matrix */}
      <section className="py-20 bg-cream/40 border-t border-[#E9E4DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Architectural Matrix"
            title="Suite Comparison at a Glance"
            subtitle="Explore how our three residences compare across spatial dimensions, features, and views."
            align="center"
          />

          <p className="text-[11px] text-charcoal-muted sm:hidden text-center mb-2 font-mono">
            ← Swipe horizontally to compare all suites →
          </p>

          <div className="overflow-x-auto rounded-3xl border border-[#E9E4DB] bg-cream shadow-warm -mx-4 sm:mx-0">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="bg-forest border-b border-forest-dark text-cream uppercase tracking-wider font-mono">
                  <th className="p-4 font-semibold">Suite Specification</th>
                  {ROOMS_DATA.map((r) => (
                    <th key={r.id} className="p-4 text-cream font-serif text-sm font-normal">
                      Room {r.roomNumber} ({r.name})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E4DB]">
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Floor Area</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4 font-mono text-forest font-semibold">
                      {r.area} m² ({Math.round(r.area * 10.764)} sq ft)
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Maximum Guests</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4 text-charcoal-muted">
                      {r.guestCapacity} Guests
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Bedding Configuration</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4 text-charcoal-muted">
                      {r.bedType}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Vantage & View</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4 text-charcoal-muted">
                      {r.viewType}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Signature Wellness</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4 text-charcoal-muted">
                      {r.spaces.washroom.title}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ivory/60 transition-colors">
                  <td className="p-4 text-charcoal font-medium">Interactive Exploration</td>
                  {ROOMS_DATA.map((r) => (
                    <td key={r.id} className="p-4">
                      <Link
                        to={`/rooms/${r.roomNumber}`}
                        className="inline-flex items-center gap-1.5 text-forest hover:text-terracotta font-semibold uppercase tracking-wider text-[11px]"
                      >
                        <Compass className="w-3.5 h-3.5 text-forest" />
                        <span>Launch Tour →</span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
