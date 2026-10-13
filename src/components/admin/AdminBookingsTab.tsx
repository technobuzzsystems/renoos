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
  Calendar,
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
  const [dateFilter, setDateFilter] = useState<string>('')
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

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No reservations found matching the current filters.')
      return
    }

    const headers = [
      'Booking Reference',
      'Room Number',
      'Room Name',
      'Guest Name',
      'Phone',
      'Email',
      'Check-In Date',
      'Check-Out Date',
      'Nights',
      'Adults',
      'Children',
      'Tariff Per Night',
      'Subtotal',
      'Discount',
      'Taxes & GST',
      'Total Amount',
      'Payment Status',
      'Payment Method',
      'Reservation Status',
      'Special Requests',
      'Created At',
    ]

    const sanitizeCell = (val: any) => {
      if (val === null || val === undefined) return '""'
      let str = String(val).trim()
      // Mitigate CSV Formula Injection (=, +, -, @, \t, \r)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`
      }
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = filteredBookings.map((b) => [
      sanitizeCell(b.bookingReference),
      sanitizeCell(b.roomNumber),
      sanitizeCell(b.roomName),
      sanitizeCell(b.guestDetails?.fullName),
      sanitizeCell(b.guestDetails?.phone),
      sanitizeCell(b.guestDetails?.email),
      sanitizeCell(b.checkInDate),
      sanitizeCell(b.checkOutDate),
      sanitizeCell(b.nights),
      sanitizeCell(b.adults),
      sanitizeCell(b.children),
      sanitizeCell(b.tariffPerNight),
      sanitizeCell(b.subtotal),
      sanitizeCell(b.discount),
      sanitizeCell(b.taxesAndGst),
      sanitizeCell(b.totalAmount),
      sanitizeCell(b.paymentStatus),
      sanitizeCell(b.paymentMethod),
      sanitizeCell(b.status),
      sanitizeCell(b.guestDetails?.specialRequests || ''),
      sanitizeCell(b.createdAt),
    ])

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `renoos-hotel-bookings-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

      // 3. Date Filter (Check if stay spans or matches date)
      if (dateFilter) {
        if (b.checkInDate > dateFilter || b.checkOutDate < dateFilter) {
          return false
        }
      }

      // 4. Search Query
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
  }, [bookings, statusFilter, roomFilter, dateFilter, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search / Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-slate-900 dark:text-white font-semibold">
            All Reservations & PMS Folios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Manage confirmed stays, check-ins, check-outs, and official tax bills
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenWalkInModal}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-full bg-[#047857] hover:bg-[#065f46] text-white font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-700/20 cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in Reservation</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-full bg-slate-100 dark:bg-[#131D17] hover:bg-slate-200/80 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-950/80 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px]"
            title="Export filtered reservations to CSV"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-[#131D17] hover:bg-slate-200/80 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-950/80 transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
            title="Refresh list"
            aria-label="Refresh reservations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#047857]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Guest Name, Mobile, Email or Ref (e.g. 2026-13196)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B110E] border border-slate-200 dark:border-emerald-950 rounded-2xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#0B110E] focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 text-xs font-mono w-full md:w-auto">
          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0B110E] p-1 rounded-2xl border border-slate-200/70 dark:border-emerald-950/70 overflow-x-auto no-scrollbar touch-pan-x w-full sm:w-auto shrink-0">
            {(['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-xl uppercase text-[10px] font-bold transition-all shrink-0 whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#047857] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            {/* Stay Date Filter */}
            <div className="flex items-center justify-between xs:justify-start gap-1.5 bg-slate-50 dark:bg-[#0B110E] px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-950 text-xs font-mono">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none cursor-pointer w-full"
                  title="Filter by stay date"
                />
              </div>
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                  title="Clear date filter"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Room Filter */}
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#0B110E] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Suites (201-205)</option>
              <option value="201">Room 201 — Forest</option>
              <option value="202">Room 202 — Mountain</option>
              <option value="203">Room 203 — Executive</option>
              <option value="204">Room 204 — Royal Horizon</option>
              <option value="205">Room 205 — Bohemian Suite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        {isLoading && bookings.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-[#047857] animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Syncing reservations with Renoos Hotel PMS...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="font-serif text-base text-slate-800 dark:text-slate-200 font-medium">No Reservations Found</h4>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== 'all' || roomFilter !== 'all'
                ? 'Try adjusting your search criteria or filter options.'
                : 'No bookings in database. Use "New Walk-in Reservation" to add one.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (Visible on <md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-emerald-950/60">
              {filteredBookings.map((b) => {
                const isCancelled = b.status === 'cancelled'
                const isCheckedIn = b.status === 'checked_in'
                const isCheckedOut = b.status === 'checked_out'

                return (
                  <div key={b.id} className="p-4 space-y-3">
                    {/* Top line: Reference + Status selector */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#047857] dark:text-emerald-400 text-xs block">
                          {b.bookingReference}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'Direct'}
                        </span>
                      </div>

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
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                            : isCheckedIn
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                            : isCheckedOut
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                        }`}
                      >
                        <option value="confirmed" className="bg-white dark:bg-[#131D17] text-emerald-700 dark:text-emerald-300">
                          Confirmed
                        </option>
                        <option value="checked_in" className="bg-white dark:bg-[#131D17] text-blue-700 dark:text-blue-300">
                          Checked In
                        </option>
                        <option value="checked_out" className="bg-white dark:bg-[#131D17] text-slate-700 dark:text-slate-300">
                          Checked Out
                        </option>
                        <option value="cancelled" className="bg-white dark:bg-[#131D17] text-rose-700 dark:text-rose-300">
                          Cancelled
                        </option>
                      </select>
                    </div>

                    {/* Guest info */}
                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <div className="font-sans font-semibold text-slate-900 dark:text-white text-sm">
                          {b.guestDetails?.fullName || 'Guest'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          +91 {b.guestDetails?.phone}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {formatCurrency(b.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                          {b.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Hotel'}
                        </div>
                      </div>
                    </div>

                    {/* Room and Dates */}
                    <div className="p-2.5 bg-slate-50 dark:bg-[#0B110E] border border-slate-100 dark:border-emerald-950/60 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-serif font-bold text-slate-900 dark:text-white">Room {b.roomNumber} ({b.roomName})</span>
                        <span className="text-slate-500 dark:text-slate-400">{b.nights} {b.nights === 1 ? 'Night' : 'Nights'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>{b.checkInDate} → {b.checkOutDate}</span>
                        <span>{b.adults} Ad / {b.children} Ch</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B110E] hover:bg-slate-200 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 min-h-[34px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#047857] hover:bg-[#065f46] text-white text-[11px] flex items-center gap-1 min-h-[34px] shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B110E] hover:bg-slate-200 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 min-h-[34px]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteBooking(b.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 hover:text-rose-700 min-h-[34px] min-w-[34px] flex items-center justify-center transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table (Visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50/80 dark:bg-[#0B110E]/80 border-b border-slate-200/80 dark:border-emerald-950/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60 text-slate-800 dark:text-slate-200">
                  {filteredBookings.map((b) => {
                    const isCancelled = b.status === 'cancelled'
                    const isCheckedIn = b.status === 'checked_in'
                    const isCheckedOut = b.status === 'checked_out'

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#0B110E]/60 transition-colors group"
                      >
                        {/* Booking Ref */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-[#047857] dark:text-emerald-400">
                            {b.bookingReference}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'Direct'}
                          </div>
                        </td>

                        {/* Guest Details */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-sans font-semibold text-slate-900 dark:text-white text-sm">
                            {b.guestDetails?.fullName || 'Guest'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            +91 {b.guestDetails?.phone}
                          </div>
                          {b.guestDetails?.email && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {b.guestDetails.email}
                            </div>
                          )}
                        </td>

                        {/* Room */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-serif font-bold text-slate-900 dark:text-white">
                            Room {b.roomNumber}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {b.roomName}
                          </div>
                        </td>

                        {/* Stay Dates */}
                        <td className="py-4 px-4 align-top">
                          <div className="text-[11px] text-slate-900 dark:text-white font-medium">
                            {b.checkInDate} → {b.checkOutDate}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {b.nights} {b.nights === 1 ? 'Night' : 'Nights'} · {b.adults} Ad / {b.children} Ch
                          </div>
                        </td>

                        {/* Financials */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {formatCurrency(b.totalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
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
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                                  : isCheckedIn
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                                  : isCheckedOut
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                              }`}
                            >
                              <option value="confirmed" className="bg-white dark:bg-[#131D17] text-emerald-700 dark:text-emerald-300">
                                Confirmed
                              </option>
                              <option value="checked_in" className="bg-white dark:bg-[#131D17] text-blue-700 dark:text-blue-300">
                                Checked In
                              </option>
                              <option value="checked_out" className="bg-white dark:bg-[#131D17] text-slate-700 dark:text-slate-300">
                                Checked Out
                              </option>
                              <option value="cancelled" className="bg-white dark:bg-[#131D17] text-rose-700 dark:text-rose-300">
                                Cancelled (Release Room)
                              </option>
                            </select>

                            {isUpdatingId === b.id && (
                              <span className="block text-[9px] text-[#047857] dark:text-emerald-400 animate-pulse">
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
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0B110E] hover:bg-slate-200 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 transition-colors"
                              title="Inspect Reservation Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* PDF Tax Bill */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(b)}
                              className="p-1.5 rounded-lg bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-colors"
                              title="Download PDF Tax Bill"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Invoice */}
                            <button
                              type="button"
                              onClick={() => handlePrint(b)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0B110E] hover:bg-slate-200 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 transition-colors"
                              title="Print Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete permanently */}
                            <button
                              type="button"
                              onClick={() => onDeleteBooking(b.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 hover:text-rose-700 transition-colors"
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
          </>
        )}
      </div>
    </div>
  )
}

export default AdminBookingsTab

