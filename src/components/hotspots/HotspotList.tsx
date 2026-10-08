import React from 'react'
import type { Hotspot } from '@/types'
import { Sparkles, Navigation, Info, Layers } from 'lucide-react'

interface HotspotListProps {
  hotspots: Hotspot[]
  onSelectHotspot?: (hotspot: Hotspot) => void
  selectedHotspotId?: string
}

export const HotspotList: React.FC<HotspotListProps> = ({
  hotspots,
  onSelectHotspot,
  selectedHotspotId,
}) => {
  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="text-xs text-neutral-500 font-light p-4 bg-luxury-black/40 rounded border border-white/5">
        No interactive hotspots configured for this vantage point.
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <Navigation className="w-3.5 h-3.5 text-sky-400" />
      case 'feature':
        return <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
      case 'dimension':
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-amber-300" />
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-2 flex items-center justify-between">
        <span>Room Highlights ({hotspots.length})</span>
        <span className="text-[10px] text-luxury-gold/80 font-mono">Interactive Navigation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {hotspots.map((hs) => {
          const isSelected = hs.id === selectedHotspotId

          return (
            <div
              key={hs.id}
              onClick={() => onSelectHotspot?.(hs)}
              className={`p-3 rounded-sm border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-luxury-gold/15 border-luxury-gold'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getIcon(hs.type)}
                <span className="text-xs font-medium text-white truncate">{hs.title}</span>
                {hs.category && (
                  <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 bg-white/5 text-luxury-gold/80 rounded font-mono">
                    {hs.category}
                  </span>
                )}
              </div>
              {hs.description && (
                <p className="text-[11px] text-neutral-400 font-light line-clamp-2 pl-5">
                  {hs.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
