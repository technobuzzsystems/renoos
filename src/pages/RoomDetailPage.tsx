import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRoomById } from '@/data/rooms'
import { RoomDetails } from '@/components/rooms'
import { ArrowLeft } from 'lucide-react'

export const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const room = roomId ? getRoomById(roomId) : undefined

  if (!room) {
    return (
      <div className="min-h-screen bg-luxury-black text-neutral-200 flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full text-center space-y-6 bg-luxury-surface/80 border border-luxury-border p-8 rounded-sm shadow-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-luxury-gold block">
            Suite Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Room {roomId} Is Unavailable
          </h1>
          <p className="text-neutral-400 text-sm font-light leading-relaxed">
            The requested suite identifier could not be located in our active accommodations directory.
          </p>
          <div className="pt-2">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-black text-xs uppercase tracking-luxurious font-medium rounded-sm hover:bg-luxury-gold-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Rooms</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <RoomDetails key={room.id} room={room} />
}
