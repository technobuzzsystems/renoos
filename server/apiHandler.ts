import type { IncomingMessage, ServerResponse } from 'node:http'
import { URL } from 'node:url'
import {
  getAllBookings,
  getAvailabilityForAllRooms,
  isRoomAvailable,
  createBooking,
  cancelBooking,
  registerUser,
  loginUser,
  getUserBookings,
  getRoomsConfig,
  updateRoomConfig,
  updateBookingStatus,
  updateBookingDetails,
  deleteBooking,
  getAdminStats,
  getAllUsersWithStats,
  verifyAdminPasscode,
} from './db.ts'

/**
 * Parse JSON body from IncomingMessage
 */
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      // Guard against massive payloads (>1MB)
      if (body.length > 1e6) {
        req.destroy()
        reject(new Error('Payload too large'))
      }
    })
    req.on('end', () => {
      if (!body.trim()) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(new Error('Invalid JSON payload'))
      }
    })
    req.on('error', (err) => reject(err))
  })
}

/**
 * Send JSON response helper
 */
function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  const payload = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(payload)
}

/**
 * Main HTTP Handler for /api routes
 * Returns true if handled, false if not an /api route
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const reqUrl = req.url || '/'
  const parsedUrl = new URL(reqUrl, `http://${req.headers.host || 'localhost'}`)
  const pathname = parsedUrl.pathname

  // Handle CORS preflight
  if (req.method === 'OPTIONS' && pathname.startsWith('/api')) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return true
  }

  // Not an API request
  if (!pathname.startsWith('/api/')) {
    return false
  }

  try {
    // =============================================================
    // ADMIN ROUTES: RENOOS HOTEL PMS MANAGEMENT
    // =============================================================

    // ADMIN ROUTE 1: POST /api/admin/login
    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await parseBody(req)
      const { passcode } = body
      if (verifyAdminPasscode(String(passcode || ''))) {
        sendJson(res, 200, {
          success: true,
          token: 'renoos-admin-authorized-session',
          admin: {
            name: 'General Manager',
            role: 'Super Admin',
            hotel: 'Renoos Hotel',
          },
        })
      } else {
        sendJson(res, 401, {
          success: false,
          error: 'Invalid Administrator Passcode. Access denied.',
        })
      }
      return true
    }

    // ADMIN ROUTE 2: GET /api/admin/stats
    if (req.method === 'GET' && pathname === '/api/admin/stats') {
      const stats = getAdminStats()
      sendJson(res, 200, { success: true, stats })
      return true
    }

    // ADMIN ROUTE 3: GET /api/admin/bookings
    if (req.method === 'GET' && pathname === '/api/admin/bookings') {
      let bookings = getAllBookings()
      const statusFilter = parsedUrl.searchParams.get('status')
      const roomFilter = parsedUrl.searchParams.get('room')
      const q = parsedUrl.searchParams.get('q')?.toLowerCase()?.trim()

      if (statusFilter && statusFilter !== 'all') {
        bookings = bookings.filter((b) => b.status === statusFilter)
      }
      if (roomFilter && roomFilter !== 'all') {
        bookings = bookings.filter((b) => b.roomNumber === roomFilter || b.roomId === roomFilter)
      }
      if (q) {
        bookings = bookings.filter(
          (b) =>
            b.guestDetails?.fullName?.toLowerCase().includes(q) ||
            b.guestDetails?.phone?.includes(q) ||
            b.guestDetails?.email?.toLowerCase().includes(q) ||
            b.bookingReference?.toLowerCase().includes(q) ||
            b.roomNumber?.toLowerCase().includes(q)
        )
      }

      sendJson(res, 200, { success: true, count: bookings.length, bookings })
      return true
    }

    // ADMIN ROUTE 4: PATCH /api/admin/bookings/:id/status
    if (
      req.method === 'PATCH' &&
      pathname.startsWith('/api/admin/bookings/') &&
      pathname.endsWith('/status')
    ) {
      const id = pathname.replace('/api/admin/bookings/', '').replace('/status', '').trim()
      const body = await parseBody(req)
      const updated = updateBookingStatus(id, body.status, body.notes)
      if (updated) {
        sendJson(res, 200, {
          success: true,
          booking: updated,
          message: `Reservation ${updated.bookingReference} status updated to ${updated.status}.`,
        })
      } else {
        sendJson(res, 404, { success: false, error: 'Booking not found' })
      }
      return true
    }

    // ADMIN ROUTE 5: PATCH /api/admin/bookings/:id
    if (req.method === 'PATCH' && pathname.startsWith('/api/admin/bookings/')) {
      const id = pathname.replace('/api/admin/bookings/', '').trim()
      const body = await parseBody(req)
      const updated = updateBookingDetails(id, body)
      if (updated) {
        sendJson(res, 200, {
          success: true,
          booking: updated,
          message: `Reservation ${updated.bookingReference} updated successfully.`,
        })
      } else {
        sendJson(res, 404, { success: false, error: 'Booking not found' })
      }
      return true
    }

    // ADMIN ROUTE 6: DELETE /api/admin/bookings/:id
    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/bookings/')) {
      const id = pathname.replace('/api/admin/bookings/', '').trim()
      const deleted = deleteBooking(id)
      if (deleted) {
        sendJson(res, 200, {
          success: true,
          message: `Reservation ${id} deleted successfully.`,
        })
      } else {
        sendJson(res, 404, { success: false, error: 'Booking not found' })
      }
      return true
    }

    // ADMIN ROUTE 7: GET /api/admin/guests
    if (req.method === 'GET' && pathname === '/api/admin/guests') {
      const guests = getAllUsersWithStats()
      sendJson(res, 200, { success: true, count: guests.length, guests })
      return true
    }

    // ADMIN ROUTE 8: GET /api/admin/rooms
    if (req.method === 'GET' && pathname === '/api/admin/rooms') {
      const configs = getRoomsConfig()
      const today = new Date().toISOString().split('T')[0]
      const bookings = getAllBookings()

      const roomsWithLiveState = configs.map((cfg) => {
        const activeBooking = bookings.find(
          (b) =>
            (b.roomNumber === cfg.roomNumber || b.roomId === `room-${cfg.roomNumber}`) &&
            (b.status === 'confirmed' || b.status === 'checked_in') &&
            b.checkInDate <= today &&
            b.checkOutDate > today
        )
        return {
          ...cfg,
          currentOccupant: activeBooking
            ? {
                guestName: activeBooking.guestDetails?.fullName,
                phone: activeBooking.guestDetails?.phone,
                checkInDate: activeBooking.checkInDate,
                checkOutDate: activeBooking.checkOutDate,
                status: activeBooking.status,
                bookingReference: activeBooking.bookingReference,
              }
            : null,
          isOccupiedToday: !!activeBooking,
        }
      })

      sendJson(res, 200, { success: true, rooms: roomsWithLiveState })
      return true
    }

    // ADMIN ROUTE 9: PATCH /api/admin/rooms/:roomNumber
    if (req.method === 'PATCH' && pathname.startsWith('/api/admin/rooms/')) {
      const roomNum = pathname.replace('/api/admin/rooms/', '').trim()
      const body = await parseBody(req)
      const updated = updateRoomConfig(roomNum, body)
      if (updated) {
        sendJson(res, 200, {
          success: true,
          room: updated,
          message: `Room ${roomNum} configuration updated.`,
        })
      } else {
        sendJson(res, 404, { success: false, error: 'Room configuration not found' })
      }
      return true
    }

    // -------------------------------------------------------------
    // AUTH ROUTE 1: POST /api/auth/register
    // -------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseBody(req)
      const { fullName, phone, password, email } = body

      try {
        const result = registerUser({
          fullName: String(fullName || ''),
          phone: String(phone || ''),
          password: String(password || ''),
          email: email ? String(email) : undefined,
        })
        sendJson(res, 201, {
          success: true,
          user: result.user,
          message: `Welcome to Renoos Hotel, ${result.user.fullName}!`,
        })
        return true
      } catch (err: any) {
        sendJson(res, err.status || 400, {
          success: false,
          error: err.message || 'Registration failed',
        })
        return true
      }
    }

    // -------------------------------------------------------------
    // AUTH ROUTE 2: POST /api/auth/login
    // -------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseBody(req)
      const { phone, password } = body

      try {
        const result = loginUser({
          phone: String(phone || ''),
          password: String(password || ''),
        })
        sendJson(res, 200, {
          success: true,
          user: result.user,
          message: `Welcome back, ${result.user.fullName}!`,
        })
        return true
      } catch (err: any) {
        sendJson(res, err.status || 401, {
          success: false,
          error: err.message || 'Login failed',
        })
        return true
      }
    }

    // -------------------------------------------------------------
    // USER ROUTE 3: GET /api/user/bookings?phone=... OR ?userId=...
    // -------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/user/bookings') {
      const phone = parsedUrl.searchParams.get('phone')
      const userId = parsedUrl.searchParams.get('userId')
      const query = phone || userId

      if (!query) {
        sendJson(res, 400, {
          success: false,
          error: 'Missing required query parameter: phone or userId',
        })
        return true
      }

      const bookings = getUserBookings(query)
      sendJson(res, 200, {
        success: true,
        count: bookings.length,
        bookings,
      })
      return true
    }

    // -------------------------------------------------------------
    // AVAILABILITY ROUTE 4: GET /api/availability
    // -------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/availability') {
      const checkIn = parsedUrl.searchParams.get('checkIn')
      const checkOut = parsedUrl.searchParams.get('checkOut')
      const roomId = parsedUrl.searchParams.get('roomId')

      if (!checkIn || !checkOut) {
        sendJson(res, 400, {
          success: false,
          error: 'Missing required query parameters: checkIn and checkOut (YYYY-MM-DD)',
        })
        return true
      }

      // Check dates valid
      if (checkIn >= checkOut) {
        sendJson(res, 400, {
          success: false,
          error: 'checkOut date must be after checkIn date',
        })
        return true
      }

      if (roomId) {
        const availability = isRoomAvailable(roomId, checkIn, checkOut)
        sendJson(res, 200, {
          success: true,
          checkIn,
          checkOut,
          roomId,
          available: availability.available,
          conflictingBooking: availability.conflictingBooking
            ? {
                bookingReference: availability.conflictingBooking.bookingReference,
                checkInDate: availability.conflictingBooking.checkInDate,
                checkOutDate: availability.conflictingBooking.checkOutDate,
              }
            : null,
        })
        return true
      }

      const allAvailability = getAvailabilityForAllRooms(checkIn, checkOut)
      sendJson(res, 200, {
        success: true,
        checkIn,
        checkOut,
        availability: allAvailability,
      })
      return true
    }

    // -------------------------------------------------------------
    // BOOKINGS ROUTE 5: GET /api/bookings - List all bookings
    // -------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/bookings') {
      const bookings = getAllBookings()
      sendJson(res, 200, {
        success: true,
        count: bookings.length,
        bookings,
      })
      return true
    }

    // -------------------------------------------------------------
    // BOOKINGS ROUTE 6: POST /api/bookings - Create booking
    // -------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/bookings') {
      const body = await parseBody(req)

      // Validate required booking fields
      const {
        userId,
        checkInDate,
        checkOutDate,
        nights,
        adults,
        children = 0,
        tariffPerNight,
        subtotal,
        discount = 0,
        taxesAndGst,
        totalAmount,
        guestDetails,
        paymentMethod = 'credit_card',
        paymentStatus = 'paid',
      } = body

      const roomId = body.roomId || body.room?.id
      const roomNumber = body.roomNumber || body.room?.roomNumber || roomId
      const roomName = body.roomName || body.room?.name || `Room ${roomNumber}`

      const guestFullName =
        guestDetails?.fullName ||
        [guestDetails?.firstName, guestDetails?.lastName].filter(Boolean).join(' ') ||
        'Valued Guest'

      if (
        !roomId ||
        !checkInDate ||
        !checkOutDate ||
        !guestDetails ||
        (!guestDetails.fullName && !guestDetails.firstName)
      ) {
        sendJson(res, 400, {
          success: false,
          error: 'Missing required reservation fields (roomId, checkInDate, checkOutDate, guestDetails)',
        })
        return true
      }

      if (checkInDate >= checkOutDate) {
        sendJson(res, 400, {
          success: false,
          error: 'checkOutDate must be after checkInDate',
        })
        return true
      }

      try {
        const result = createBooking({
          userId: userId ? String(userId) : undefined,
          roomId: String(roomId),
          roomNumber: String(roomNumber || roomId),
          roomName: String(roomName || `Room ${roomId}`),
          checkInDate: String(checkInDate),
          checkOutDate: String(checkOutDate),
          nights: Number(nights) || 1,
          adults: Number(adults) || 1,
          children: Number(children) || 0,
          tariffPerNight: Number(tariffPerNight) || 0,
          subtotal: Number(subtotal) || 0,
          discount: Number(discount) || 0,
          taxesAndGst: Number(taxesAndGst) || 0,
          totalAmount: Number(totalAmount) || 0,
          guestDetails: {
            fullName: String(guestFullName),
            email: String(guestDetails.email || ''),
            phone: String(guestDetails.phone || ''),
            specialRequests: guestDetails.specialRequests,
          },
          paymentMethod: String(paymentMethod),
          paymentStatus: paymentStatus === 'pay_at_checkin' ? 'pay_at_checkin' : 'paid',
        })

        sendJson(res, 201, {
          success: true,
          booking: result.booking,
          reservation: result.booking,
          message: `Reservation confirmed for Room ${result.booking.roomNumber}!`,
        })
        return true
      } catch (err: any) {
        if (err.status === 409) {
          sendJson(res, 409, {
            success: false,
            error: err.message,
            conflictingBooking: err.conflictingBooking
              ? {
                  bookingReference: err.conflictingBooking.bookingReference,
                  checkInDate: err.conflictingBooking.checkInDate,
                  checkOutDate: err.conflictingBooking.checkOutDate,
                }
              : null,
          })
          return true
        }
        throw err
      }
    }

    // -------------------------------------------------------------
    // BOOKINGS ROUTE 7: DELETE /api/bookings/:id or POST /api/bookings/:id/cancel
    // -------------------------------------------------------------
    const isDeleteBooking = req.method === 'DELETE' && pathname.startsWith('/api/bookings/')
    const isPostCancel =
      req.method === 'POST' && pathname.startsWith('/api/bookings/') && pathname.endsWith('/cancel')

    if (isDeleteBooking || isPostCancel) {
      const rawId = pathname.replace('/api/bookings/', '').replace('/cancel', '').trim()
      if (!rawId) {
        sendJson(res, 400, { success: false, error: 'Missing booking ID in URL' })
        return true
      }

      const cancelled = cancelBooking(rawId)
      if (cancelled) {
        sendJson(res, 200, {
          success: true,
          message: `Booking ${rawId} cancelled successfully. The room is now available again.`,
        })
      } else {
        sendJson(res, 404, { success: false, error: `Booking ${rawId} not found` })
      }
      return true
    }

    // Unrecognized /api endpoint
    sendJson(res, 404, { success: false, error: 'Endpoint not found' })
    return true
  } catch (err: any) {
    console.error('API Error:', err)
    sendJson(res, 500, {
      success: false,
      error: err.message || 'Internal server error',
    })
    return true
  }
}
