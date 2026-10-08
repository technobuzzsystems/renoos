import http from 'node:http'
import assert from 'node:assert/strict'
import { handleApiRequest } from '../server/apiHandler.ts'

console.log('====================================================')
console.log('--- STARTING COMPREHENSIVE ADMIN & PMS TEST SUITE ---')
console.log('====================================================')

const server = http.createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res)
  if (!handled) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
const baseUrl = `http://127.0.0.1:${port}`

try {
  // Test 1: Admin Authentication with Invalid Passcode
  console.log('[Test 1] Testing POST /api/admin/login with incorrect passcode...')
  const badLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'wrong_secret_passcode' }),
  })
  assert.equal(badLoginRes.status, 401)
  const badLoginJson = await badLoginRes.json()
  assert.equal(badLoginJson.success, false)
  console.log('  ✓ Incorrect passcode rejected with 401')

  // Test 2: Admin Authentication with Master Passcode 'renoos2026'
  console.log('[Test 2] Testing POST /api/admin/login with master passcode...')
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'renoos2026' }),
  })
  assert.equal(loginRes.status, 200)
  const loginJson = await loginRes.json()
  assert.equal(loginJson.success, true)
  assert.ok(loginJson.token)
  assert.equal(loginJson.admin.role, 'Super Admin')
  console.log(`  ✓ Authenticated as: ${loginJson.admin.name} (${loginJson.admin.role})`)

  // Test 3: Executive PMS Statistics
  console.log('[Test 3] Testing GET /api/admin/stats...')
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Accept: 'application/json' },
  })
  assert.equal(statsRes.status, 200)
  const statsJson = await statsRes.json()
  assert.equal(statsJson.success, true)
  assert.ok(typeof statsJson.stats.totalRevenue === 'number')
  assert.ok(typeof statsJson.stats.occupancyRate === 'number')
  assert.ok(typeof statsJson.stats.totalBookings === 'number')
  console.log(`  ✓ PMS Stats: Revenue ₹${statsJson.stats.totalRevenue}, Occupancy ${statsJson.stats.occupancyRate}%, Bookings ${statsJson.stats.totalBookings}`)

  // Test 4: Suite Configurations & Statuses
  console.log('[Test 4] Testing GET /api/admin/rooms...')
  const roomsRes = await fetch(`${baseUrl}/api/admin/rooms`, {
    headers: { Accept: 'application/json' },
  })
  assert.equal(roomsRes.status, 200)
  const roomsJson = await roomsRes.json()
  assert.equal(roomsJson.success, true)
  assert.ok(Array.isArray(roomsJson.rooms))
  assert.ok(roomsJson.rooms.length >= 3)
  console.log(`  ✓ Retrieved ${roomsJson.rooms.length} configured suites`)

  // Test 5: Room Maintenance Toggle & Front-Desk Lockout
  console.log('[Test 5] Testing PATCH /api/admin/rooms/201 (Maintenance mode)...')
  const patchRoomRes = await fetch(`${baseUrl}/api/admin/rooms/201`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationalStatus: 'maintenance',
      housekeepingNotes: 'Annual teak wood polishing & cedar aroma treatment',
    }),
  })
  assert.equal(patchRoomRes.status, 200)
  const patchRoomJson = await patchRoomRes.json()
  assert.equal(patchRoomJson.success, true)
  assert.equal(patchRoomJson.room.operationalStatus, 'maintenance')

  // Verify availability endpoint honors maintenance lock
  const availRes = await fetch(`${baseUrl}/api/availability?checkIn=2026-11-01&checkOut=2026-11-03`)
  const availJson = await availRes.json()
  assert.equal(availJson.availability['201'].available, false)
  console.log(`  ✓ Room 201 set to maintenance; public availability correctly blocked: "${availJson.availability['201'].reason || 'maintenance'}"`)

  // Restore room 201 back to available
  await fetch(`${baseUrl}/api/admin/rooms/201`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationalStatus: 'available',
      housekeepingNotes: 'Inspected and certified ready for guests',
    }),
  })
  console.log('  ✓ Room 201 restored to operational available status')

  // Test 6: Front Desk Walk-in Booking Creation
  console.log('[Test 6] Testing POST /api/bookings (Walk-in Folio Creation)...')
  const walkInRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room: {
        id: '202',
        roomNumber: '202',
        name: 'Canopy Suite',
        pricePerNight: 55000,
        area: 92,
      },
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-13',
      nights: 3,
      adults: 2,
      children: 0,
      tariffPerNight: 55000,
      subtotal: 165000,
      discount: 0,
      taxesAndGst: 29700,
      totalAmount: 194700,
      guestDetails: {
        fullName: 'Vikramaditya Oberoi',
        email: 'vikram.oberoi@luxury.demo',
        phone: '9820011223',
        specialRequests: 'Arrival champagne & mountain balcony heating',
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
    }),
  })
  assert.equal(walkInRes.status, 201)
  const walkInJson = await walkInRes.json()
  assert.equal(walkInJson.success, true)
  const bookingId = walkInJson.booking.id
  console.log(`  ✓ Created Walk-In Reservation Ref: ${walkInJson.booking.bookingReference} (Folio ID: ${bookingId})`)

  // Test 7: Fetch Reservations List with Filter
  console.log('[Test 7] Testing GET /api/admin/bookings?room=202...')
  const bookingsFilterRes = await fetch(`${baseUrl}/api/admin/bookings?room=202`)
  assert.equal(bookingsFilterRes.status, 200)
  const bookingsFilterJson = await bookingsFilterRes.json()
  assert.equal(bookingsFilterJson.success, true)
  const found = bookingsFilterJson.bookings.some((b) => b.id === bookingId)
  assert.ok(found, 'Created booking should appear in room 202 filter')
  console.log(`  ✓ Filter by room 202 returned ${bookingsFilterJson.bookings.length} reservations`)

  // Test 8: Reservation Status Lifecycle (Checked-In -> Checked-Out)
  console.log('[Test 8] Testing PATCH /api/admin/bookings/:id/status (Check-In)...')
  const checkInRes = await fetch(`${baseUrl}/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'checked_in', notes: 'Guest welcomed with artisan herbal tea' }),
  })
  assert.equal(checkInRes.status, 200)
  const checkInJson = await checkInRes.json()
  assert.equal(checkInJson.booking.status, 'checked_in')
  console.log('  ✓ Status updated to checked_in')

  console.log('[Test 8b] Testing PATCH /api/admin/bookings/:id/status (Check-Out)...')
  const checkOutRes = await fetch(`${baseUrl}/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'checked_out', notes: 'Folio settled in full at reception' }),
  })
  assert.equal(checkOutRes.status, 200)
  const checkOutJson = await checkOutRes.json()
  assert.equal(checkOutJson.booking.status, 'checked_out')
  console.log('  ✓ Status updated to checked_out')

  // Test 9: Guest Directory & CRM
  console.log('[Test 9] Testing GET /api/admin/guests...')
  const guestsRes = await fetch(`${baseUrl}/api/admin/guests`)
  assert.equal(guestsRes.status, 200)
  const guestsJson = await guestsRes.json()
  assert.equal(guestsJson.success, true)
  assert.ok(Array.isArray(guestsJson.guests))
  console.log(`  ✓ Retrieved ${guestsJson.guests.length} guest CRM profiles`)

  // Test 10: Clean up test booking
  console.log('[Test 10] Testing DELETE /api/admin/bookings/:id...')
  const deleteRes = await fetch(`${baseUrl}/api/admin/bookings/${bookingId}`, {
    method: 'DELETE',
  })
  assert.equal(deleteRes.status, 200)
  const deleteJson = await deleteRes.json()
  assert.equal(deleteJson.success, true)
  console.log('  ✓ Cleaned up test reservation record')

  console.log('====================================================')
  console.log('✓✓✓ ALL ADMIN & PMS TEST CASES PASSED SUCCESSFULLY ✓✓✓')
  console.log('====================================================')
} catch (err) {
  console.error('Test Suite Failed:', err)
  process.exit(1)
} finally {
  server.close()
}
