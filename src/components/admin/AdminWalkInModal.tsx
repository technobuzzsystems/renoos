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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[96dvh] sm:max-h-[92vh] bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-100 dark:border-emerald-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#047857] dark:text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Front Desk PMS Entry</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              New Walk-in Reservation
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2820] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
            aria-label="Close walk-in modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 no-scrollbar">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Suite & Dates */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#047857] dark:text-emerald-400 font-bold block">
              1. Suite & Dates
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Suite
                </label>
                <select
                  value={roomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="201">Room 201 — Forest Sanctuary Suite</option>
                  <option value="202">Room 202 — Mountain View Pavilion</option>
                  <option value="203">Room 203 — Executive Sanctuary Penthouse</option>
                  <option value="204">Room 204 — The Royal Horizon Suite</option>
                  <option value="205">Room 205 — The Tropical Bohemian Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-mono uppercase text-[#047857] dark:text-emerald-400 font-semibold mb-1">
                  Tariff (₹ / night)
                </label>
                <input
                  type="number"
                  step="100"
                  value={customTariff}
                  onChange={(e) => setCustomTariff(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Guest Information */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#047857] dark:text-emerald-400 font-bold block">
              2. Guest Contact Profile
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Singhania"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="pay_at_hotel">Cash / Pay at Front Desk</option>
                  <option value="credit_card">Card (Front Desk Terminal)</option>
                  <option value="upi">UPI / Instant Transfer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Special Requests / Arrival Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP guest, extra pillows, early check-in requested"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#131D17] border border-slate-200 dark:border-emerald-950 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Tariff Breakdown */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B110E] rounded-2xl border border-slate-200 dark:border-emerald-950 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Estimated Total ({nights} nights + 18% GST):</span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Subtotal: ₹{subtotal.toLocaleString('en-IN')} · GST: ₹{taxesAndGst.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#0B110E] hover:bg-slate-200 dark:hover:bg-[#1a2820] text-slate-700 dark:text-slate-300 border dark:border-emerald-950 text-xs font-mono transition-colors cursor-pointer text-center min-h-[38px] flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#047857] hover:bg-[#065f46] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[42px]"
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

