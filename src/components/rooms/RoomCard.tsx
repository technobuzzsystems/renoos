import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Maximize2, Bed, ArrowRight, Eye } from 'lucide-react'
import type { Room } from '@/types'

interface RoomCardProps {
  room: Room
  featured?: boolean
  priority?: boolean
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  featured = false,
  priority = false,
}) => {
  // Format price in Indian Rupees (INR) with Indian number grouping
  const inrPrice = room.pricePerNight || 5200

  const formattedPrice = `₹${inrPrice.toLocaleString('en-IN')}`

  return (
    <article
      className={`group relative bg-cream border border-[#E9E4DB] rounded-3xl overflow-hidden flex flex-col shadow-warm hover:shadow-warm-lg transition-all duration-500 ${
        featured ? 'h-full justify-between' : 'h-full'
      }`}
      aria-labelledby={`room-title-${room.id}`}
    >
      {/* Top Rounded Image Container */}
      <div className="p-3 pb-0">
        <div
          className={`relative overflow-hidden rounded-2xl bg-ivory ${
            featured ? 'aspect-[16/11] md:aspect-[16/10]' : 'aspect-[16/10]'
          }`}
        >
          <img
            src={room.previewImages.card}
            alt={`View of ${room.name} (${room.roomNumber}) interior`}
            width={800}
            height={500}
            loading={priority ? undefined : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/IMG/203/kitchen.avif'
            }}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />

          {/* Room Number & Category Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span className="px-3 py-1 bg-cream/95 backdrop-blur-sm border border-[#E9E4DB] text-forest text-xs font-mono tracking-wider uppercase rounded-full shadow-sm font-medium">
              ROOM {room.roomNumber}
            </span>
            <span className="px-3 py-1 bg-forest/85 backdrop-blur-sm text-cream text-[11px] uppercase tracking-wider rounded-full font-medium">
              {room.category}
            </span>
          </div>

          {/* Pricing Tag */}
          <div className="absolute bottom-3.5 right-3.5 bg-cream/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-[#E9E4DB] shadow-sm text-right">
            <span className="text-[10px] text-charcoal-muted block uppercase tracking-wider">Tariff</span>
            <span className="text-sm font-serif text-forest font-semibold">
              {formattedPrice}
            </span>
            <span className="text-[10px] text-charcoal-muted"> / night</span>
          </div>

          {/* Hover Quick Action */}
          <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream text-forest text-xs uppercase tracking-wider font-medium rounded-full shadow-warm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-3.5 h-3.5 text-terracotta" />
              <span>Enter 360° Tour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Content */}
      <div className="p-6 md:p-7 flex flex-col flex-grow justify-between space-y-6">
        <div>
          {/* Floor & Orientation */}
          <div className="text-[11px] uppercase tracking-wider text-sage font-medium mb-1">
            {room.floor}
          </div>

          {/* Room Name */}
          <h3
            id={`room-title-${room.id}`}
            className="font-serif text-2xl md:text-3xl text-forest font-normal group-hover:text-forest-dark transition-colors duration-300 mb-2"
          >
            {room.name}
          </h3>

          {/* Description */}
          <p className="text-charcoal-muted text-sm font-light leading-relaxed mb-5 line-clamp-2">
            {room.description}
          </p>

          {/* Metric Specifications */}
          <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-[#E9E4DB] text-charcoal text-xs mb-5">
            <div>
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1 mb-0.5">
                <Maximize2 className="w-3 h-3 text-sage" />
                Area
              </span>
              <span className="font-medium text-forest">{room.area} m²</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-sage" />
                Guests
              </span>
              <span className="font-medium text-forest">{room.guestCapacity} Guests</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-charcoal-muted tracking-wider flex items-center gap-1 mb-0.5">
                <Bed className="w-3 h-3 text-sage" />
                Bed
              </span>
              <span className="font-medium text-forest truncate block">
                {room.bedType.split('(')[0]}
              </span>
            </div>
          </div>

          {/* Spaces Pill Badges */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(room.spaces)
              .filter((space): space is NonNullable<typeof space> => Boolean(space))
              .map((space) => (
                <span
                  key={space.id}
                  className="px-2.5 py-1 bg-ivory border border-[#E9E4DB] text-[11px] text-charcoal-muted rounded-full font-light"
                >
                  {space.title.split(' ')[0]}
                </span>
              ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <Link
            to={`/rooms/${room.roomNumber}`}
            className="w-full inline-flex items-center justify-between px-6 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-medium transition-all duration-300 rounded-full shadow-sm"
            aria-label={`Explore Room ${room.roomNumber} - ${room.name}`}
          >
            <span>Explore Room {room.roomNumber}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </article>
  )
}
