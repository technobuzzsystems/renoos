export interface BookingRecord {
  id: string
  bookingReference: string
  createdAt: string
  userId?: string
  roomId: string
  roomNumber: string
  roomName: string
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  nights: number
  adults: number
  children: number
  tariffPerNight: number
  subtotal: number
  discount: number
  taxesAndGst: number
  totalAmount: number
  status: 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
  guestDetails: {
    fullName: string
    email: string
    phone: string
    specialRequests?: string
  }
  paymentMethod: string
  paymentStatus: 'paid' | 'pay_at_checkin'
  notes?: string
}

export interface RoomConfig {
  roomNumber: string
  name: string
  baseTariff: number
  operationalStatus: 'available' | 'cleaning' | 'maintenance'
  housekeepingNotes?: string
}

export interface AdminStats {
  totalRevenue: number
  totalBookings: number
  confirmedCount: number
  checkedInCount: number
  checkedOutCount: number
  cancelledCount: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  totalGuests: number
}

const ADMIN_STORAGE_KEY = 'renoos_hotel_admin_session'

export interface AdminSession {
  token: string
  name: string
  role: string
  loginTime: string
}

export function getStoredAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAdminSession(session: AdminSession): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Authenticate with the Admin Passcode
 */
export async function adminLoginApi(passcode: string): Promise<AdminSession> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Invalid administrator passcode')
  }

  const session: AdminSession = {
    token: data.token,
    name: data.admin?.name || 'General Manager',
    role: data.admin?.role || 'Super Admin',
    loginTime: new Date().toISOString(),
  }

  saveAdminSession(session)
  return session
}

/**
 * Fetch executive PMS stats
 */
export async function fetchAdminStatsApi(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch PMS statistics')
  }
  return data.stats
}

/**
 * Fetch all reservations with optional filters
 */
export async function fetchAdminBookingsApi(filters?: {
  status?: string
  room?: string
  q?: string
}): Promise<BookingRecord[]> {
  const params = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters?.room && filters.room !== 'all') params.set('room', filters.room)
  if (filters?.q) params.set('q', filters.q)

  const url = `/api/admin/bookings${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch reservations')
  }
  return data.bookings || []
}

/**
 * Update reservation status (confirmed, checked_in, checked_out, cancelled)
 */
export async function updateBookingStatusApi(
  id: string,
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled',
  notes?: string
): Promise<BookingRecord> {
  const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update reservation status')
  }
  return data.booking
}

/**
 * Delete / Remove booking permanently
 */
export async function deleteBookingApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const data = await res.json().catch(() => ({}))
  return res.ok && data.success === true
}

/**
 * Fetch all registered guests & CRM records
 */
export async function fetchAdminGuestsApi(): Promise<any[]> {
  const res = await fetch('/api/admin/guests', {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch guest directory')
  }
  return data.guests || []
}

/**
 * Fetch all rooms configurations & live occupancy state
 */
export async function fetchAdminRoomsApi(): Promise<any[]> {
  const res = await fetch('/api/admin/rooms', {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch room configurations')
  }
  return data.rooms || []
}

/**
 * Update room operational status, tariff, or housekeeping notes
 */
export async function updateRoomConfigApi(
  roomNumber: string,
  updates: Partial<RoomConfig>
): Promise<RoomConfig> {
  const res = await fetch(`/api/admin/rooms/${encodeURIComponent(roomNumber)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update room configuration')
  }
  return data.room
}

/**
 * Create a walk-in / manual front desk booking
 */
export async function createAdminWalkInBookingApi(payload: any): Promise<BookingRecord> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create reservation')
  }
  return data.booking || data.reservation
}
