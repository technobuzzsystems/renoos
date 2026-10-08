import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { handleApiRequest } from '../server/apiHandler.ts'
import { getAllBookings, saveAllBookings } from '../server/db.ts'

// Spin up a temporary local test server on an ephemeral port
const server = http.createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res)
  if (!handled) {
    res.writeHead(404)
    res.end('Not found')
  }
})

async function runTests() {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const addr = server.address() as any
  const baseUrl = `http://127.0.0.1:${addr.port}`
  console.log(`[TEST] Test server listening on ${baseUrl}`)

  // Backup existing data/bookings.json
  const dataDir = path.resolve(process.cwd(), 'data')
  const dbFile = path.join(dataDir, 'bookings.json')
  const initialBookings = getAllBookings()

  try {
    // Reset DB for tests
    saveAllBookings([])

    console.log('\n--- Test 1: Check initial availability for 2026-11-01 to 2026-11-05 ---')
    const res1 = await fetch(`${baseUrl}/api/availability?checkIn=2026-11-01&checkOut=2026-11-05`)
    const data1 = await res1.json()
    console.log('Status:', res1.status)
    console.log('Room 201 available:', data1.availability['201'].available)
    if (!data1.availability['201'].available) throw new Error('Expected 201 to be available initially')

    console.log('\n--- Test 2: User 1 books Room 201 from 2026-11-01 to 2026-11-05 ---')
    const bookPayloadUser1 = {
      roomId: '201',
      roomNumber: '201',
      roomName: 'Deluxe Courtyard Suite',
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-05',
      nights: 4,
      adults: 2,
      children: 0,
      tariffPerNight: 5200,
      subtotal: 20800,
      discount: 2080,
      taxesAndGst: 3370,
      totalAmount: 22090,
      guestDetails: {
        fullName: 'Vikram Mehta',
        email: 'vikram.mehta@example.com',
        phone: '+91 98765 43210',
        specialRequests: 'High floor, mountain view',
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
    }

    const res2 = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookPayloadUser1),
    })
    const data2 = await res2.json()
    console.log('Status:', res2.status)
    console.log('Booking Reference:', data2.booking?.bookingReference)
    console.log('Room booked:', data2.booking?.roomNumber)
    if (res2.status !== 201) throw new Error('Expected status 201 for User 1 booking')

    console.log('\n--- Test 3: Check availability again for same dates ---')
    const res3 = await fetch(`${baseUrl}/api/availability?checkIn=2026-11-01&checkOut=2026-11-05`)
    const data3 = await res3.json()
    console.log('Room 201 available:', data3.availability['201'].available)
    console.log('Room 202 available:', data3.availability['202'].available)
    console.log('Conflicting Booking Ref:', data3.availability['201'].conflictingBooking?.bookingReference)
    if (data3.availability['201'].available !== false) {
      throw new Error('Expected Room 201 to be UNAVAILABLE for other users')
    }
    if (data3.availability['202'].available !== true) {
      throw new Error('Expected Room 202 to remain AVAILABLE')
    }

    console.log('\n--- Test 4: User 2 attempts concurrent double-booking of Room 201 for overlapping dates (2026-11-03 to 2026-11-07) ---')
    const bookPayloadUser2 = {
      roomId: '201',
      roomNumber: '201',
      roomName: 'Deluxe Courtyard Suite',
      checkInDate: '2026-11-03',
      checkOutDate: '2026-11-07',
      nights: 4,
      adults: 2,
      children: 1,
      tariffPerNight: 5200,
      subtotal: 20800,
      discount: 0,
      taxesAndGst: 3744,
      totalAmount: 24544,
      guestDetails: {
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 91234 56789',
      },
      paymentMethod: 'pay_at_hotel',
      paymentStatus: 'pay_at_checkin',
    }

    const res4 = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookPayloadUser2),
    })
    const data4 = await res4.json()
    console.log('Status:', res4.status, '(Expected 409 Conflict)')
    console.log('Error message returned to User 2:', data4.error)
    if (res4.status !== 409) {
      throw new Error(`Expected status 409 Conflict, received ${res4.status}`)
    }

    console.log('\n--- Test 5: User 2 books Room 201 for NON-overlapping dates starting on checkout day (2026-11-05 to 2026-11-08) ---')
    const bookPayloadNonOverlap = {
      ...bookPayloadUser2,
      checkInDate: '2026-11-05',
      checkOutDate: '2026-11-08',
      nights: 3,
    }

    const res5 = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookPayloadNonOverlap),
    })
    const data5 = await res5.json()
    console.log('Status:', res5.status)
    console.log('Booking Reference:', data5.booking?.bookingReference)
    if (res5.status !== 201) {
      throw new Error(`Expected status 201 for back-to-back booking, received ${res5.status}`)
    }

    console.log('\n--- Test 6: Verify all bookings list ---')
    const res6 = await fetch(`${baseUrl}/api/bookings`)
    const data6 = await res6.json()
    console.log('Total bookings in system:', data6.count)
    if (data6.count !== 2) throw new Error('Expected 2 confirmed bookings')

    console.log('\n[PASS] All PMS backend availability & concurrency tests PASSED successfully!')
  } finally {
    // Restore initial bookings or keep test data
    server.close()
  }
}

runTests().catch((err) => {
  console.error('[FAIL] Test failed:', err)
  process.exit(1)
})
