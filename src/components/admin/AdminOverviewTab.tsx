import React from 'react'
import {
  CreditCard,
  Calendar,
  Bed,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
} from 'lucide-react'
import type { AdminStats, RoomConfig, BookingRecord } from '@/services/adminApi'

interface AdminOverviewTabProps {
  stats: AdminStats | null
  rooms: any[]
  recentBookings: BookingRecord[]
  onOpenWalkInModal: () => void
  onNavigateToTab: (tab: 'bookings' | 'rooms' | 'guests') => void
  onSelectBooking: (booking: BookingRecord) => void
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  rooms,
  recentBookings,
  onOpenWalkInModal,
  onNavigateToTab,
  onSelectBooking,
}) => {
  const formatCurrency = (val: number) => {
    return '₹' + (val || 0).toLocaleString('en-IN')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE KPI SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="p-5 sm:p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl relative overflow-hidden group hover:border-amber-300/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cream/70">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center text-amber-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl text-cream font-bold block">
              {formatCurrency(stats?.totalRevenue || 0)}
            </span>
            <span className="text-[11px] font-mono text-emerald-300 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Confirmed & Guaranteed Stays</span>
            </span>
          </div>
        </div>

        {/* Total Reservations */}
        <div className="p-5 sm:p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl relative overflow-hidden group hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cream/70">
              Reservations
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl text-cream font-bold block">
              {stats?.totalBookings || 0}
            </span>
            <div className="text-[11px] font-mono text-cream/70 mt-1 flex items-center gap-2">
              <span className="text-emerald-300 font-semibold">{stats?.confirmedCount || 0} Confirmed</span>
              <span>·</span>
              <span className="text-red-300">{stats?.cancelledCount || 0} Cancelled</span>
            </div>
          </div>
        </div>

        {/* Live Occupancy Rate */}
        <div className="p-5 sm:p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl relative overflow-hidden group hover:border-terracotta/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cream/70">
              Live Occupancy
            </span>
            <div className="w-9 h-9 rounded-2xl bg-terracotta/10 border border-terracotta/30 flex items-center justify-center text-terracotta-light">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl text-cream font-bold">
                {stats?.occupancyRate || 0}%
              </span>
              <span className="text-[11px] font-mono text-cream/60">of 3 Luxury Suites</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, stats?.occupancyRate || 0))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Registered Guests & Front Desk Activity */}
        <div className="p-5 sm:p-6 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl relative overflow-hidden group hover:border-amber-300/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cream/70">
              Guest Profiles
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center text-amber-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl text-cream font-bold block">
              {stats?.totalGuests || 0}
            </span>
            <div className="text-[11px] font-mono text-cream/70 mt-1 flex items-center gap-2">
              <span className="text-emerald-300">{stats?.todayCheckIns || 0} In Today</span>
              <span>·</span>
              <span className="text-amber-200">{stats?.todayCheckOuts || 0} Out Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUITES LIVE STATUS & OCCUPANCY GRID */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-cream font-semibold">
              Live Suite Inventory & Occupancy
            </h2>
            <p className="text-xs text-cream/70 font-mono">
              Real-time operational status of the 3 signature residences
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenWalkInModal}
              className="px-4 py-2 sm:py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-cream font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Walk-in Booking</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('rooms')}
              className="px-3.5 py-2 sm:py-2.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs transition-all border border-cream/20 cursor-pointer flex items-center justify-center min-h-[38px]"
            >
              <span>Manage Rooms & Rates →</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rooms.map((room) => {
            const isOccupied = room.isOccupiedToday
            const occupant = room.currentOccupant
            const opStatus = room.operationalStatus || 'available'

            const statusBadge = {
              available: {
                label: isOccupied ? 'Occupied' : 'Vacant & Available',
                bg: isOccupied ? 'bg-amber-500/20 text-amber-200 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
              },
              cleaning: {
                label: 'Housekeeping / Cleaning',
                bg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
              },
              maintenance: {
                label: 'Under Maintenance',
                bg: 'bg-red-500/20 text-red-300 border-red-400/30',
              },
            }[opStatus as 'available' | 'cleaning' | 'maintenance'] || {
              label: 'Available',
              bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
            }

            return (
              <div
                key={room.roomNumber}
                className="p-5 bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-300/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-cream">
                      Room {room.roomNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider font-semibold ${statusBadge.bg}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm text-cream/90 font-medium mt-1">
                    {room.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono text-amber-200/90 mt-2">
                    <span>Base Tariff:</span>
                    <strong className="font-bold">{formatCurrency(room.baseTariff || 5200)} / night</strong>
                  </div>

                  {/* Occupant Info if Occupied */}
                  {isOccupied && occupant && (
                    <div className="mt-3.5 p-3 bg-black/30 rounded-2xl border border-amber-300/20 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-200">
                        <span>Current Guest:</span>
                        <span className="font-bold">{occupant.guestName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-cream/60 flex items-center justify-between">
                        <span>Dates:</span>
                        <span>
                          {occupant.checkInDate} → {occupant.checkOutDate}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-cream/50 pt-1">
                        Ref: {occupant.bookingReference}
                      </div>
                    </div>
                  )}

                  {/* Housekeeping Notes */}
                  {room.housekeepingNotes && !isOccupied && (
                    <div className="mt-3 text-[11px] font-mono text-cream/60 italic bg-black/20 p-2.5 rounded-xl border border-cream/10">
                      &ldquo;{room.housekeepingNotes}&rdquo;
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-cream/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-cream/50 uppercase">Operational Status</span>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('rooms')}
                    className="text-amber-200 hover:text-white underline cursor-pointer"
                  >
                    Adjust Rate / Status
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. RECENT RESERVATIONS ACTIVITY LOG */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-cream font-semibold">
              Recent Reservations
            </h2>
            <p className="text-xs text-cream/70 font-mono">
              Latest bookings confirmed across web and front desk channels
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('bookings')}
            className="px-4 py-2 rounded-full bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs border border-cream/20 transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
          >
            <span>View All ({recentBookings.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
          </button>
        </div>

        <div className="bg-[#16251C]/80 backdrop-blur-xl border border-cream/15 rounded-3xl shadow-xl overflow-hidden">
          {recentBookings.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-cream/60">
              No reservations recorded yet in PMS.
            </div>
          ) : (
          <>
            {/* Mobile Cards (<md) */}
            <div className="md:hidden divide-y divide-cream/10">
              {recentBookings.slice(0, 6).map((booking) => {
                const isCancelled = booking.status === 'cancelled'
                const isCheckedIn = booking.status === 'checked_in'

                return (
                  <div
                    key={booking.id}
                    className="p-4 space-y-2.5 hover:bg-cream/5 transition-colors cursor-pointer"
                    onClick={() => onSelectBooking(booking)}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-200">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
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

                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <div className="font-sans font-medium text-cream">
                          {booking.guestDetails?.fullName || 'Guest'}
                        </div>
                        <div className="text-[10px] text-cream/50">
                          +91 {booking.guestDetails?.phone}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-cream">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-[10px] text-amber-200/80">
                          Room {booking.roomNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-cream/70 flex items-center justify-between pt-1 border-t border-cream/5">
                      <span>{booking.checkInDate} → {booking.checkOutDate}</span>
                      <span className="text-[10px] text-cream/50">{booking.nights}N</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/30 border-b border-cream/15 text-[10px] uppercase tracking-wider text-cream/70">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Suite</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/10 text-cream/90">
                  {recentBookings.slice(0, 6).map((booking) => {
                    const isCancelled = booking.status === 'cancelled'
                    const isCheckedIn = booking.status === 'checked_in'

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-cream/5 transition-colors cursor-pointer"
                        onClick={() => onSelectBooking(booking)}
                      >
                        <td className="py-3.5 px-4 font-bold text-amber-200">
                          {booking.bookingReference}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-medium text-cream">
                            {booking.guestDetails?.fullName || 'Guest'}
                          </div>
                          <div className="text-[10px] text-cream/50">
                            +91 {booking.guestDetails?.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          Room {booking.roomNumber}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-cream/80">
                          {booking.checkInDate} → {booking.checkOutDate} ({booking.nights}n)
                        </td>
                        <td className="py-3.5 px-4 font-bold text-cream">
                          {formatCurrency(booking.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                              isCancelled
                                ? 'bg-red-500/20 text-red-200 border-red-500/40'
                                : isCheckedIn
                                ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectBooking(booking)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream text-[11px] transition-colors"
                          >
                            Details
                          </button>
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
    </div>
  )
}

export default AdminOverviewTab

