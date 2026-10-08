import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react'
import { ROOMS_DATA, getAdjacentRooms } from '@/data/rooms'

interface RoomSwitcherProps {
  currentRoomId: string
}

export const RoomSwitcher: React.FC<RoomSwitcherProps> = ({ currentRoomId }) => {
  const { prevRoom, nextRoom } = getAdjacentRooms(currentRoomId)

  return (
    <div className="bg-cream border border-[#E9E4DB] rounded-3xl p-4 sm:p-6 shadow-warm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Previous Room Link */}
        <Link
          to={`/rooms/${prevRoom.roomNumber}`}
          className="w-full md:w-auto flex items-center gap-3 p-2 rounded-2xl hover:bg-ivory/60 transition-colors group text-left"
        >
          <div className="p-2.5 rounded-full bg-ivory border border-[#E9E4DB] group-hover:bg-forest group-hover:border-forest text-forest group-hover:text-cream transition-colors shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block font-medium">
              Previous Suite
            </span>
            <span className="text-xs font-serif text-forest group-hover:text-terracotta transition-colors">
              Room {prevRoom.roomNumber} — {prevRoom.name}
            </span>
          </div>
        </Link>

        {/* Center Room Directory Pills */}
        <div className="flex items-center gap-2">
          {ROOMS_DATA.map((r) => {
            const isCurrent = r.id === currentRoomId || r.roomNumber === currentRoomId
            return (
              <Link
                key={r.id}
                to={`/rooms/${r.roomNumber}`}
                className={`px-3.5 py-1.5 text-xs font-mono rounded-full transition-all ${
                  isCurrent
                    ? 'bg-forest text-cream font-semibold shadow-sm'
                    : 'bg-ivory text-charcoal-muted hover:text-forest hover:bg-white border border-[#E9E4DB]'
                }`}
              >
                {r.roomNumber}
              </Link>
            )
          })}
          <Link
            to="/rooms"
            className="ml-2 p-2 text-forest hover:text-terracotta bg-ivory hover:bg-white border border-[#E9E4DB] rounded-full transition-colors shadow-sm"
            title="View All Suites"
            aria-label="View All Suites"
          >
            <Grid className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Next Room Link */}
        <Link
          to={`/rooms/${nextRoom.roomNumber}`}
          className="w-full md:w-auto flex items-center justify-end gap-3 p-2 rounded-2xl hover:bg-ivory/60 transition-colors group text-right"
        >
          <div>
            <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block font-medium">
              Next Suite
            </span>
            <span className="text-xs font-serif text-forest group-hover:text-terracotta transition-colors">
              Room {nextRoom.roomNumber} — {nextRoom.name}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-ivory border border-[#E9E4DB] group-hover:bg-forest group-hover:border-forest text-forest group-hover:text-cream transition-colors shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  )
}
