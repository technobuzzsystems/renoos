import React, { useState } from 'react'
import {
  X,
  Plus,
  Calendar,
  Bed,
  User,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { ROOMS_DATA } from '@/data/rooms'
import { createAdminWalkInBookingApi } from '@/services/adminApi'

interface AdminWalkInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AdminWalkInModal: React.FC<AdminWalkInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 2)

  const [roomId, setRoomId] = useState<string>('201')
  const [checkInDate, setCheckInDate] = useState<string>(today.toISOString().split('T')[0])
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrow.toISOString().split('T')[0])
  const [adults, setAdults] = useState<number>(2)
  const [children, setChildren] = useState<number>(0)
  const [customTariff, setCustomTariff] = useState<number>(4800)

  // Guest Details
  const [fullName, setFullName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('pay_at_hotel')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pay_at_checkin'>('pay_at_checkin')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Calculate nights
  const d1 = new Date(checkInDate)
  const d2 = new Date(checkOutDate)
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
  const subtotal = customTariff * nights
  const taxesAndGst = Math.round(subtotal * 0.18)
  const totalAmount = subtotal + taxesAndGst

  const handleRoomSelect = (id: string) => {
    setRoomId(id)
    const match = ROOMS_DATA.find((r) => r.roomNumber === id || r.id === id)
    if (match) {
      setCustomTariff(match.pricePerNight || 5200)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Guest Full Name is required')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('A valid 10-digit mobile number is required')
      return
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date')
      return
    }

    const selectedRoom = ROOMS_DATA.find((r) => r.roomNumber === roomId || r.id === roomId) || ROOMS_DATA[0]

    setIsSubmitting(true)

    try {
      await createAdminWalkInBookingApi({
        room: selectedRoom,
        checkInDate,
        checkOutDate,
        nights,
        adults,
        children,
        tariffPerNight: customTariff,
        subtotal,
        discount: 0,
        conservationFee: 0,
        taxesAndGst,
        totalAmount,
        guestDetails: {
          title: 'Guest',
          firstName: fullName.trim().split(' ')[0],
          lastName: fullName.trim().split(' ').slice(1).join(' ') || 'Guest',
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          specialRequests: [specialRequests.trim()].filter(Boolean),
        },
        paymentMethod,
        paymentStatus,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation. Check if room is available.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#16251C] border border-amber-200/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-cream"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-300 to-terracotta shrink-0" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-cream/15 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-200 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Front Desk PMS Entry</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-cream mt-0.5">
              New Walk-in / Direct Reservation
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Suite & Dates */}
          <div className="p-4 bg-black/30 rounded-2xl border border-cream/10 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-200 font-bold block">
              1. Suite & Dates
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Suite
                </label>
                <select
                  value={roomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                >
                  <option value="201">Room 201 — Forest Sanctuary Suite</option>
                  <option value="202">Room 202 — Mountain View Pavilion</option>
                  <option value="203">Room 203 — Executive Sanctuary Penthouse</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-amber-200 mb-1">
                  Tariff (₹ / night)
                </label>
                <input
                  type="number"
                  step="100"
                  value={customTariff}
                  onChange={(e) => setCustomTariff(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Guest Information */}
          <div className="p-4 bg-black/30 rounded-2xl border border-cream/10 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-200 font-bold block">
              2. Guest Contact Profile
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Singhania"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none"
                >
                  <option value="pay_at_hotel">Cash / Pay at Front Desk</option>
                  <option value="credit_card">Card (Front Desk Terminal)</option>
                  <option value="upi">UPI / Instant Transfer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-cream/70 mb-1">
                  Special Requests / Arrival Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP guest, extra pillows, early check-in requested"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1611] border border-cream/20 rounded-xl text-xs font-mono text-cream focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Tariff Breakdown */}
          <div className="p-4 bg-black/40 rounded-2xl border border-cream/15 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-cream/60">Estimated Total ({nights} nights + 18% GST):</span>
              <div className="text-[11px] text-cream/50 mt-0.5">
                Subtotal: ₹{subtotal.toLocaleString('en-IN')} · GST: ₹{taxesAndGst.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="font-serif text-2xl font-bold text-amber-200">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Locking Room in PMS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Walk-in Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminWalkInModal

