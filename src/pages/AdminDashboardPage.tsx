import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStoredAdminSession,
  clearAdminSession,
  adminLogoutApi,
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
import { AdminSidebarRail, type AdminTabType } from '@/components/admin/AdminSidebarRail'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { AdminReferenceDashboard } from '@/components/admin/AdminReferenceDashboard'
import { AdminBookingsTab } from '@/components/admin/AdminBookingsTab'
import { AdminRoomsTab } from '@/components/admin/AdminRoomsTab'
import { AdminGuestsTab } from '@/components/admin/AdminGuestsTab'
import { AdminFinancialsTab } from '@/components/admin/AdminFinancialsTab'
import { AdminWalkInModal } from '@/components/admin/AdminWalkInModal'
import { AdminBookingDetailsModal } from '@/components/admin/AdminBookingDetailsModal'
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette'
import { AdminThemeProvider, useAdminTheme } from '@/context/AdminThemeContext'

const AdminDashboardInner: React.FC = () => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useAdminTheme()

  // 1. Session State
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession())

  // 2. Active Tab State ('overview' matches the reference image bento grid)
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview')

  // 4. PMS Data State
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 5. Modal States
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
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

      // If token expired during requests, authFetch cleared stored session
      if (!getStoredAdminSession()) {
        setSession(null)
        return
      }

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

  // Global Keyboard listener for Command Palette (Cmd+K / Ctrl+K / Cmd+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'Space')) {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handlers
  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession)
  }

  const handleLogout = async () => {
    try {
      await adminLogoutApi()
    } finally {
      setSession(null)
    }
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
    <div
      className={`h-[100dvh] max-h-[100dvh] select-none font-sans overflow-hidden flex flex-col md:flex-row relative transition-colors duration-300 ${
        isDark ? 'dark bg-[#0B110E] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
      }`}
    >
      {/* Subtle Fresh Emerald Ambient Lighting Glow Orbs */}
      <div
        className={`fixed top-0 left-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none z-0 transition-opacity duration-500 ${
          isDark ? 'bg-emerald-500/[0.08]' : 'bg-emerald-400/[0.04]'
        }`}
      />
      <div
        className={`fixed bottom-0 right-1/4 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none z-0 transition-opacity duration-500 ${
          isDark ? 'bg-teal-500/[0.06]' : 'bg-teal-400/[0.03]'
        }`}
      />

      {/* 1. Left Vertical Sidebar Rail Dock */}
      <AdminSidebarRail
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        bookingsCount={bookings.length}
        guestsCount={guests.length}
        onExitToWebsite={() => navigate('/')}
        onOpenSettings={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. Main App Canvas (Top Bar + Dynamic View Container) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 z-10 w-full h-full overflow-hidden">
        {/* Top Header Bar (Fixed on spot - never moves) */}
        <AdminTopBar
          session={session}
          bookings={bookings}
          isRefreshing={isRefreshing}
          onRefresh={loadPmsData}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onLogout={handleLogout}
          onExitToWebsite={() => navigate('/')}
          onSelectBooking={(b) => setSelectedBookingForDetails(b)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Viewport Container (Right content moves and scrolls smoothly) */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-7 max-w-full pb-24 md:pb-12 [scrollbar-gutter:stable]">
          {activeTab === 'overview' && (
            <AdminReferenceDashboard
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
              onSelectBooking={(b) => setSelectedBookingForDetails(b)}
            />
          )}

          {activeTab === 'guests' && (
            <AdminGuestsTab
              guests={guests}
              isLoading={isRefreshing}
              onFilterBookingsByGuest={handleFilterBookingsByGuest}
            />
          )}

          {activeTab === 'financials' && (
            <AdminFinancialsTab
              stats={stats}
              bookings={bookings}
              onOpenWalkInModal={() => setIsWalkInModalOpen(true)}
              onSelectBooking={(b) => setSelectedBookingForDetails(b)}
            />
          )}
        </main>
      </div>

      {/* 3. Global Command Palette Modal (⌘ + Space / ⌘K) */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenWalkIn={() => setIsWalkInModalOpen(true)}
        onNavigateToTab={(t) => setActiveTab(t)}
        onRefresh={loadPmsData}
        onExitToWebsite={() => navigate('/')}
        bookings={bookings}
        onSelectBooking={(b) => setSelectedBookingForDetails(b)}
      />

      {/* 4. Front Desk Walk-In Reservation Modal */}
      <AdminWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={loadPmsData}
      />

      {/* 5. Booking Details & Folio Tax Bill Modal */}
      <AdminBookingDetailsModal
        booking={selectedBookingForDetails}
        isOpen={!!selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export const AdminDashboardPage: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminDashboardInner />
    </AdminThemeProvider>
  )
}

export default AdminDashboardPage
