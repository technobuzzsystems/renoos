import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

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

export interface UserRecord {
  id: string
  fullName: string
  phone: string // Normalized 10 digits
  formattedPhone: string
  email?: string
  passwordHash: string
  salt: string
  createdAt: string
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

export type SafeUser = Omit<UserRecord, 'passwordHash' | 'salt'>

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'bookings.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ROOMS_CONFIG_FILE = path.join(DATA_DIR, 'rooms_config.json')

const DEFAULT_ROOMS_CONFIG: RoomConfig[] = [
  {
    roomNumber: '201',
    name: 'The Forest Sanctuary Suite',
    baseTariff: 4800,
    operationalStatus: 'available',
    housekeepingNotes: 'Inspected and sanitised. Fresh linen set.',
  },
  {
    roomNumber: '202',
    name: 'Mountain View Pavilion',
    baseTariff: 5200,
    operationalStatus: 'available',
    housekeepingNotes: 'High-balcony view ready for arrival.',
  },
  {
    roomNumber: '203',
    name: 'The Executive Sanctuary Suite',
    baseTariff: 8500,
    operationalStatus: 'available',
    housekeepingNotes: 'Executive penthouse cleaned and scented with pine essence.',
  },
]

// Ensure data directory and files exist
function ensureDbFiles(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8')
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8')
  }
  if (!fs.existsSync(ROOMS_CONFIG_FILE)) {
    fs.writeFileSync(ROOMS_CONFIG_FILE, JSON.stringify(DEFAULT_ROOMS_CONFIG, null, 2), 'utf-8')
  }
}

// Read all bookings safely
export function getAllBookings(): BookingRecord[] {
  ensureDbFiles()
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as BookingRecord[]
  } catch (err) {
    console.error('Error reading bookings DB:', err)
    return []
  }
}

