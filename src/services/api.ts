import type { ConfirmedReservation, Room, GuestDetails, PaymentMethod, UserProfile } from '@/types'
import { ROOMS_DATA } from '@/data/rooms'

export interface RoomAvailabilityInfo {
  available: boolean
  conflictingBooking?: {
    bookingReference: string
    checkInDate: string
    checkOutDate: string
  }
}

export type AvailabilityMap = Record<string, RoomAvailabilityInfo>

export interface CreateBookingRequest {
  userId?: string
  room: Room
  checkInDate: string
  checkOutDate: string
  nights: number
  adults: number
  children: number
  tariffPerNight: number
  subtotal: number
  discount: number
  promoCodeApplied?: string
  conservationFee: number
  taxesAndGst: number
  totalAmount: number
  guestDetails: GuestDetails
  paymentMethod: PaymentMethod
  paymentStatus: 'paid' | 'pay_at_checkin'
}

/**
 * Fetch availability for all rooms for a specified check-in and check-out date range.
 * Hotel overlap logic: checkOut on the same day as another checkIn does NOT conflict.
 */
export async function fetchRoomAvailability(
  checkInDate: string,
  checkOutDate: string
): Promise<AvailabilityMap> {
  if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
    return {
      '201': { available: true },
      '202': { available: true },
      '203': { available: true },
    }
  }

  try {
    const res = await fetch(
      `/api/availability?checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!res.ok) {
      console.warn('Availability API returned status:', res.status)
      return {
        '201': { available: true },
        '202': { available: true },
        '203': { available: true },
      }
    }

    const data = await res.json()
    if (data.success && data.availability) {
      return data.availability as AvailabilityMap
    }

    return {
      '201': { available: true },
      '202': { available: true },
      '203': { available: true },
    }
  } catch (err) {
    console.error('Failed to fetch room availability from server:', err)
    return {
      '201': { available: true },
      '202': { available: true },
      '203': { available: true },
    }
  }
}

/**
 * Submit a real booking to the backend.
 * Throws an informative Error if a 409 Conflict occurs (room already booked by another user).
 */
export async function submitBookingToApi(
  req: CreateBookingRequest
): Promise<ConfirmedReservation> {
  const payload = {
    userId: req.userId,
    roomId: req.room.id,
    roomNumber: req.room.roomNumber,
    roomName: req.room.name,
    checkInDate: req.checkInDate,
    checkOutDate: req.checkOutDate,
    nights: req.nights,
    adults: req.adults,
    children: req.children,
    tariffPerNight: req.tariffPerNight,
    subtotal: req.subtotal,
    discount: req.discount,
    promoCodeApplied: req.promoCodeApplied,
    taxesAndGst: req.taxesAndGst,
    totalAmount: req.totalAmount,
    guestDetails: {
      fullName: `${req.guestDetails.title} ${req.guestDetails.firstName} ${req.guestDetails.lastName}`.trim(),
      firstName: req.guestDetails.firstName,
      lastName: req.guestDetails.lastName,
      title: req.guestDetails.title,
      email: req.guestDetails.email,
      phone: req.guestDetails.phone,
      arrivalTime: req.guestDetails.arrivalTime,
      specialRequests: req.guestDetails.specialRequests?.join(', ') || req.guestDetails.customNotes,
    },
    paymentMethod: req.paymentMethod,
    paymentStatus: req.paymentStatus,
  }

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 409) {
      const conflictMsg =
        data.error ||
        `Room ${req.room.roomNumber} was just reserved by another guest for the selected dates (${req.checkInDate} to ${req.checkOutDate}).`
      const err = new Error(conflictMsg)
      ;(err as any).status = 409
      ;(err as any).conflictingBooking = data.conflictingBooking
      throw err
    }
    throw new Error(data.error || `Server reservation request failed with status ${res.status}`)
  }

  // Map server booking record back to ConfirmedReservation
  const serverBooking = data.booking
  const confirmedReservation: ConfirmedReservation = {
    id: serverBooking.id,
    bookingReference: serverBooking.bookingReference,
    createdAt: serverBooking.createdAt || new Date().toISOString(),
    room: req.room,
    checkInDate: req.checkInDate,
    checkOutDate: req.checkOutDate,
    nights: req.nights,
    adults: req.adults,
    children: req.children,
    tariffPerNight: req.tariffPerNight,
    subtotal: req.subtotal,
    discount: req.discount,
    promoCodeApplied: req.promoCodeApplied,
    conservationFee: req.conservationFee,
    taxesAndGst: req.taxesAndGst,
    totalAmount: req.totalAmount,
    guestDetails: req.guestDetails,
    paymentMethod: req.paymentMethod,
    paymentStatus: req.paymentStatus,
  }

  return confirmedReservation
}

/**
 * Register a new user with Mobile Number and Password
 */
export async function registerUserApi(
  fullName: string,
  phone: string,
  password: string,
  email?: string
): Promise<UserProfile> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ fullName, phone, password, email }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Registration failed. Please check details.')
  }

  return data.user as UserProfile
}

/**
 * Login user with Mobile Number and Password
 */
export async function loginUserApi(phone: string, password: string): Promise<UserProfile> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ phone, password }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Login failed. Invalid mobile number or password.')
  }

  return data.user as UserProfile
}

/**
 * Fetch all bookings for a user by their mobile number or ID
 */
export async function fetchUserBookingsApi(phoneOrUserId: string): Promise<ConfirmedReservation[]> {
  if (!phoneOrUserId) return []

  const res = await fetch(
    `/api/user/bookings?phone=${encodeURIComponent(phoneOrUserId)}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    console.warn('Failed to fetch user bookings:', res.status)
    return []
  }

  const data = await res.json().catch(() => ({}))
  if (!data.success || !Array.isArray(data.bookings)) {
    return []
  }

  // Convert raw DB bookings to ConfirmedReservation format with complete Room data
  return data.bookings.map((b: any) => {
    const room =
      ROOMS_DATA.find((r) => r.id === b.roomId || r.roomNumber === b.roomNumber) ||
      ROOMS_DATA[0]

    return {
      id: b.id,
      bookingReference: b.bookingReference,
      createdAt: b.createdAt,
      room,
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      nights: b.nights,
      adults: b.adults,
      children: b.children || 0,
      tariffPerNight: b.tariffPerNight,
      subtotal: b.subtotal,
      discount: b.discount || 0,
      promoCodeApplied: b.promoCodeApplied,
      conservationFee: 0,
      taxesAndGst: b.taxesAndGst,
      totalAmount: b.totalAmount,
      guestDetails: {
        title: 'Guest',
        firstName: b.guestDetails?.fullName?.split(' ')[0] || 'Guest',
        lastName: b.guestDetails?.fullName?.split(' ').slice(1).join(' ') || '',
        email: b.guestDetails?.email || '',
        phone: b.guestDetails?.phone || '',
        arrivalTime: '14:00',
        specialRequests: b.guestDetails?.specialRequests
          ? [b.guestDetails.specialRequests]
          : [],
        customNotes: '',
      },
      paymentMethod: b.paymentMethod || 'credit_card',
      paymentStatus: b.paymentStatus || 'paid',
      status: b.status || 'confirmed',
    } as ConfirmedReservation & { status?: string }
  })
}

/**
 * Cancel a booking by ID or reference
 */
export async function cancelBookingApi(bookingId: string): Promise<boolean> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await res.json().catch(() => ({}))
  return res.ok && data.success === true
}
