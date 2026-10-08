import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Calendar,
  Bed,
  User,
  Phone,
  Mail,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Ban,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import type { BookingRecord } from '@/services/adminApi'
import { generateReservationPDF, printReservationInvoice } from '@/lib/pdfBillGenerator'

interface AdminBookingDetailsModalProps {
  booking: BookingRecord | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (
    bookingId: string,
    status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ) => Promise<void>
}

export const AdminBookingDetailsModal: React.FC<AdminBookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !booking) return null

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  const adaptToConfirmedReservation = (b: BookingRecord): any => ({
    id: b.id,
    bookingReference: b.bookingReference,
    createdAt: b.createdAt,
    room: {
      id: b.roomId || `room-${b.roomNumber}`,
      roomNumber: b.roomNumber,
      name: b.roomName,
      tagline: 'Luxury Sanctuary',
      type: 'deluxe',
      area: 55,
      maxGuests: b.adults + b.children,
      maxAdults: b.adults,
      maxChildren: b.children,
      bedType: 'King Sanctuary Bed',
      floor: 2,
      basePrice: b.tariffPerNight,
      pricePerNight: b.tariffPerNight,
      pricePerNightDouble: b.tariffPerNight,
      description: '',
      shortDescription: '',
      features: [],
      amenities: [],
      previewImages: {
        hero: '/images/hotel-exterior-hero.jpg',
        gallery: [],
        thumbnail: '/images/hotel-exterior-hero.jpg',
      },
      spaces: {} as any,
    },
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate,
    nights: b.nights || 1,
    adults: b.adults || 1,
    children: b.children || 0,
    tariffPerNight: b.tariffPerNight || 0,
    subtotal: b.subtotal || b.tariffPerNight * (b.nights || 1),
    discount: b.discount || 0,
    conservationFee: 0,
    taxesAndGst: b.taxesAndGst || 0,
    totalAmount: b.totalAmount || 0,
    guestDetails: {
      title: 'Guest',
      firstName: b.guestDetails?.fullName?.split(' ')[0] || 'Guest',
      lastName: b.guestDetails?.fullName?.split(' ').slice(1).join(' ') || '',
      email: b.guestDetails?.email || '',
      phone: b.guestDetails?.phone || '',
      arrivalTime: '14:00',
      specialRequests: b.guestDetails?.specialRequests ? [b.guestDetails.specialRequests] : [],
      customNotes: b.notes || '',
    },
    paymentMethod: b.paymentMethod || 'pay_at_hotel',
    paymentStatus: b.paymentStatus || 'paid',
  })

  const handleDownloadPDF = () => {
    try {
      generateReservationPDF(adaptToConfirmedReservation(booking))
    } catch (err) {
      console.error('Failed to generate PDF bill:', err)
      alert('Could not generate PDF bill.')
    }
  }

  const handlePrint = () => {
    try {
      printReservationInvoice(adaptToConfirmedReservation(booking))
    } catch (err) {
      console.error('Failed to print invoice:', err)
    }
  }

  const handleStatusSelect = async (
    newStatus: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ) => {
    setIsUpdating(true)
    try {
      await onStatusChange(booking.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const isCancelled = booking.status === 'cancelled'
  const isCheckedIn = booking.status === 'checked_in'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#16251C] border border-cream/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-cream"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-300 to-terracotta shrink-0" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-cream/15 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-200 font-semibold">
                Folio Details
              </span>
              <span className="text-cream/40">·</span>
              <span className="text-xs font-mono font-bold text-cream">
                {booking.bookingReference}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-cream mt-0.5">
              Room {booking.roomNumber} — {booking.roomName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-cream/70 hover:text-cream hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Status Quick Bar */}
          <div className="p-4 bg-black/30 rounded-2xl border border-cream/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cream/70">Current PMS Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${
                  isCancelled
                    ? 'bg-red-500/20 text-red-200 border-red-500/40'
                    : isCheckedIn
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-cream/50 text-[11px]">Update:</span>
              <button
                type="button"
                disabled={isUpdating || booking.status === 'checked_in'}
                onClick={() => handleStatusSelect('checked_in')}
                className="px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-30 cursor-pointer"
              >
                Check In
              </button>
              <button
                type="button"
                disabled={isUpdating || booking.status === 'checked_out'}
                onClick={() => handleStatusSelect('checked_out')}
                className="px-2.5 py-1 rounded-lg bg-gray-600/80 hover:bg-gray-500 text-white font-bold transition-colors disabled:opacity-30 cursor-pointer"
              >
                Check Out
              </button>
              <button
                type="button"
                disabled={isUpdating || isCancelled}
                onClick={() => handleStatusSelect('cancelled')}
                className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-30 cursor-pointer"
              >
                Cancel Stay
              </button>
            </div>
          </div>

          {/* Guest Information */}
          <div className="p-4 bg-black/25 rounded-2xl border border-cream/10 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-200 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Primary Guest Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-cream/50 block">Full Name:</span>
                <span className="font-sans font-semibold text-cream text-sm">
                  {booking.guestDetails?.fullName || 'Guest'}
                </span>
              </div>
              <div>
                <span className="text-cream/50 block">Mobile Number:</span>
                <span className="text-amber-200 font-bold">+91 {booking.guestDetails?.phone}</span>
              </div>
              <div>
                <span className="text-cream/50 block">Email Address:</span>
                <span className="text-cream/80">{booking.guestDetails?.email || '—'}</span>
              </div>
              <div>
                <span className="text-cream/50 block">Booking Timestamp:</span>
                <span className="text-cream/80">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-IN') : 'Direct'}
                </span>
              </div>
            </div>
          </div>

          {/* Stay & Room Dates */}
          <div className="p-4 bg-black/25 rounded-2xl border border-cream/10 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-200 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Stay Timeline</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-cream/50 block">Check-In:</span>
                <span className="font-bold text-cream">{booking.checkInDate}</span>
              </div>
              <div>
                <span className="text-cream/50 block">Check-Out:</span>
                <span className="font-bold text-cream">{booking.checkOutDate}</span>
              </div>
              <div>
                <span className="text-cream/50 block">Duration:</span>
                <span className="text-cream">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <div>
                <span className="text-cream/50 block">Party Size:</span>
                <span className="text-cream">
                  {booking.adults} Adults · {booking.children} Children
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-black/30 rounded-2xl border border-cream/15 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-200 font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tariff & Bill Folio</span>
            </h4>
            <div className="space-y-1.5 text-xs font-mono pt-1">
              <div className="flex justify-between text-cream/70">
                <span>Room Tariff ({booking.nights} nights @ {formatCurrency(booking.tariffPerNight)})</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Promotional Discount:</span>
                  <span>-{formatCurrency(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream/70">
                <span>GST & Hospitality Taxes (18%):</span>
                <span>{formatCurrency(booking.taxesAndGst)}</span>
              </div>
              <div className="pt-2 border-t border-cream/15 flex justify-between items-baseline font-bold text-sm">
                <span className="text-amber-200">Total Net Folio:</span>
                <span className="font-serif text-xl text-cream">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="text-[11px] text-cream/60 flex items-center justify-between pt-1">
                <span>Payment Settlement:</span>
                <span className="capitalize">{booking.paymentStatus === 'paid' ? 'Paid in Full' : 'Pay at Check-in'}</span>
              </div>
            </div>
          </div>

          {/* Special Requests or Admin Notes */}
          {booking.guestDetails?.specialRequests && (
            <div className="p-3.5 bg-black/20 rounded-2xl border border-cream/10 text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase text-cream/50 block">Guest Notes & Requests:</span>
              <p className="text-cream/80 italic">{booking.guestDetails.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-cream/15 bg-black/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-full bg-terracotta hover:bg-terracotta-dark text-cream text-xs font-mono uppercase font-semibold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tax Bill (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-cream/15 hover:bg-cream/25 text-cream text-xs font-mono uppercase font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Bill</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminBookingDetailsModal

