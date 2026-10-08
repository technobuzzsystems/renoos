import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Check,
  Phone,
  Mail,
  User,
  Clock,
  Lock,
  Gift,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import type { Room, ConfirmedReservation, GuestDetails, PaymentMethod } from '@/types'
import { generateReservationPDF, printReservationInvoice } from '@/lib/pdfBillGenerator'
import { submitBookingToApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

interface BookingModalProps {
  room: Room
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  nights: number
  tariffPerNight: number
  discount: number
  promoCodeApplied?: string
  conservationFee: number
  taxesAndGst: number
  totalAmount: number
  isOpen: boolean
  onClose: () => void
  onBookingSuccess?: (reservation: ConfirmedReservation) => void
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  checkInDate,
  checkOutDate,
  adults,
  children,
  nights,
  tariffPerNight,
  discount,
  promoCodeApplied,
  conservationFee,
  taxesAndGst,
  totalAmount,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<'guest' | 'payment' | 'confirmed'>('guest')

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    arrivalTime: '14:00 - 16:00',
    specialRequests: ['Complimentary Farm Sanctuary Tour'],
    customNotes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_at_hotel')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upiId, setUpiId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedReservation, setConfirmedReservation] = useState<ConfirmedReservation | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const { user, refreshUserBookings, setIsAuthModalOpen, setIsBookingsModalOpen } = useAuth()

  // Auto-populate guest details when user is logged in
  useEffect(() => {
    if (isOpen && user) {
      const parts = (user.fullName || '').trim().split(/\s+/)
      const fName = parts[0] || ''
      const lName = parts.slice(1).join(' ') || ''
      setGuestDetails((prev) => ({
        ...prev,
        firstName: prev.firstName || fName,
        lastName: prev.lastName || lName,
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isOpen, user])

  // Reset or lock scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setStep('guest')
      setErrors({})
      setIsSubmitting(false)
      setSubmissionError(null)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleToggleRequest = (request: string) => {
    setGuestDetails((prev) => {
      const exists = prev.specialRequests.includes(request)
      return {
        ...prev,
        specialRequests: exists
          ? prev.specialRequests.filter((r) => r !== request)
          : [...prev.specialRequests, request],
      }
    })
  }

  const validateGuestDetails = () => {
    const newErrors: Record<string, string> = {}
    if (!guestDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!guestDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!guestDetails.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!guestDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (guestDetails.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateGuestDetails()) {
      setSubmissionError(null)
      setStep('payment')
    }
  }

  const handleConfirmReservation = async () => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const newReservation = await submitBookingToApi({
        room,
        checkInDate,
        checkOutDate,
        nights,
        adults,
        children,
        tariffPerNight,
        subtotal: tariffPerNight * nights,
        discount,
        promoCodeApplied,
        conservationFee,
        taxesAndGst,
        totalAmount,
        guestDetails,
        paymentMethod,
        paymentStatus: paymentMethod === 'pay_at_hotel' ? 'pay_at_checkin' : 'paid',
        userId: user?.id,
      })

      // Sync user bookings in global context
      if (user) {
        refreshUserBookings().catch((err) => console.warn('Could not refresh bookings:', err))
      }

      // Save to localStorage for local guest history
      try {
        const stored =
          localStorage.getItem('renoos_hotel_reservations') ||
          localStorage.getItem('sb_farm_reservations')
        const existing = stored ? JSON.parse(stored) : []
        localStorage.setItem(
          'renoos_hotel_reservations',
          JSON.stringify([newReservation, ...existing])
        )
      } catch (err) {
        console.warn('Could not save booking to localStorage:', err)
      }

      setConfirmedReservation(newReservation)
      setIsSubmitting(false)
      setStep('confirmed')

      if (onBookingSuccess) {
        onBookingSuccess(newReservation)
      }
    } catch (err: any) {
      console.error('Failed to confirm reservation:', err)
      setSubmissionError(
        err.message ||
          `Room ${room.roomNumber} is unavailable for the selected dates. Another guest has booked this suite.`
      )
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!confirmedReservation) return
    setIsGeneratingPDF(true)
    try {
      generateReservationPDF(confirmedReservation)
    } catch (err) {
      console.error('Failed to generate PDF bill:', err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrintInvoice = () => {
    if (!confirmedReservation) return
    printReservationInvoice(confirmedReservation)
  }

  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-charcoal/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div
        className="relative w-full max-w-4xl bg-cream rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E9E4DB] overflow-hidden my-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-forest text-cream border-b border-forest-light/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cream/15 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-cream" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-terracotta-light font-semibold block">
                Official Sanctuary Reservation
              </span>
              <h2 id="booking-modal-title" className="font-serif text-lg sm:text-xl text-cream font-medium">
                {step === 'confirmed'
                  ? 'Reservation Confirmed'
                  : `Book Room ${room.roomNumber} — ${room.name}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-cream/70 hover:text-cream hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-cream"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker (only if not confirmed) */}
        {step !== 'confirmed' && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-ivory border-b border-[#E9E4DB] flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 'guest'
                    ? 'bg-forest text-cream'
                    : 'bg-emerald-600 text-cream'
                }`}
              >
                {step === 'guest' ? '1' : '✓'}
              </span>
              <span className={step === 'guest' ? 'text-forest font-semibold' : 'text-charcoal-muted'}>
                <span className="hidden sm:inline">1. Guest Details</span>
                <span className="sm:hidden">1. Details</span>
              </span>
            </div>

            <div className="h-px w-8 sm:w-24 bg-[#E9E4DB]" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 'payment'
                    ? 'bg-forest text-cream'
                    : 'bg-[#E9E4DB] text-charcoal-muted'
                }`}
              >
                2
              </span>
              <span className={step === 'payment' ? 'text-forest font-semibold' : 'text-charcoal-muted'}>
                <span className="hidden sm:inline">2. Guarantee & Payment</span>
                <span className="sm:hidden">2. Payment</span>
              </span>
            </div>

            <div className="h-px w-8 sm:w-24 bg-[#E9E4DB] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-charcoal-muted opacity-60">
              <span className="w-6 h-6 rounded-full bg-[#E9E4DB] flex items-center justify-center text-[11px] font-bold">
                3
              </span>
              <span>3. Confirmation</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-6 flex-grow">
          {/* STEP 1: GUEST DETAILS */}
          {step === 'guest' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Stay Summary Strip */}
              <div className="p-4 bg-ivory rounded-2xl border border-[#E9E4DB] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={room.previewImages.thumbnail}
                    alt={room.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E9E4DB]"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sage font-medium">
                      Selected Accommodation
                    </span>
                    <h3 className="font-serif text-base text-forest font-semibold">
                      Room {room.roomNumber} · {room.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-charcoal-muted font-light mt-0.5">
                      <span>{room.bedType.split('(')[0]}</span>
                      <span>·</span>
                      <span>{room.area} m²</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-[#E9E4DB] pt-3 sm:pt-0 sm:pl-4">
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block">Check-In</span>
                    <span className="font-semibold text-forest">{formatDateDisplay(checkInDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block">Check-Out</span>
                    <span className="font-semibold text-forest">{formatDateDisplay(checkOutDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block">Stay</span>
                    <span className="font-semibold text-forest">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                </div>
              </div>

              {/* Account Association Banner */}
              {user ? (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-950">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Signed in as <strong>{user.fullName || user.phone}</strong> (+91 {user.phone}). This reservation will be linked to your account.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-300/60 shrink-0 hidden sm:inline">
                    PMS Linked
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-[#FAF4ED] border border-[#E9DFD0] rounded-2xl flex items-center justify-between gap-3 text-xs text-charcoal">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-terracotta shrink-0" />
                    <span className="text-charcoal-muted">
                      Have a Renoos Hotel account? Sign in with mobile number to auto-fill details and manage your stay.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3 py-1 bg-forest hover:bg-forest-dark text-cream text-[11px] font-mono uppercase tracking-wider rounded-lg shrink-0 cursor-pointer transition-colors shadow-sm"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Guest Form Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E9E4DB] pb-2">
                  <h4 className="font-serif text-lg text-forest font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-terracotta" />
                    <span>Primary Guest Information</span>
                  </h4>
                  <span className="text-[11px] text-charcoal-muted font-light">
                    * Required fields for booking voucher
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5">
                      Title
                    </label>
                    <select
                      value={guestDetails.title}
                      onChange={(e) => setGuestDetails({ ...guestDetails, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-[#E9E4DB] rounded-xl text-sm text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Dr">Dr.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arjun"
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-ivory border rounded-xl text-base sm:text-sm text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:ring-1 focus:ring-forest min-h-[44px] ${
                        errors.firstName ? 'border-red-400 bg-red-50/20' : 'border-[#E9E4DB]'
                      }`}
                    />
                    {errors.firstName && (
                      <span className="text-[11px] text-red-500 mt-1 block">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-ivory border rounded-xl text-base sm:text-sm text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:ring-1 focus:ring-forest min-h-[44px] ${
                        errors.lastName ? 'border-red-400 bg-red-50/20' : 'border-[#E9E4DB]'
                      }`}
                    />
                    {errors.lastName && (
                      <span className="text-[11px] text-red-500 mt-1 block">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sage" />
                      <span>Email Address (for confirmation) *</span>
                    </label>
                    <input
                      type="email"
                      placeholder="arjun.sharma@example.com"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-ivory border rounded-xl text-base sm:text-sm text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:ring-1 focus:ring-forest min-h-[44px] ${
                        errors.email ? 'border-red-400 bg-red-50/20' : 'border-[#E9E4DB]'
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sage" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-ivory border rounded-xl text-base sm:text-sm text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:ring-1 focus:ring-forest min-h-[44px] ${
                        errors.phone ? 'border-red-400 bg-red-50/20' : 'border-[#E9E4DB]'
                      }`}
                    />
                    {errors.phone && (
                      <span className="text-[11px] text-red-500 mt-1 block">{errors.phone}</span>
                    )}
                  </div>

                  <div className="sm:col-span-12">
                    <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sage" />
                      <span>Estimated Arrival Window</span>
                    </label>
                    <select
                      value={guestDetails.arrivalTime}
                      onChange={(e) => setGuestDetails({ ...guestDetails, arrivalTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-[#E9E4DB] rounded-xl text-base sm:text-sm text-forest focus:outline-none focus:ring-1 focus:ring-forest min-h-[44px]"
                    >
                      <option value="12:00 - 14:00 (Early Check-in subject to readiness)">12:00 - 14:00 (Early Arrival)</option>
                      <option value="14:00 - 16:00 (Standard Check-in)">14:00 - 16:00 (Standard Check-in)</option>
                      <option value="16:00 - 18:00 (Late Afternoon)">16:00 - 18:00 (Late Afternoon)</option>
                      <option value="18:00 - 21:00 (Evening Arrival)">18:00 - 21:00 (Evening Arrival)</option>
                      <option value="After 21:00 (Late Night)">After 21:00 (Late Night Arrival)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Sanctuary Requests */}
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-wider text-forest font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta" />
                  <span>Sanctuary Enhancements & Preferences</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    'Complimentary Farm Sanctuary Tour',
                    'Quiet Courtyard Facing Wing',
                    'High Floor Preference',
                    'Vegan / Gluten-Free Breakfast Request',
                    'Private Airport Chauffeur (Extra ₹2,500)',
                    'Honeymoon / Anniversary Flower Setup',
                  ].map((request) => {
                    const isChecked = guestDetails.specialRequests.includes(request)
                    return (
                      <button
                        type="button"
                        key={request}
                        onClick={() => handleToggleRequest(request)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                          isChecked
                            ? 'bg-forest/5 border-forest text-forest font-medium'
                            : 'bg-ivory border-[#E9E4DB] text-charcoal-muted hover:border-forest/40'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'bg-forest border-forest text-cream'
                              : 'border-sage/40 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{request}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-medium mb-1">
                    Special Inquiries or Dietary Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Let us know any allergies, bedding preferences, or arrival details..."
                    value={guestDetails.customNotes}
                    onChange={(e) => setGuestDetails({ ...guestDetails, customNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-[#E9E4DB] rounded-xl text-base sm:text-xs text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Footer Button Bar */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E9E4DB]">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 text-xs uppercase tracking-wider text-charcoal-muted hover:text-charcoal font-medium text-center min-h-[44px] rounded-full"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all duration-300 min-h-[48px]"
                >
                  <span>Continue to Payment & Guarantee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT & GUARANTEE */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Payment Selection Options (Left) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border-b border-[#E9E4DB] pb-2">
                    <h4 className="font-serif text-lg text-forest font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-terracotta" />
                      <span>Select Payment & Guarantee Method</span>
                    </h4>
                    <p className="text-xs text-charcoal-muted font-light mt-0.5">
                      Choose how you wish to settle or guarantee your reservation.
                    </p>
                  </div>

                  {/* Option 1: Pay at Hotel */}
                  <div
                    onClick={() => setPaymentMethod('pay_at_hotel')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'pay_at_hotel'
                        ? 'border-forest bg-forest/5 shadow-sm'
                        : 'border-[#E9E4DB] bg-ivory hover:border-forest/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'pay_at_hotel'
                            ? 'border-forest bg-forest'
                            : 'border-sage/40 bg-white'
                        }`}
                      >
                        {paymentMethod === 'pay_at_hotel' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cream" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-forest">
                            Pay at Hotel (No Advance Payment Today)
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase font-bold rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted mt-1 font-light leading-relaxed">
                          Zero charges today. Settle the total tariff upon arrival at reception via Cash, Card, or UPI. Your room is 100% held and guaranteed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Credit / Debit Card */}
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-forest bg-forest/5 shadow-sm'
                        : 'border-[#E9E4DB] bg-ivory hover:border-forest/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'credit_card'
                            ? 'border-forest bg-forest'
                            : 'border-sage/40 bg-white'
                        }`}
                      >
                        {paymentMethod === 'credit_card' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cream" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-forest">
                            Credit / Debit Card (Instant Guarantee)
                          </span>
                          <span className="text-[10px] font-mono uppercase text-sage">
                            Visa · Master · Amex
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted mt-1 font-light">
                          Encrypted 256-bit card transaction. Instant booking confirmation receipt issued.
                        </p>

                        {paymentMethod === 'credit_card' && (
                          <div className="mt-4 pt-3 border-t border-[#E9E4DB] space-y-3" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-charcoal-muted mb-1">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                placeholder="Name as displayed on card"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                className="w-full px-3 py-2 bg-cream border border-[#E9E4DB] rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-charcoal-muted mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="4532 •••• •••• 8892"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-3 py-2 bg-cream border border-[#E9E4DB] rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] uppercase tracking-wider text-charcoal-muted mb-1">
                                  Expiry
                                </label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full px-3 py-2 bg-cream border border-[#E9E4DB] rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] uppercase tracking-wider text-charcoal-muted mb-1">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="•••"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  className="w-full px-3 py-2 bg-cream border border-[#E9E4DB] rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 3: UPI */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-forest bg-forest/5 shadow-sm'
                        : 'border-[#E9E4DB] bg-ivory hover:border-forest/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'upi'
                            ? 'border-forest bg-forest'
                            : 'border-sage/40 bg-white'
                        }`}
                      >
                        {paymentMethod === 'upi' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cream" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-forest">
                            UPI Instant Pay
                          </span>
                          <span className="text-[10px] font-mono uppercase text-sage">
                            GPay · PhonePe · Paytm
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted mt-1 font-light">
                          Seamless Indian digital payment with instant reservation activation.
                        </p>

                        {paymentMethod === 'upi' && (
                          <div className="mt-3 pt-3 border-t border-[#E9E4DB]" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[11px] uppercase tracking-wider text-charcoal-muted mb-1">
                              Virtual Payment Address (VPA / UPI ID)
                            </label>
                            <input
                              type="text"
                              placeholder="username@okhdfcbank"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full px-3 py-2 bg-cream border border-[#E9E4DB] rounded-lg text-xs font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Security Reassurance */}
                  <div className="flex items-center gap-2 p-3 bg-cream rounded-xl border border-[#E9E4DB] text-xs text-charcoal-muted">
                    <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                    <span>256-bit encrypted reservation. Guaranteed lowest rate at Renoos Hotel.</span>
                  </div>
                </div>

                {/* Right Summary Invoice Card */}
                <div className="lg:col-span-5 bg-ivory p-5 rounded-2xl border border-[#E9E4DB] space-y-4">
                  <div className="border-b border-[#E9E4DB] pb-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-sage block font-medium">
                      Tariff Breakdown
                    </span>
                    <h5 className="font-serif text-lg text-forest font-semibold">
                      Stay Summary
                    </h5>
                  </div>

                  <div className="space-y-2.5 text-xs text-charcoal">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">
                        Room {room.roomNumber} ({nights} {nights === 1 ? 'night' : 'nights'})
                      </span>
                      <span className="font-medium">
                        ₹{(tariffPerNight * nights).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          <span>Promo Discount ({promoCodeApplied})</span>
                        </span>
                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-charcoal-muted">
                      <span>Farm Sanctuary Conservation Levy</span>
                      <span>₹{conservationFee.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-charcoal-muted">
                      <span>GST & Hospitality Taxes (18%)</span>
                      <span>₹{taxesAndGst.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-3 border-t border-[#E9E4DB] flex justify-between items-baseline">
                      <div>
                        <span className="text-xs uppercase font-mono tracking-wider text-forest font-semibold block">
                          Total Amount
                        </span>
                        <span className="text-[10px] text-charcoal-muted">
                          {paymentMethod === 'pay_at_hotel' ? 'Pay upon Check-in' : 'Payable Now'}
                        </span>
                      </div>
                      <span className="font-serif text-2xl font-bold text-forest">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-cream rounded-xl border border-[#E9E4DB] text-[11px] text-charcoal-muted space-y-1">
                    <div className="font-medium text-forest flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-sage" />
                      <span>Free Cancellation</span>
                    </div>
                    <p className="font-light">
                      Cancel free of charge up to 48 hours before check-in date. No penalty applied.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission / Availability Conflict Alert */}
              {submissionError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-900 text-sm">Suite Unavailable for Selected Dates</p>
                    <p className="font-light leading-relaxed">{submissionError}</p>
                    <p className="text-[11px] text-red-600 font-mono pt-1">
                      Notice: Another guest has confirmed this suite for overlapping dates. Please pick alternative dates or select another suite.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E9E4DB]">
                <button
                  type="button"
                  onClick={() => setStep('guest')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs uppercase tracking-wider text-charcoal hover:text-forest font-medium min-h-[44px] rounded-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Guest Details</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all duration-300 disabled:opacity-50 min-h-[48px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />
                      <span>Confirming Reservation...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {paymentMethod === 'pay_at_hotel'
                          ? 'Complete Reservation (Pay at Check-in)'
                          : `Confirm & Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BOOKING CONFIRMED VOUCHER */}
          {step === 'confirmed' && confirmedReservation && (
            <div className="space-y-6 text-center py-2" id="printable-voucher">
              {/* Confirmed Banner */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-700 font-bold px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    Booking Confirmed & Guaranteed
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-forest font-semibold pt-1">
                    Your Sanctuary Stay is Reserved!
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto font-light">
                    A confirmation voucher and travel guide have been dispatched to{' '}
                    <strong className="text-forest font-medium">{confirmedReservation.guestDetails.email}</strong>.
                  </p>
                </div>
              </div>

              {/* Printable Reservation Voucher Card */}
              <div className="max-w-2xl mx-auto bg-ivory rounded-3xl border border-[#E9E4DB] p-6 sm:p-8 text-left shadow-warm space-y-6 relative overflow-hidden">
                {/* Decorative Sanctuary Stamp */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#E9E4DB] pb-4 gap-4">
                  <div>
                    <span className="font-serif text-2xl text-forest font-bold block">
                      RENOOS HOTEL
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-sage font-medium">
                      Luxury Mountain Resort · Suite Voucher
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">
                      Booking Reference
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-forest tracking-wider bg-cream px-3 py-1 rounded-lg border border-[#E9E4DB]">
                      {confirmedReservation.bookingReference}
                    </span>
                  </div>
                </div>

                {/* Stay Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-1">
                      Accommodation
                    </span>
                    <span className="font-serif text-sm font-semibold text-forest block">
                      Room {confirmedReservation.room.roomNumber}
                    </span>
                    <span className="text-charcoal-muted text-[11px]">
                      {confirmedReservation.room.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-1">
                      Check-In Date
                    </span>
                    <span className="font-semibold text-forest block">
                      {formatDateDisplay(confirmedReservation.checkInDate)}
                    </span>
                    <span className="text-charcoal-muted text-[11px]">
                      From 2:00 PM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-1">
                      Check-Out Date
                    </span>
                    <span className="font-semibold text-forest block">
                      {formatDateDisplay(confirmedReservation.checkOutDate)}
                    </span>
                    <span className="text-charcoal-muted text-[11px]">
                      Until 12:00 PM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-1">
                      Duration & Guests
                    </span>
                    <span className="font-semibold text-forest block">
                      {confirmedReservation.nights} {confirmedReservation.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                    <span className="text-charcoal-muted text-[11px]">
                      {confirmedReservation.adults} Adults{confirmedReservation.children > 0 ? `, ${confirmedReservation.children} Child` : ''}
                    </span>
                  </div>
                </div>

                {/* Guest & Payment Summary */}
                <div className="p-4 bg-cream rounded-2xl border border-[#E9E4DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-0.5">
                      Primary Guest
                    </span>
                    <span className="font-semibold text-forest">
                      {confirmedReservation.guestDetails.title} {confirmedReservation.guestDetails.firstName} {confirmedReservation.guestDetails.lastName}
                    </span>
                    <span className="text-charcoal-muted block text-[11px]">
                      {confirmedReservation.guestDetails.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-0.5">
                      Payment Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>{confirmedReservation.paymentStatus === 'paid' ? 'Paid in Full' : 'Pay at Check-In'}</span>
                    </span>
                  </div>

                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E9E4DB]">
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block mb-0.5">
                      Total Tariff
                    </span>
                    <span className="font-serif text-xl font-bold text-forest">
                      ₹{confirmedReservation.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* QR Code Simulation for Touchless Reception Check-in */}
                <div className="flex items-center justify-between p-4 bg-forest/5 rounded-2xl border border-forest/20 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cream rounded-xl border border-[#E9E4DB] shadow-sm">
                      <QrCode className="w-8 h-8 text-forest" />
                    </div>
                    <div>
                      <span className="font-semibold text-forest block">
                        Reception Quick Check-in QR
                      </span>
                      <p className="text-[11px] text-charcoal-muted font-light">
                        Present this code on arrival at the front desk for instant keycard issuance.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sage hidden sm:block">
                    Valid for Stay
                  </span>
                </div>
              </div>

              {/* Action Buttons: Download PDF, Print Tax Invoice, Close */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-4 border-t border-[#E9E4DB]">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta hover:bg-[#A3573C] text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all min-h-[44px] disabled:opacity-60 cursor-pointer"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cream" />
                      <span>Generating PDF Bill...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-cream" />
                      <span>Download PDF Bill</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cream hover:bg-ivory text-forest border border-[#E9E4DB] text-xs uppercase tracking-wider font-semibold rounded-full shadow-sm transition-all min-h-[44px] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-forest" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    setIsBookingsModalOpen(true)
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#263D2F] hover:bg-[#1B2C22] text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all min-h-[44px] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-200" />
                  <span>My Reservations</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-forest hover:bg-forest-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all min-h-[44px] cursor-pointer"
                >
                  <span>Done & Return to Exploration</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

