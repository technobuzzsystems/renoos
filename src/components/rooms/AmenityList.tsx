import React, { useState } from 'react'
import {
  Wifi,
  Bath,
  Coffee,
  Wind,
  Volume2,
  Wine,
  Bell,
  Sun,
  Sparkles,
  ShieldCheck,
  Activity,
  Flame,
  Utensils,
  Check,
} from 'lucide-react'
import type { Amenity } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Bath,
  Coffee,
  Wind,
  Volume2,
  Wine,
  Bell,
  Sun,
  Sparkles,
  ShieldCheck,
  Activity,
  Flame,
  Utensils,
  Check,
}

interface AmenityListProps {
  amenities: Amenity[]
  className?: string
  showCategories?: boolean
}

export const AmenityList: React.FC<AmenityListProps> = ({
  amenities,
  className = '',
  showCategories = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Features' },
    { key: 'wellness', label: 'Wellness & Bath' },
    { key: 'comfort', label: 'Comfort & Sleep' },
    { key: 'technology', label: 'Technology & Sound' },
    { key: 'dining', label: 'Dining & Sommelier' },
    { key: 'service', label: 'Bespoke Service' },
  ]

  const filteredAmenities =
    selectedCategory === 'all'
      ? amenities
      : amenities.filter((item) => item.category === selectedCategory)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category filter tabs */}
      {showCategories && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E9E4DB]">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs tracking-wider uppercase rounded-full transition-all duration-200 font-medium ${
                selectedCategory === cat.key
                  ? 'bg-forest text-cream font-semibold shadow-sm'
                  : 'bg-cream text-charcoal-muted border border-[#E9E4DB] hover:text-forest hover:bg-ivory'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid of amenities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAmenities.map((amenity) => {
          const IconComponent = iconMap[amenity.icon] || Sparkles

          return (
            <div
              key={amenity.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-warm ${
                amenity.highlight
                  ? 'bg-cream border-terracotta/40'
                  : 'bg-cream border-[#E9E4DB]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="p-2.5 rounded-xl bg-ivory border border-[#E9E4DB] text-forest shadow-sm">
                    <IconComponent className="w-5 h-5 text-forest" />
                  </div>
                  {amenity.highlight && (
                    <span className="text-[10px] uppercase tracking-wider text-terracotta font-semibold px-2.5 py-0.5 bg-terracotta/10 border border-terracotta/30 rounded-full">
                      Signature
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-forest mb-1.5">
                  {amenity.name}
                </h4>
                {amenity.description && (
                  <p className="text-xs text-charcoal-muted font-light leading-relaxed">
                    {amenity.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
