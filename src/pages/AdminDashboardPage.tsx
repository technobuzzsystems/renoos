import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Bed,
  Users,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  getStoredAdminSession,
  clearAdminSession,
  fetchAdminStatsApi,
  fetchAdminBookingsApi,
  updateBookingStatusApi,
  deleteBookingApi,
  fetchAdminGuestsApi,
  fetchAdminRoomsApi,
  updateRoomConfigApi,
  type AdminSession,
  type AdminStats,
  type BookingRecord,
  type RoomConfig,
} from '@/services/adminApi'

import { AdminLoginView } from '@/components/admin/AdminLoginView'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab'
import { AdminBookingsTab } from '@/components/admin/AdminBookingsTab'
import { AdminRoomsTab } from '@/components/admin/AdminRoomsTab'
import { AdminGuestsTab } from '@/components/admin/AdminGuestsTab'
import { AdminWalkInModal } from '@/components/admin/AdminWalkInModal'
import { AdminBookingDetailsModal } from '@/components/admin/AdminBookingDetailsModal'

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()

  // 1. Session State
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession())

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'rooms' | 'guests'>('overview')

  // 3. PMS Data State
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 4. Modal States
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false)
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingRecord | null>(null)

  // Load all PMS data
  const loadPmsData = useCallback(async () => {
    if (!session) return
    setIsRefreshing(true)
    try {
      const [statsData, bookingsData, roomsData, guestsData] = await Promise.all([
        fetchAdminStatsApi().catch((err) => {
          console.warn('Failed to load stats:', err)
          return null
        }),
        fetchAdminBookingsApi().catch((err) => {
          console.warn('Failed to load bookings:', err)
          return []
        }),
        fetchAdminRoomsApi().catch((err) => {
          console.warn('Failed to load rooms:', err)
          return []
        }),
        fetchAdminGuestsApi().catch((err) => {
          console.warn('Failed to load guests:', err)
          return []
        }),
      ])

      if (statsData) setStats(statsData)
      setBookings(bookingsData)
      setRooms(roomsData)
      setGuests(guestsData)
    } finally {
      setIsRefreshing(false)
    }
  }, [session])

  useEffect(() => {
    if (session) {
      loadPmsData()
    }
  }, [session, loadPmsData])

  // Handlers
  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession)
  }

  const handleLogout = () => {
    clearAdminSession()
    setSession(null)
  }

  const handleStatusChange = async (
    bookingId: string,
    status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  ) => {
    await updateBookingStatusApi(bookingId, status)
    await loadPmsData()
    if (selectedBookingForDetails?.id === bookingId) {
      setSelectedBookingForDetails((prev: BookingRecord | null) => (prev ? { ...prev, status } : null))
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    const confirm = window.confirm(
      'Are you sure you want to permanently delete this reservation record?'
    )
    if (!confirm) return
    await deleteBookingApi(bookingId)
    await loadPmsData()
    if (selectedBookingForDetails?.id === bookingId) {
      setSelectedBookingForDetails(null)
    }
  }

  const handleUpdateRoom = async (roomNumber: string, updates: Partial<RoomConfig>) => {
    await updateRoomConfigApi(roomNumber, updates)
    await loadPmsData()
  }

  const handleFilterBookingsByGuest = (guestPhone: string) => {
    setActiveTab('bookings')
  }

  // Not logged in: Show Admin Login View
  if (!session) {
    return (
      <AdminLoginView
        onSuccess={handleLoginSuccess}
        onExit={() => navigate('/')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0E1712] text-cream flex flex-col select-none">
      {/* 1. Master Admin Header */}
      <AdminHeader
        session={session}
        onRefresh={loadPmsData}
        isRefreshing={isRefreshing}
        onLogout={handleLogout}
        onExitToWebsite={() => navigate('/')}
      />

      {/* 2. Sub-Header Navigation Tabs Bar */}
      <div className="bg-[#142018]/90 border-b border-cream/15 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-[69px] z-30 backdrop-blur-md">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-cream/15 text-xs font-mono">
          {/* Tab 1: Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-cream text-[#16251C] font-bold shadow-md'
                : 'text-cream/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {/* Tab 2: Reservations */}
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-cream text-[#16251C] font-bold shadow-md'
                : 'text-cream/70 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservations</span>
            {bookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {bookings.length}
              </span>
            )}
          </button>

          {/* Tab 3: Rooms & Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-cream text-[#16251C] font-bold shadow-md'
                : 'text-cream/70 hover:text-white'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Suites & Inventory</span>
          </button>

          {/* Tab 4: Guests CRM */}
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'guests'
                ? 'bg-cream text-[#16251C] font-bold shadow-md'
                : 'text-cream/70 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guest CRM</span>
            {guests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold">
                {guests.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Button: Quick Walk-In Reservation */}
        <button
          type="button"
          onClick={() => setIsWalkInModalOpen(true)}
          className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-cream font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Walk-in Reservation</span>
        </button>
      </div>

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            stats={stats}
            rooms={rooms}
            recentBookings={bookings}
            onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
            onNavigateToTab={(t) => setActiveTab(t)}
            onSelectBooking={(b) => setSelectedBookingForDetails(b)}
          />
        )}

        {activeTab === 'bookings' && (
          <AdminBookingsTab
            bookings={bookings}
            isLoading={isRefreshing}
            onStatusChange={handleStatusChange}
            onDeleteBooking={handleDeleteBooking}
            onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
            onSelectBooking={(b) => setSelectedBookingForDetails(b)}
            onRefresh={loadPmsData}
          />
        )}

        {activeTab === 'rooms' && (
          <AdminRoomsTab
            rooms={rooms}
            bookings={bookings}
            onUpdateRoom={handleUpdateRoom}
          />
        )}

        {activeTab === 'guests' && (
          <AdminGuestsTab
            guests={guests}
            isLoading={isRefreshing}
            onFilterBookingsByGuest={handleFilterBookingsByGuest}
          />
        )}
      </main>

      {/* 4. Modals */}
      <AdminWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={loadPmsData}
      />

      <AdminBookingDetailsModal
        booking={selectedBookingForDetails}
        isOpen={!!selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default AdminDashboardPage