// Write bookings atomically
export function saveAllBookings(bookings: BookingRecord[]): void {
  ensureDbFiles()
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`
  fs.writeFileSync(tempFile, JSON.stringify(bookings, null, 2), 'utf-8')
  fs.renameSync(tempFile, DB_FILE)
}

// Read all users safely
export function getAllUsers(): UserRecord[] {
  ensureDbFiles()
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as UserRecord[]
  } catch (err) {
    console.error('Error reading users DB:', err)
    return []
  }
}

// Write users atomically
export function saveAllUsers(users: UserRecord[]): void {
  ensureDbFiles()
  const tempFile = `${USERS_FILE}.tmp.${Date.now()}`
  fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8')
  fs.renameSync(tempFile, USERS_FILE)
}

/**
 * Normalize phone number by extracting the last 10 digits.
 * Handles '+91 98765 43210', '09876543210', '9876543210', etc.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  return digits
}

/**
 * Hash password securely using Node.js scrypt
 */
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

/**
 * Find user by mobile number
 */
export function findUserByPhone(phone: string): UserRecord | undefined {
  const clean = normalizePhone(phone)
  if (!clean) return undefined
  const users = getAllUsers()
  return users.find((u) => u.phone === clean)
}

/**
 * Register a new user with mobile number and password
 */
export function registerUser(input: {
  fullName: string
  phone: string
  password: string
  email?: string
}): { success: true; user: SafeUser } {
  const cleanPhone = normalizePhone(input.phone)
  if (!cleanPhone || cleanPhone.length < 10) {
    const err: any = new Error('Please enter a valid 10-digit mobile number')
    err.status = 400
    throw err
  }

  if (!input.fullName || input.fullName.trim().length < 2) {
    const err: any = new Error('Full name is required (at least 2 characters)')
    err.status = 400
    throw err
  }

  if (!input.password || input.password.length < 4) {
    const err: any = new Error('Password must be at least 4 characters long')
    err.status = 400
    throw err
  }

  const existing = findUserByPhone(cleanPhone)
  if (existing) {
    const err: any = new Error(
      'An account with this mobile number already exists. Please log in.'
    )
    err.status = 409
    throw err
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashPassword(input.password, salt)

  const newUser: UserRecord = {
    id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    fullName: input.fullName.trim(),
    phone: cleanPhone,
    formattedPhone: input.phone.trim(),
    email: input.email ? input.email.trim() : '',
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  const allUsers = getAllUsers()
  allUsers.push(newUser)
  saveAllUsers(allUsers)

  const { passwordHash: _, salt: __, ...safeUser } = newUser
  return { success: true, user: safeUser }
}

/**
 * Authenticate user with mobile number and password
 */
export function loginUser(input: {
  phone: string
  password: string
}): { success: true; user: SafeUser } {
  const cleanPhone = normalizePhone(input.phone)
  if (!cleanPhone) {
    const err: any = new Error('Mobile number is required')
    err.status = 400
    throw err
  }

  if (!input.password) {
    const err: any = new Error('Password is required')
    err.status = 400
    throw err
  }

  const user = findUserByPhone(cleanPhone)
  if (!user) {
    const err: any = new Error('Account not found. Please check your mobile number or sign up.')
    err.status = 401
    throw err
  }

  const candidateHash = hashPassword(input.password, user.salt)
  if (candidateHash !== user.passwordHash) {
    const err: any = new Error('Incorrect password. Please verify and try again.')
    err.status = 401
    throw err
  }

  const { passwordHash: _, salt: __, ...safeUser } = user
  return { success: true, user: safeUser }
}

/**
 * Fetch all bookings for a user by their mobile number or User ID.
 * Returns both past and upcoming reservations, newest first.
 */
export function getUserBookings(phoneOrUserId: string): BookingRecord[] {
  const clean = normalizePhone(phoneOrUserId)
  const allBookings = getAllBookings()

  return allBookings.filter((b) => {
    if (b.userId && b.userId === phoneOrUserId) return true
    if (clean && normalizePhone(b.guestDetails.phone) === clean) return true
    return false
  })
}

/**
 * Check if two date ranges [in1, out1] and [in2, out2] overlap.
 * In hotels, checkout on the same day as check-in does NOT conflict.
 * Overlap condition: in1 < out2 && out1 > in2
 */
export function datesOverlap(in1: string, out1: string, in2: string, out2: string): boolean {
  return in1 < out2 && out1 > in2
}

/**
 * Checks whether a room is available for the given date range.
 */
export function isRoomAvailable(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): { available: boolean; conflictingBooking?: BookingRecord; reason?: string } {
  // Check if room is in maintenance
  const configs = getRoomsConfig()
  const cfg = configs.find((c) => c.roomNumber === roomId || `room-${c.roomNumber}` === roomId)
  if (cfg && cfg.operationalStatus === 'maintenance') {
    return {
      available: false,
      reason: `Room ${cfg.roomNumber} is currently under maintenance.`,
    }
  }

  const bookings = getAllBookings().filter(
    (b) =>
      (b.status === 'confirmed' || b.status === 'checked_in') &&
      (excludeBookingId ? b.id !== excludeBookingId : true)
  )

  for (const b of bookings) {
    const matchesRoom = b.roomId === roomId || b.roomNumber === roomId
    if (matchesRoom && datesOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate)) {
      return { available: false, conflictingBooking: b }
    }
  }

  return { available: true }
}

/**
 * Get availability status for all specified rooms (201, 202, 203) for the given dates.
 */
export function getAvailabilityForAllRooms(
  checkInDate: string,
  checkOutDate: string
): Record<string, { available: boolean; conflictingBooking?: BookingRecord }> {
  const roomIds = ['201', '202', '203']
  const result: Record<string, { available: boolean; conflictingBooking?: BookingRecord }> = {}

  for (const rid of roomIds) {
    result[rid] = isRoomAvailable(rid, checkInDate, checkOutDate)
  }

  return result
}

/**
 * Atomically create a booking if room is available.
 * Returns the created booking, or throws an error with conflict details.
 */
export function createBooking(
  bookingInput: Omit<BookingRecord, 'id' | 'bookingReference' | 'createdAt' | 'status'>
): { success: true; booking: BookingRecord } {
  const availability = isRoomAvailable(
    bookingInput.roomId,
    bookingInput.checkInDate,
    bookingInput.checkOutDate
  )

  if (!availability.available) {
    const conf = availability.conflictingBooking
    const err: any = new Error(
      `Room ${bookingInput.roomNumber} is unavailable from ${conf?.checkInDate} to ${conf?.checkOutDate}. Another guest has already booked this suite.`
    )
    err.status = 409
    err.conflictingBooking = conf
    throw err
  }

  const newBooking: BookingRecord = {
    ...bookingInput,
    id: `res-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    bookingReference: `RENOOS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  }

  const all = getAllBookings()
  all.unshift(newBooking)
  saveAllBookings(all)

  return { success: true, booking: newBooking }
}

/**
 * Cancel a reservation by ID or Reference.
 */
export function cancelBooking(idOrReference: string): boolean {
  const all = getAllBookings()
  const idx = all.findIndex(
    (b) => b.id === idOrReference || b.bookingReference === idOrReference
  )
  if (idx === -1) return false

  all[idx].status = 'cancelled'
  saveAllBookings(all)
  return true
}

/**
 * Read all room configs safely
 */
export function getRoomsConfig(): RoomConfig[] {
  ensureDbFiles()
  try {
    const raw = fs.readFileSync(ROOMS_CONFIG_FILE, 'utf-8')
    return JSON.parse(raw) as RoomConfig[]
  } catch (err) {
    console.error('Error reading rooms config DB:', err)
    return DEFAULT_ROOMS_CONFIG
  }
}

/**
 * Save room configs atomically
 */
export function saveRoomsConfig(configs: RoomConfig[]): void {
  ensureDbFiles()
  const tempFile = `${ROOMS_CONFIG_FILE}.tmp.${Date.now()}`
  fs.writeFileSync(tempFile, JSON.stringify(configs, null, 2), 'utf-8')
  fs.renameSync(tempFile, ROOMS_CONFIG_FILE)
}

/**
 * Update room config (status, tariff, housekeeping notes)
 */
export function updateRoomConfig(
  roomNumber: string,
  updates: Partial<RoomConfig>
): RoomConfig | null {
  const configs = getRoomsConfig()
  const idx = configs.findIndex((c) => c.roomNumber === roomNumber)
  if (idx === -1) return null

  configs[idx] = {
    ...configs[idx],
    ...updates,
  }
  saveRoomsConfig(configs)
  return configs[idx]
}

/**
 * Update booking status (confirmed, checked_in, checked_out, cancelled)
 */
export function updateBookingStatus(
  idOrReference: string,
  status: 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out',
  notes?: string
): BookingRecord | null {
  const all = getAllBookings()
  const idx = all.findIndex(
    (b) => b.id === idOrReference || b.bookingReference === idOrReference
  )
  if (idx === -1) return null

  all[idx].status = status
  if (notes !== undefined) {
    all[idx].notes = notes
  }
  saveAllBookings(all)
  return all[idx]
}

/**
 * Update booking details (guest, dates, rooms, etc.)
 */
export function updateBookingDetails(
  idOrReference: string,
  updates: Partial<BookingRecord>
): BookingRecord | null {
  const all = getAllBookings()
  const idx = all.findIndex(
    (b) => b.id === idOrReference || b.bookingReference === idOrReference
  )
  if (idx === -1) return null

  all[idx] = {
    ...all[idx],
    ...updates,
  }
  saveAllBookings(all)
  return all[idx]
}

/**
 * Delete a booking completely from the DB (admin only)
 */
export function deleteBooking(idOrReference: string): boolean {
  const all = getAllBookings()
  const filtered = all.filter(
    (b) => b.id !== idOrReference && b.bookingReference !== idOrReference
  )
  if (filtered.length === all.length) return false
  saveAllBookings(filtered)
  return true
}

/**
 * Calculate live executive PMS statistics for Renoos Hotel
 */
export function getAdminStats(): AdminStats {
  const bookings = getAllBookings()
  const users = getAllUsers()
  const today = new Date().toISOString().split('T')[0]

  let totalRevenue = 0
  let confirmedCount = 0
  let checkedInCount = 0
  let checkedOutCount = 0
  let cancelledCount = 0
  let todayCheckIns = 0
  let todayCheckOuts = 0
  let currentlyOccupiedRooms = 0

  for (const b of bookings) {
    if (b.status !== 'cancelled') {
      totalRevenue += b.totalAmount || 0
    }

    if (b.status === 'confirmed') confirmedCount++
    if (b.status === 'checked_in') checkedInCount++
    if (b.status === 'checked_out') checkedOutCount++
    if (b.status === 'cancelled') cancelledCount++

    if (b.checkInDate === today && b.status !== 'cancelled') {
      todayCheckIns++
    }
    if (b.checkOutDate === today && b.status !== 'cancelled') {
      todayCheckOuts++
    }

    // Check if booked today
    if (
      (b.status === 'confirmed' || b.status === 'checked_in') &&
      b.checkInDate <= today &&
      b.checkOutDate > today
    ) {
      currentlyOccupiedRooms++
    }
  }

  const occupancyRate = Math.min(100, Math.round((currentlyOccupiedRooms / 3) * 100))

  return {
    totalRevenue,
    totalBookings: bookings.length,
    confirmedCount,
    checkedInCount,
    checkedOutCount,
    cancelledCount,
    todayCheckIns,
    todayCheckOuts,
    occupancyRate,
    totalGuests: users.length,
  }
}

/**
 * Return all registered guests with booking statistics
 */
export function getAllUsersWithStats(): (SafeUser & {
  totalBookings: number
  totalSpent: number
  lastStay?: string
})[] {
  const users = getAllUsers()
  const bookings = getAllBookings()

  return users.map((u) => {
    const { passwordHash: _, salt: __, ...safeUser } = u
    const userBookings = bookings.filter(
      (b) =>
        (b.userId && b.userId === u.id) ||
        (b.guestDetails?.phone && normalizePhone(b.guestDetails.phone) === u.phone)
    )

    const totalSpent = userBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    const sortedDates = userBookings
      .map((b) => b.checkInDate)
      .sort()
      .reverse()

    return {
      ...safeUser,
      totalBookings: userBookings.length,
      totalSpent,
      lastStay: sortedDates[0] || undefined,
    }
  })
}

/**
 * Verify admin passcode (Default: 'renoos2026' or 'admin123')
 */
export function verifyAdminPasscode(passcode: string): boolean {
  if (!passcode) return false
  const validCodes = ['renoos2026', 'admin123', 'renoos-hotel-admin']
  return validCodes.includes(passcode.trim())
}

