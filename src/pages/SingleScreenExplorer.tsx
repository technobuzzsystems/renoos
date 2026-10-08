import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'
import type { Room } from '@/types'
import { Hotel3DScene } from '@/components/hotel3d/Hotel3DScene'
import { ReceptionScene } from '@/components/reception/ReceptionScene'
import { RoomPreviewScene } from '@/components/rooms/RoomPreviewScene'

export type ExperienceStage = 'hotel-exterior' | 'reception' | 'room-preview'

export interface BookingDatesState {
  checkIn: string
  checkOut: string
  adults: number
  children: number
}

/**
 * MASTER ORCHESTRATOR: Renoos Hotel Immersive Experience
 * Coordinates the 3-stage continuous journey:
 * 1. 360° Hotel Exterior (Hotel3DScene)
 * 2. Grand Lobby & Transparent Concierge (ReceptionScene)
 * 3. Room Preview & Reservation (RoomPreviewScene)
 */
export const SingleScreenExplorer: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // 1. Initial Stage Detection with URL Parameter & Alias Support
  const initialStage = useMemo<ExperienceStage>(() => {
    const qStage = searchParams.get('stage')
    if (qStage === 'room-preview' || qStage === 'terminal') {
      return 'room-preview'
    }
    if (qStage === 'reception') {
      return 'reception'
    }
    if (qStage === 'hotel-exterior' || qStage === 'hotel-3d') {
      return 'hotel-exterior'
    }
    if (roomId) {
      return 'room-preview'
    }
    return 'hotel-exterior'
  }, [searchParams, roomId])

  const [currentStage, setCurrentStage] = useState<ExperienceStage>(initialStage)
  const [transitioningMessage, setTransitioningMessage] = useState<string | null>(null)

  // Smooth cinematic scene transition handler
  const handleTransitionTo = (nextStage: ExperienceStage, message?: string) => {
    if (message) {
      setTransitioningMessage(message)
      setTimeout(() => {
        setCurrentStage(nextStage)
        setTransitioningMessage(null)
      }, 600)
    } else {
      setCurrentStage(nextStage)
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('stage', nextStage)
        return next
      },
      { replace: true }
    )
  }

  // 2. Room Selection State
  const initialRoomId = useMemo(() => {
    if (roomId && ROOMS_DATA.some((r) => r.id === roomId || r.roomNumber === roomId)) {
      return ROOMS_DATA.find((r) => r.id === roomId || r.roomNumber === roomId)!.id
    }
    const qRoom = searchParams.get('room')
    if (qRoom && ROOMS_DATA.some((r) => r.id === qRoom || r.roomNumber === qRoom)) {
      return ROOMS_DATA.find((r) => r.id === qRoom || r.roomNumber === qRoom)!.id
    }
    return ROOMS_DATA[0].id
  }, [roomId, searchParams])

  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId)

  useEffect(() => {
    if (roomId && ROOMS_DATA.some((r) => r.id === roomId || r.roomNumber === roomId)) {
      const match = ROOMS_DATA.find((r) => r.id === roomId || r.roomNumber === roomId)!.id
      setSelectedRoomId(match)
      setCurrentStage('room-preview')
    }
  }, [roomId])

  // 3. Booking Dates State (preserved across stages)
  const defaultDates = useMemo<BookingDatesState>(() => {
    const today = new Date()
    const checkIn = new Date(today)
    checkIn.setDate(today.getDate() + 1)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkIn.getDate() + 2)
    return {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults: 2,
      children: 0,
    }
  }, [])

  const [bookingDates, setBookingDates] = useState<BookingDatesState>(defaultDates)

  return (
    <div className="relative w-screen h-screen bg-[#0d1510] text-cream flex flex-col overflow-hidden select-none">
      {/* =========================================================================
          CINEMATIC STAGE TRANSITION OVERLAY (Subtle, Atmospheric, Non-Intrusive)
          ========================================================================= */}
      {transitioningMessage && (
        <div className="absolute inset-0 bg-[#16251C]/90 z-50 flex flex-col items-center justify-center space-y-4 backdrop-blur-md animate-fade-in pointer-events-none">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-cream/20 border-t-cream animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <span className="font-serif text-xl sm:text-2xl text-cream tracking-wide block">
              {transitioningMessage}
            </span>
            <span className="text-[10px] font-mono text-cream/70 uppercase tracking-widest block">
              Renoos Hotel · Luxury Mountain Resort
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 1: 360° HOTEL EXTERIOR VIRTUAL TOUR
          ========================================================================= */}
      {currentStage === 'hotel-exterior' && (
        <div className="flex-1 w-full h-full relative overflow-hidden animate-fade-in">
          <Hotel3DScene
            onEnterReception={() =>
              handleTransitionTo('reception', 'Walking into 360° Reception Lobby...')
            }
          />
        </div>
      )}

      {/* =========================================================================
          STAGE 2: GRAND LOBBY + TRANSPARENT CONCIERGE & DATE SELECTION
          ========================================================================= */}
      {currentStage === 'reception' && (
        <div className="flex-1 w-full h-full relative overflow-hidden animate-fade-in">
          <ReceptionScene
            initialMode="360-lobby"
            initialDates={bookingDates}
            onContinueToRoomPreview={(dates) => {
              setBookingDates(dates)
              handleTransitionTo('room-preview', 'Preparing Available Suites...')
            }}
            onBackToExterior={() => handleTransitionTo('hotel-exterior')}
          />
        </div>
      )}

      {/* =========================================================================
          STAGE 3: IMMERSIVE ROOM PREVIEW & BOOKING FLOW
          ========================================================================= */}
      {currentStage === 'room-preview' && (
        <div className="flex-1 w-full h-full relative overflow-hidden animate-fade-in">
          <RoomPreviewScene
            initialRoomId={selectedRoomId}
            checkInDate={bookingDates.checkIn}
            checkOutDate={bookingDates.checkOut}
            adults={bookingDates.adults}
            children={bookingDates.children}
            onBackToReception={() => handleTransitionTo('reception')}
            onBackToExterior={() => handleTransitionTo('hotel-exterior')}
            onModifyDates={() => handleTransitionTo('reception')}
          />
        </div>
      )}
    </div>
  )
}

export default SingleScreenExplorer
