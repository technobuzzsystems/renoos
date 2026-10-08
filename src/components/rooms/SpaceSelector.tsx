import React from 'react'
import { Bed, UtensilsCrossed, Bath, Trees, Sparkles } from 'lucide-react'
import type { Space } from '@/types'

interface SpaceSelectorProps {
  spaces: Record<string, Space | undefined>
  activeSpaceId: string
  onSelectSpace: (spaceId: string) => void
  className?: string
}

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
  className = '',
}) => {
  const getSpaceIcon = (type: string) => {
    switch (type) {
      case 'bedroom':
        return <Bed className="w-4 h-4" />
      case 'kitchen':
        return <UtensilsCrossed className="w-4 h-4" />
      case 'washroom':
        return <Bath className="w-4 h-4" />
      case 'garden':
        return <Trees className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const spaceList = Object.values(spaces).filter((s): s is Space => Boolean(s))

  return (
    <div className={`w-full ${className}`}>
      <div
        className="flex flex-row overflow-x-auto no-scrollbar items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-[#142018]/90 sm:bg-cream/90 backdrop-blur-md rounded-2xl border border-cream/20 sm:border-[#E9E4DB] shadow-sm"
        role="tablist"
        aria-label="Room Spaces Selector"
      >
        {spaceList.map((space) => {
          const isActive = space.id === activeSpaceId

          return (
            <button
              key={space.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`space-panel-${space.id}`}
              id={`space-tab-${space.id}`}
              onClick={() => onSelectSpace(space.id)}
              className={`shrink-0 sm:flex-1 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs tracking-wider uppercase rounded-xl transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? 'bg-cream sm:bg-forest text-[#16251C] sm:text-cream font-bold shadow-md'
                  : 'text-cream/70 sm:text-charcoal-muted hover:text-white sm:hover:text-forest hover:bg-white/10 sm:hover:bg-ivory/60'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5">
                {space.images.main && (
                  <div
                    className={`relative w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden border shrink-0 transition-transform duration-300 ${
                      isActive
                        ? 'border-[#16251C]/30 sm:border-cream/30 shadow-sm'
                        : 'border-white/20 sm:border-[#E9E4DB] opacity-80 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                  >
                    <img
                      src={space.images.main}
                      alt={space.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 text-left whitespace-nowrap">
                  <span className={isActive ? 'text-[#16251C] sm:text-terracotta-light' : 'text-amber-200/80 sm:text-sage'}>
                    {getSpaceIcon(space.type)}
                  </span>
                  <span className="font-semibold sm:font-medium">
                    {space.type === 'bedroom'
                      ? 'Bedroom'
                      : space.type === 'kitchen'
                      ? 'Kitchen'
                      : space.type === 'washroom'
                      ? 'Washroom'
                      : space.type === 'garden'
                      ? 'Garden'
                      : space.title}
                  </span>
                </div>
              </div>

              {space.area && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono hidden xs:inline shrink-0 ${
                    isActive
                      ? 'bg-black/10 sm:bg-cream/20 text-[#16251C] sm:text-cream font-bold'
                      : 'bg-white/10 sm:bg-ivory text-cream/70 sm:text-charcoal-muted border border-white/10 sm:border-[#E9E4DB]'
                  }`}
                >
                  {space.area} m²
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
