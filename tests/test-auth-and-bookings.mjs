import assert from 'node:assert/strict'
import {
  registerUser,
  loginUser,
  findUserByPhone,
  normalizePhone,
  getAllBookings,
  createBooking,
  getUserBookings,
  cancelBooking,
  isRoomAvailable,
} from '../server/db.ts'

console.log('--- STARTING RENOOS HOTEL AUTH & RESERVATIONS TEST ---')

// 1. Test Phone Normalization
console.log('[TEST 1] Testing phone normalization...')
assert.equal(normalizePhone('+91 98765 43210'), '9876543210')
assert.equal(normalizePhone('09876543210'), '9876543210')
assert.equal(normalizePhone('9876543210'), '9876543210')
assert.equal(normalizePhone('+91-91234-56789'), '9123456789')
console.log('  ✓ Phone normalization passed')

// 2. Test User Registration
console.log('[TEST 2] Testing user registration with mobile number & password...')
const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`
const testPassword = 'RenoosSecretPass2026!'
const testName = 'Vikramaditya Singhania'

const regResult = registerUser({
  fullName: testName,
  phone: testPhone,
  password: testPassword,
  email: 'vikram@renooshotel.example',
})

assert.equal(regResult.success, true)
assert.equal(regResult.user.fullName, testName)
assert.equal(regResult.user.phone, testPhone)
assert.ok(!('passwordHash' in regResult.user), 'Password hash must not be leaked in safe user profile')
assert.ok(!('salt' in regResult.user), 'Salt must not be leaked in safe user profile')
console.log('  ✓ Registration successful for', testName, `(+91 ${testPhone})`)

// 3. Test Duplicate Registration Prevention
console.log('[TEST 3] Testing duplicate phone registration prevention...')
assert.throws(
  () => {
    registerUser({
      fullName: 'Imposter',
      phone: testPhone,
      password: 'AnotherPassword',
    })
  },
  (err) => err.status === 409,
  'Duplicate registration must be rejected with HTTP 409'
)
console.log('  ✓ Duplicate mobile registration correctly rejected with 409 Conflict')

// 4. Test User Login with Mobile & Password
console.log('[TEST 4] Testing user login with mobile number & password...')
const loginResult = loginUser({
  phone: `+91 ${testPhone}`, // International format should resolve cleanly
  password: testPassword,
})
assert.equal(loginResult.success, true)
assert.equal(loginResult.user.phone, testPhone)
assert.equal(loginResult.user.fullName, testName)
console.log('  ✓ Login successful with formatted phone +91', testPhone)

// 5. Test Invalid Password Rejection
console.log('[TEST 5] Testing invalid password rejection...')
assert.throws(
  () => {
    loginUser({
      phone: testPhone,
      password: 'WrongPassword123',
    })
  },
  (err) => err.status === 401,
  'Wrong password must be rejected with HTTP 401'
)
console.log('  ✓ Wrong password correctly rejected with 401 Unauthorized')

// 6. Test Booking Creation & Linkage
console.log('[TEST 6] Testing booking creation linked to mobile number & user ID...')
const checkIn = '2026-11-15'
const checkOut = '2026-11-18'
const roomNum = '202' // Mountain View Room

const bookingRes = createBooking({
  userId: loginResult.user.id,
  roomId: 'room-202',
  roomNumber: roomNum,
  roomName: 'Mountain View Pavilion',
  checkInDate: checkIn,
  checkOutDate: checkOut,
  nights: 3,
  adults: 2,
  children: 0,
  tariffPerNight: 5200,
  subtotal: 15600,
  discount: 1560,
  taxesAndGst: 2527,
  totalAmount: 16567,
  guestDetails: {
    fullName: testName,
    email: 'vikram@renooshotel.example',
    phone: testPhone,
    specialRequests: 'High floor, mountain facing',
  },
  paymentMethod: 'pay_at_hotel',
  paymentStatus: 'pay_at_checkin',
})

const booking = bookingRes.booking
assert.ok(booking.id, 'Booking must have an ID')
assert.ok(booking.bookingReference.startsWith('RENOOS-2026-'), 'Reference must start with RENOOS-2026-')
assert.equal(booking.status, 'confirmed')
assert.equal(booking.userId, loginResult.user.id)
console.log('  ✓ Booking created successfully:', booking.bookingReference, `(Room ${roomNum})`)

// 7. Verify Room Availability is updated in PMS
console.log('[TEST 7] Testing real-time PMS room availability...')
const availCheckOverlap = isRoomAvailable(roomNum, '2026-11-16', '2026-11-19')
assert.equal(availCheckOverlap.available, false, 'Room must be UNAVAILABLE for overlapping dates')
console.log('  ✓ Room', roomNum, 'is correctly marked UNAVAILABLE for overlapping dates')

// 8. Test Conflict Prevention on Overlapping Booking
console.log('[TEST 8] Testing PMS double-booking prevention...')
assert.throws(
  () => {
    createBooking({
      roomId: 'room-202',
      roomNumber: roomNum,
      roomName: 'Mountain View Pavilion',
      checkInDate: '2026-11-17',
      checkOutDate: '2026-11-20',
      nights: 3,
      adults: 2,
      children: 0,
      tariffPerNight: 5200,
      subtotal: 15600,
      discount: 0,
      taxesAndGst: 2808,
      totalAmount: 18408,
      guestDetails: {
        fullName: 'Another Guest',
        email: 'other@example.com',
        phone: '9999999999',
      },
      paymentMethod: 'card',
      paymentStatus: 'paid',
    })
  },
  (err) => err.status === 409,
  'Overlapping booking must be rejected with 409 Conflict'
)
console.log('  ✓ PMS successfully prevented overlapping booking (real-time availability lock)')

// 9. Test Fetch User Bookings via Phone or User ID
console.log('[TEST 9] Testing retrieval of user bookings in Guest Portal...')
const userBookings = getUserBookings(testPhone)
assert.ok(userBookings.length >= 1, 'User must have at least 1 booking')
const matched = userBookings.find((b) => b.id === booking.id)
assert.ok(matched, 'The booked reservation must be in user bookings list')
assert.equal(matched.bookingReference, booking.bookingReference)
assert.equal(matched.totalAmount, 16567)
console.log('  ✓ User bookings retrieved successfully:', userBookings.length, 'booking(s) found')

// 10. Test Booking Cancellation & Room Release
console.log('[TEST 10] Testing cancellation and room release...')
const cancelOk = cancelBooking(booking.id)
assert.equal(cancelOk, true)
console.log('  ✓ Reservation cancelled successfully')

// 11. Verify Room is Released and Available again
const availCheckAfterCancel = isRoomAvailable(roomNum, '2026-11-16', '2026-11-19')
assert.equal(availCheckAfterCancel.available, true, 'Room must be RELEASED and AVAILABLE after cancellation')
console.log('  ✓ Room', roomNum, 'is now RELEASED and AVAILABLE for other guests in real time')

// 12. Verify User Bookings reflects cancelled status
const updatedUserBookings = getUserBookings(testPhone)
const cancelledMatch = updatedUserBookings.find((b) => b.id === booking.id)
assert.equal(cancelledMatch.status, 'cancelled')
console.log('  ✓ Guest Portal accurately reflects cancelled status')

console.log('\n--- ALL AUTH & RESERVATIONS TESTS PASSED SUCCESSFULLY! ---')

