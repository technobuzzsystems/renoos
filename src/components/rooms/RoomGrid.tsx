import React from 'react'
import type { Room } from '@/types'
import { RoomCard } from './RoomCard'

interface RoomGridProps {
  rooms: Room[]
  title?: string
  priorityFirst?: boolean
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  priorityFirst = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
      {rooms.map((room, index) => (
        <div key={room.id} className="h-full flex flex-col">
          <RoomCard
            room={room}
            priority={priorityFirst && index === 0}
          />
        </div>
      ))}
    </div>
  )
}
