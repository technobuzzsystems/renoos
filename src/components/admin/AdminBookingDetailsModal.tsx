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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[96dvh] sm:max-h-[90vh] bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-100 dark:border-emerald-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#047857] dark:text-emerald-400 font-semibold">
                Folio Details
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 dark:text-white">
                {booking.bookingReference}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Room {booking.roomNumber} — {booking.roomName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2820] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
            aria-label="Close details modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 no-scrollbar">
          {/* Status Quick Bar */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Current PMS Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${
                  isCancelled
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                    : isCheckedIn
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs w-full sm:w-auto">
              <span className="text-slate-400 text-[11px] mr-1">Update:</span>
              <button
                type="button"
                disabled={isUpdating || booking.status === 'checked_in'}
                onClick={() => handleStatusSelect('checked_in')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-30 cursor-pointer min-h-[34px] flex items-center justify-center text-xs"
              >
                Check In
              </button>
              <button
                type="button"
                disabled={isUpdating || booking.status === 'checked_out'}
                onClick={() => handleStatusSelect('checked_out')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors disabled:opacity-30 cursor-pointer min-h-[34px] flex items-center justify-center text-xs"
              >
                Check Out
              </button>
              <button
                type="button"
                disabled={isUpdating || isCancelled}
                onClick={() => handleStatusSelect('cancelled')}
                className="px-3 py-1.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold transition-colors disabled:opacity-30 cursor-pointer min-h-[34px] flex items-center justify-center text-xs shadow-xs"
              >
                Cancel Stay
              </button>
            </div>
          </div>

          {/* Guest Information */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#047857] dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Primary Guest Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Full Name:</span>
                <span className="font-sans font-semibold text-slate-900 dark:text-white text-sm">
                  {booking.guestDetails?.fullName || 'Guest'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Mobile Number:</span>
                <span className="text-[#047857] dark:text-emerald-400 font-bold">+91 {booking.guestDetails?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Email Address:</span>
                <span className="text-slate-700 dark:text-slate-300">{booking.guestDetails?.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Booking Timestamp:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-IN') : 'Direct'}
                </span>
              </div>
            </div>
          </div>

          {/* Stay & Room Dates */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#047857] dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Stay Timeline</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Check-In:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.checkInDate}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Check-Out:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.checkOutDate}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Duration:</span>
                <span className="text-slate-800 dark:text-slate-200">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Party Size:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {booking.adults} Adults · {booking.children} Children
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200 dark:border-emerald-950 space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#047857] dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tariff & Bill Folio</span>
            </h4>
            <div className="space-y-1.5 text-xs font-mono pt-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Room Tariff ({booking.nights} nights @ {formatCurrency(booking.tariffPerNight)})</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promotional Discount:</span>
                  <span>-{formatCurrency(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST & Hospitality Taxes (18%):</span>
                <span>{formatCurrency(booking.taxesAndGst)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-emerald-950/60 flex justify-between items-baseline font-bold text-sm">
                <span className="text-slate-800 dark:text-slate-200">Total Net Folio:</span>
                <span className="font-serif text-xl text-slate-900 dark:text-white">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Payment Settlement:</span>
                <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{booking.paymentStatus === 'paid' ? 'Paid in Full' : 'Pay at Check-in'}</span>
              </div>
            </div>
          </div>

          {/* Special Requests or Admin Notes */}
          {booking.guestDetails?.specialRequests && (
            <div className="p-3.5 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200 dark:border-emerald-950 text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Guest Notes & Requests:</span>
              <p className="text-slate-700 dark:text-slate-300 italic">{booking.guestDetails.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 sm:px-6 border-t border-slate-100 dark:border-emerald-950/60 bg-slate-50 dark:bg-[#0B110E] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-2.5 sm:py-2 rounded-full bg-[#047857] hover:bg-[#065f46] text-white text-[11px] sm:text-xs font-mono uppercase font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download Tax Bill (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 sm:py-2 rounded-full bg-slate-200 dark:bg-[#1a2820] hover:bg-slate-300 dark:hover:bg-[#23352b] text-slate-800 dark:text-slate-200 border dark:border-emerald-950 text-[11px] sm:text-xs font-mono uppercase font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print Tax Bill</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-slate-200 dark:bg-[#1a2820] hover:bg-slate-300 dark:hover:bg-[#23352b] text-slate-800 dark:text-slate-200 border dark:border-emerald-950 text-xs font-mono transition-colors cursor-pointer text-center min-h-[38px] flex items-center justify-center font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminBookingDetailsModal

