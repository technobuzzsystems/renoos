import type { Room } from './room'

export interface BookingSearchState {
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  categoryFilter: 'All' | 'Deluxe' | 'Premium' | 'Executive Suite'
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'area-desc'
  promoCode: string
}

export interface GuestDetails {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  arrivalTime: string
  specialRequests: string[]
  customNotes: string
}

export type PaymentMethod = 'pay_at_hotel' | 'credit_card' | 'upi'

export interface PaymentDetails {
  method: PaymentMethod
  cardNumber?: string
  cardHolder?: string
  cardExpiry?: string
  cardCvv?: string
  upiId?: string
}

export interface ConfirmedReservation {
  id: string
  bookingReference: string
  createdAt: string
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

