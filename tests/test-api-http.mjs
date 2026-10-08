import http from 'node:http'
import assert from 'node:assert/strict'
import { handleApiRequest } from '../server/apiHandler.ts'

console.log('--- STARTING HTTP API TEST FOR RENOOS HOTEL ---')

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
  const phone = `97${Math.floor(10000000 + Math.random() * 90000000)}`
  const password = 'LuxuryPass2026!'

  // 1. POST /api/auth/register
  console.log('[HTTP 1] Testing POST /api/auth/register...')
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Aanya Verma',
      phone,
      password,
      email: 'aanya@example.com',
    }),
  })
  assert.equal(regRes.status, 201)
  const regJson = await regRes.json()
  assert.equal(regJson.success, true)
  assert.equal(regJson.user.phone, phone)
  console.log('  ✓ Registered user via HTTP successfully')

  // 2. POST /api/auth/login
  console.log('[HTTP 2] Testing POST /api/auth/login...')
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: `+91 ${phone}`,
      password,
    }),
  })
  assert.equal(loginRes.status, 200)
  const loginJson = await loginRes.json()
  assert.equal(loginJson.success, true)
  assert.equal(loginJson.user.phone, phone)
  console.log('  ✓ Logged in via HTTP successfully')

  // 3. POST /api/bookings with user ID and phone
  console.log('[HTTP 3] Testing POST /api/bookings...')
  const randomMonth = Math.floor(1 + Math.random() * 11)
  const randomDay = Math.floor(1 + Math.random() * 20)
  const checkIn = `2027-${String(randomMonth).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`
  const checkOut = `2027-${String(randomMonth).padStart(2, '0')}-${String(randomDay + 3).padStart(2, '0')}`

  const bookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: loginJson.user.id,
      room: {
        id: 'room-203',
        roomNumber: '203',
        name: 'The Executive Sanctuary Suite',
      },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: 3,
      adults: 2,
      children: 0,
      tariffPerNight: 8500,
      subtotal: 25500,
      discount: 0,
      conservationFee: 1500,
      taxesAndGst: 4590,
      totalAmount: 31590,
      guestDetails: {
        title: 'Ms',
        firstName: 'Aanya',
        lastName: 'Verma',
        email: 'aanya@example.com',
        phone,
      },
      paymentMethod: 'pay_at_hotel',
      paymentStatus: 'pay_at_checkin',
    }),
  })
  const bookJson = await bookRes.json()
  assert.equal(bookRes.status, 201, `Expected 201 Created but got ${bookRes.status}: ${JSON.stringify(bookJson)}`)
  assert.equal(bookJson.success, true)
  assert.ok(bookJson.reservation.id)
  console.log('  ✓ Reservation created via HTTP successfully:', bookJson.reservation.bookingReference)

  // 4. GET /api/user/bookings?phone=...
  console.log('[HTTP 4] Testing GET /api/user/bookings?phone=...')
  const listRes = await fetch(`${baseUrl}/api/user/bookings?phone=${phone}`)
  assert.equal(listRes.status, 200)
  const listJson = await listRes.json()
  assert.equal(listJson.success, true)
  assert.ok(Array.isArray(listJson.bookings))
  assert.ok(listJson.bookings.length >= 1)
  assert.equal(listJson.bookings[0].id, bookJson.reservation.id)
  console.log('  ✓ User bookings list retrieved via HTTP successfully')

  // 5. POST /api/bookings/:id/cancel
  console.log('[HTTP 5] Testing POST /api/bookings/:id/cancel...')
  const cancelRes = await fetch(`${baseUrl}/api/bookings/${bookJson.reservation.id}/cancel`, {
    method: 'POST',
  })
  assert.equal(cancelRes.status, 200)
  const cancelJson = await cancelRes.json()
  assert.equal(cancelJson.success, true)
  console.log('  ✓ Booking cancelled via HTTP successfully')

  // 6. Verify cancellation reflects in user bookings
  const listAfterCancel = await fetch(`${baseUrl}/api/user/bookings?phone=${phone}`)
  const afterCancelJson = await listAfterCancel.json()
  assert.equal(afterCancelJson.bookings[0].status, 'cancelled')
  console.log('  ✓ Cancelled status confirmed in Guest Portal via HTTP')

  console.log('\n--- ALL HTTP API TESTS PASSED! ---')
} finally {
  await new Promise((resolve) => server.close(resolve))
}

