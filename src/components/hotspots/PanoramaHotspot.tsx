import React, { useState } from 'react'
import { Navigation, Sparkles, ArrowRight, ArrowUp } from 'lucide-react'
import type { Hotspot } from '@/types'

interface PanoramaHotspotProps {
  hotspot: Hotspot
  onClick: (hotspot: Hotspot) => void
  disabled?: boolean
}

/**
 * Interactive Panorama Hotspot styled directly after the reference image
 * Features an elegant circular beacon with an upward orientation arrow,
 * gentle breathing halo, and a sleek translucent pill label.
 */
export const PanoramaHotspot: React.FC<PanoramaHotspotProps> = ({
  hotspot,
  onClick,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isNav = hotspot.type === 'navigation'

  const handleClick = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onClick(hotspot)
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center select-none group ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip Card (Appears above the marker on hover or keyboard focus) */}
      <div
        className={`absolute bottom-full mb-3 pointer-events-auto transition-all duration-300 ${
          isHovered
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none group-focus-within:opacity-100 group-focus-within:translate-y-0'
        }`}
      >
        <div className="bg-[#142218]/95 border border-amber-200/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 whitespace-nowrap min-w-[150px]">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-300 font-medium">
              {isNav ? 'Resort Walkway' : (hotspot.category || 'Point of Interest')}
            </span>
            <span className="text-xs font-serif text-cream font-medium">
              {hotspot.title}
            </span>
            {hotspot.description && (
              <span className="text-[10px] text-cream/70 font-light max-w-[200px] truncate mt-0.5">
                {hotspot.description}
              </span>
            )}
          </div>
          {isNav && (
            <div className="p-1 rounded-full bg-cream/15 text-cream">
              <ArrowRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Beacon Button - Matching Reference Design */}
      <button
        type="button"
        role="button"
        tabIndex={0}
        data-hotspot-id={hotspot.id}
        data-target-space={hotspot.targetSpaceId}
        data-hotspot-type={hotspot.type}
        aria-label={isNav ? `Navigate to ${hotspot.title}` : `View ${hotspot.title}`}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick(e)
          }
        }}
        className="relative flex items-center justify-center p-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-300 transition-all duration-300 transform group-hover:scale-105"
      >
        {/* Subtle, soft breathing ring */}
        {isNav && (
          <span className="absolute -inset-1.5 rounded-full bg-amber-400/20 animate-pulse pointer-events-none" />
        )}

        {/* Outer Halo */}
        <span
          className={`relative rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
            isNav
              ? 'w-9 h-9 bg-black/80 border border-white/40 shadow-xl group-hover:border-amber-300 group-hover:bg-[#1a2d21]'
              : 'w-7 h-7 bg-black/75 border border-white/30 shadow-sm group-hover:border-cream/60'
          }`}
        >
          {/* Inner Icon */}
          {isNav ? (
            <ArrowUp className="w-4 h-4 text-cream group-hover:text-amber-200 transition-colors" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cream/80 group-hover:text-cream transition-colors" />
          )}
        </span>
      </button>

      {/* Direction & Space Name Label Pill (Matching Reference Image) */}
      <div className="mt-1 px-3.5 py-1 rounded-full bg-black/80 border border-white/30 backdrop-blur-md pointer-events-none transition-all duration-300 group-hover:border-amber-300 group-hover:bg-black/95 shadow-md">
        <span className="text-[10px] font-mono tracking-wider text-cream uppercase whitespace-nowrap font-medium">
          {hotspot.title}
        </span>
      </div>
    </div>
  )
}

export default PanoramaHotspot
