import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  CheckCircle2,
  Ban,
  Clock,
  Eye,
  Trash2,
  FileText,
  User,
  CreditCard,
  RefreshCw,
} from 'lucide-react'
import type { BookingRecord } from '@/services/adminApi'
import { generateReservationPDF, printReservationInvoice } from '@/lib/pdfBillGenerator'

interface AdminBookingsTabProps {
  bookings: BookingRecord[]
  isLoading: boolean
  onStatusChange: (
    bookingId: string,
    status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ) => Promise<void>
  onDeleteBooking: (bookingId: string) => Promise<void>
  onOpenWalkInModal: () => void
  onSelectBooking: (booking: BookingRecord) => void
  onRefresh: () => void
}

export const AdminBookingsTab: React.FC<AdminBookingsTabProps> = ({
  bookings,
  isLoading,
  onStatusChange,
  onDeleteBooking,
  onOpenWalkInModal,
  onSelectBooking,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'>('all')
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null)

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')

  // Helper to adapt BookingRecord to ConfirmedReservation for PDF / Print
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

  const handleDownloadPDF = (b: BookingRecord) => {
    try {
      generateReservationPDF(adaptToConfirmedReservation(b))
    } catch (err) {
      console.error('Failed to generate PDF bill:', err)
      alert('Could not generate PDF bill.')
    }
  }

  const handlePrint = (b: BookingRecord) => {
    try {
      printReservationInvoice(adaptToConfirmedReservation(b))
    } catch (err) {
      console.error('Failed to print invoice:', err)
    }
  }

  const handleStatusSelect = async (
    b: BookingRecord,
    newStatus: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ) => {
    if (b.status === newStatus) return
    setIsUpdatingId(b.id)
    try {
      await onStatusChange(b.id, newStatus)
    } finally {
      setIsUpdatingId(null)
    }
  }

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false
      }

      // 2. Room Filter
      if (roomFilter !== 'all' && b.roomNumber !== roomFilter && b.roomId !== roomFilter) {
        return false
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = b.guestDetails?.fullName?.toLowerCase().includes(q)
        const matchPhone = b.guestDetails?.phone?.includes(q)
        const matchEmail = b.guestDetails?.email?.toLowerCase().includes(q)
        const matchRef = b.bookingReference?.toLowerCase().includes(q)
        const matchRoom = b.roomNumber?.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchEmail && !matchRef && !matchRoom) {
          return false
        }
      }

      return true
    })
  }, [bookings, statusFilter, roomFilter, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search / Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-cream font-semibold">
            All Reservations & PMS Folios
          </h2>
          <p className="text-xs text-cream/70 font-mono">
            Manage confirmed stays, check-ins, check-outs, and official tax bills
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenWalkInModal}
            className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-cream font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in Reservation</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream border border-cream/20 transition-all cursor-pointer"
            title="Refresh list"
            aria-label="Refresh reservations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cream/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Guest Name, Mobile, Email or Ref (e.g. 2026-13196)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-cream/20 rounded-2xl text-xs font-mono text-cream placeholder-cream/40 focus:outline-none focus:border-amber-300/80"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream/60 hover:text-cream"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-cream/15">
            {(['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl uppercase text-[10px] font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-cream text-[#16251C] shadow-sm'
                      : 'text-cream/70 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          {/* Room Filter */}
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-cream/15 rounded-xl text-xs font-mono text-cream focus:outline-none"
          >
            <option value="all">All Suites (201-203)</option>
            <option value="201">Room 201 — Forest Suite</option>
            <option value="202">Room 202 — Mountain View</option>
            <option value="203">Room 203 — Executive Suite</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl overflow-hidden">
        {isLoading && bookings.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-cream/70">Syncing reservations with Renoos Hotel PMS...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileText className="w-8 h-8 text-cream/40 mx-auto" />
            <h4 className="font-serif text-base text-cream font-medium">No Reservations Found</h4>
            <p className="text-xs font-mono text-cream/60">
              {searchQuery || statusFilter !== 'all' || roomFilter !== 'all'
                ? 'Try adjusting your search criteria or filter options.'
                : 'No bookings in database. Use "New Walk-in Reservation" to add one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/40 border-b border-cream/15 text-[10px] uppercase tracking-wider text-cream/70">
                <tr>
                  <th className="py-3 px-4">Ref & Created</th>
                  <th className="py-3 px-4">Guest Information</th>
                  <th className="py-3 px-4">Suite</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/10 text-cream/90">
                {filteredBookings.map((b) => {
                  const isCancelled = b.status === 'cancelled'
                  const isCheckedIn = b.status === 'checked_in'
                  const isCheckedOut = b.status === 'checked_out'

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-cream/5 transition-colors group"
                    >
                      {/* Booking Ref */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-amber-200">
                          {b.bookingReference}
                        </div>
                        <div className="text-[10px] text-cream/50 mt-0.5">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'Direct'}
                        </div>
                      </td>

                      {/* Guest Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-sans font-semibold text-cream text-sm">
                          {b.guestDetails?.fullName || 'Guest'}
                        </div>
                        <div className="text-[11px] text-amber-200/80 font-mono">
                          +91 {b.guestDetails?.phone}
                        </div>
                        {b.guestDetails?.email && (
                          <div className="text-[10px] text-cream/50 truncate max-w-[180px]">
                            {b.guestDetails.email}
                          </div>
                        )}
                      </td>

                      {/* Room */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-serif font-bold text-cream">
                          Room {b.roomNumber}
                        </div>
                        <div className="text-[10px] text-cream/60 truncate max-w-[140px]">
                          {b.roomName}
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-4 px-4 align-top">
                        <div className="text-[11px] text-cream font-medium">
                          {b.checkInDate} → {b.checkOutDate}
                        </div>
                        <div className="text-[10px] text-cream/60 mt-0.5">
                          {b.nights} {b.nights === 1 ? 'Night' : 'Nights'} · {b.adults} Ad / {b.children} Ch
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-cream text-sm">
                          {formatCurrency(b.totalAmount)}
                        </div>
                        <div className="text-[10px] text-cream/50 capitalize">
                          {b.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Check-in'}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          <select
                            value={b.status}
                            disabled={isUpdatingId === b.id}
                            onChange={(e) =>
                              handleStatusSelect(
                                b,
                                e.target.value as 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
                              )
                            }
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase border cursor-pointer focus:outline-none ${
                              isCancelled
                                ? 'bg-red-500/20 text-red-200 border-red-500/40'
                                : isCheckedIn
                                ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                                : isCheckedOut
                                ? 'bg-gray-500/20 text-gray-300 border-gray-400/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            <option value="confirmed" className="bg-[#16251C] text-emerald-300">
                              Confirmed
                            </option>
                            <option value="checked_in" className="bg-[#16251C] text-blue-300">
                              Checked In
                            </option>
                            <option value="checked_out" className="bg-[#16251C] text-gray-300">
                              Checked Out
                            </option>
                            <option value="cancelled" className="bg-[#16251C] text-red-300">
                              Cancelled (Release Room)
                            </option>
                          </select>

                          {isUpdatingId === b.id && (
                            <span className="block text-[9px] text-amber-200 animate-pulse">
                              Syncing status...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Document Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details */}
                          <button
                            type="button"
                            onClick={() => onSelectBooking(b)}
                            className="p-1.5 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream transition-colors"
                            title="Inspect Reservation Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF Tax Bill */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(b)}
                            className="p-1.5 rounded-lg bg-terracotta/80 hover:bg-terracotta text-cream transition-colors"
                            title="Download PDF Tax Bill"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Invoice */}
                          <button
                            type="button"
                            onClick={() => handlePrint(b)}
                            className="p-1.5 rounded-lg bg-cream/15 hover:bg-cream/25 text-cream transition-colors"
                            title="Print Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete permanently */}
                          <button
                            type="button"
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-200 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookingsTab

