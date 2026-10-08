import React, { useState } from 'react'
import {
  X,
  Calendar,
  Bed,
  Users,
  Download,
  Printer,
  Ban,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { generateReservationPDF, printReservationInvoice } from '@/lib/pdfBillGenerator'

interface UserBookingsModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreRooms?: () => void
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  isOpen,
  onClose,
  onExploreRooms,
}) => {
  const { user, logout, userBookings, isLoadingBookings, refreshUserBookings, cancelBooking } =
    useAuth()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCancel = async (bookingId: string, roomNumber: string) => {
    const confirm = window.confirm(
      `Are you sure you want to cancel your reservation for Room ${roomNumber}? This will release the room for other guests.`
    )
    if (!confirm) return

    setCancellingId(bookingId)
    setCancelSuccessMsg(null)

    try {
      const ok = await cancelBooking(bookingId)
      if (ok) {
        setCancelSuccessMsg(`Reservation for Room ${roomNumber} has been successfully cancelled.`)
        setTimeout(() => setCancelSuccessMsg(null), 4000)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleDownloadPDF = (booking: any) => {
    try {
      generateReservationPDF(booking)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Could not generate PDF bill. Please try printing invoice.')
    }
  }

  const handlePrint = (booking: any) => {
    try {
      printReservationInvoice(booking)
    } catch (err) {
      console.error('Failed to print invoice:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#FAF8F5] border border-[#E9E4DB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1C231E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#263D2F] via-[#B8684A] to-[#263D2F] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-[#E9E4DB] shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B8684A] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renoos Hotel Guest Portal</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#263D2F] mt-1">
              My Reservations
            </h3>
            {user && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#646E68] mt-1">
                <span className="font-medium text-[#263D2F]">Guest: {user.fullName}</span>
                <span>·</span>
                <span className="font-mono text-[#B8684A]">Mobile: +91 {user.phone}</span>
                {user.email && (
                  <>
                    <span>·</span>
                    <span>{user.email}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshUserBookings}
              disabled={isLoadingBookings}
              className="p-2 rounded-full text-[#646E68] hover:text-[#263D2F] hover:bg-black/5 transition-colors"
              title="Refresh reservations"
              aria-label="Refresh reservations"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#646E68] hover:text-[#263D2F] hover:bg-black/5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {cancelSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{cancelSuccessMsg}</span>
          </div>
        )}

        {/* Bookings List Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoadingBookings && userBookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#263D2F]/20 border-t-[#263D2F] animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#646E68]">Retrieving your reservations from PMS...</p>
            </div>
          ) : userBookings.length === 0 ? (
            <div className="py-12 sm:py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#263D2F]/5 border border-[#263D2F]/15 flex items-center justify-center mx-auto text-[#263D2F]">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#263D2F] font-semibold">
                  No Reservations Found
                </h4>
                <p className="text-xs text-[#646E68] leading-relaxed">
                  You haven&apos;t booked any suites yet under mobile number <strong>+91 {user?.phone}</strong>. Explore our luxury 360° accommodations to reserve your stay.
                </p>
              </div>

              {onExploreRooms && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onExploreRooms()
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#263D2F] text-white text-xs uppercase tracking-wider font-semibold shadow-sm hover:bg-[#1A2A20] transition-colors"
                >
                  Explore Suites & Book
                </button>
              )}
            </div>
          ) : (
            userBookings.map((booking) => {
              const isCancelled = booking.status === 'cancelled'
              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                    isCancelled
                      ? 'border-[#E9E4DB] opacity-60 bg-[#F5F2EC]'
                      : 'border-[#E9E4DB] hover:border-[#263D2F]/40 hover:shadow-warm'
                  }`}
                >
                  {/* Top strip: Booking Reference & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E4DB] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#263D2F] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E9E4DB]">
                        {booking.bookingReference}
                      </span>
                      <span className="text-[11px] text-[#8C9690] font-mono">
                        Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div>
                      {isCancelled ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono uppercase font-bold border border-red-200">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Accommodation info */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C9690] block">
                        Suite Accommodation
                      </span>
                      <div className="font-serif text-base font-semibold text-[#263D2F]">
                        Room {booking.room?.roomNumber || '201'} — {booking.room?.name || 'Deluxe Suite'}
                      </div>
                      <div className="text-[11px] text-[#646E68]">
                        {booking.room?.category || 'Luxury Accommodation'} · {booking.room?.area || 48} m²
                      </div>
                    </div>

                    {/* Stay Dates */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C9690] block">
                        Stay Period
                      </span>
                      <div className="font-medium text-[#263D2F]">
                        {booking.checkInDate} → {booking.checkOutDate}
                      </div>
                      <div className="text-[11px] text-[#646E68]">
                        {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} · {booking.adults} Adults
                        {booking.children > 0 ? `, ${booking.children} Child` : ''}
                      </div>
                    </div>

                    {/* Financial & Settlement */}
                    <div className="space-y-1 sm:text-right">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C9690] block">
                        Total Tariff
                      </span>
                      <div className="font-serif text-base font-bold text-[#263D2F]">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] font-mono text-[#646E68]">
                        {booking.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700 font-semibold">✓ Paid Online</span>
                        ) : (
                          <span className="text-[#B8684A] font-semibold">Pay at Check-in</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-[#E9E4DB] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#263D2F] border border-[#E9E4DB] text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Tax PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrint(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#263D2F] border border-[#E9E4DB] text-xs font-medium transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancel(booking.id, booking.room?.roomNumber || '201')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-medium transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5 text-red-600" />
                        <span>
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Reservation'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#E9E4DB] bg-[#FAF8F5] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              logout()
              onClose()
            }}
            className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({user?.phone})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#263D2F] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#1A2A20] transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  )
}

