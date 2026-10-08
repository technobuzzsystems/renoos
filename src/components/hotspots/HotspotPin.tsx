import React from 'react'
import { Info, Sparkles, Navigation, Layers } from 'lucide-react'
import type { Hotspot } from '@/types'

interface HotspotPinProps {
  hotspot: Hotspot
  onClick: (hotspot: Hotspot) => void
  isActive?: boolean
}

export const HotspotPin: React.FC<HotspotPinProps> = ({
  hotspot,
  onClick,
  isActive = false,
}) => {
  const getIcon = () => {
    switch (hotspot.type) {
      case 'navigation':
        return <Navigation className="w-3.5 h-3.5" />
      case 'feature':
        return <Sparkles className="w-3.5 h-3.5" />
      case 'dimension':
        return <Layers className="w-3.5 h-3.5" />
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5" />
    }
  }

  return (
    <button
      onClick={() => onClick(hotspot)}
      className={`group relative flex items-center gap-2 p-2 rounded-full backdrop-blur-md border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold ${
        isActive
          ? 'bg-luxury-gold text-luxury-black border-white shadow-xl scale-110'
          : 'bg-luxury-black/80 text-luxury-gold border-luxury-gold/50 hover:border-luxury-gold hover:scale-105'
      }`}
      title={hotspot.title}
      aria-label={`Hotspot: ${hotspot.title}`}
    >
      <span className="relative flex items-center justify-center">
        {getIcon()}
        {!isActive && (
          <span className="absolute -inset-1 rounded-full bg-luxury-gold/20 animate-ping pointer-events-none" />
        )}
      </span>
      <span className="text-xs font-medium pr-1 text-white group-hover:text-luxury-gold whitespace-nowrap">
        {hotspot.title}
      </span>
    </button>
  )
}
