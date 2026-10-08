import React, { useState } from 'react'
import {
  X,
  Phone,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // Form Fields
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // UI State
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    setError(null)
    setSuccessMsg(null)
    setPhone('')
    setPassword('')
    setFullName('')
    setEmail('')
  }

  const handleTabSwitch = (newTab: 'login' | 'register') => {
    setTab(newTab)
    setError(null)
    setSuccessMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Validation
    const rawDigits = phone.replace(/\D/g, '')
    if (rawDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    const cleanPhone = rawDigits.slice(-10)

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    if (tab === 'register' && (!fullName.trim() || fullName.trim().length < 2)) {
      setError('Please enter your full name')
      return
    }

    setIsLoading(true)

    try {
      if (tab === 'login') {
        const loggedInUser = await login(cleanPhone, password)
        setSuccessMsg(`Welcome back, ${loggedInUser.fullName}!`)
      } else {
        const newUser = await register(fullName.trim(), cleanPhone, password, email.trim() || undefined)
        setSuccessMsg(`Account created successfully! Welcome, ${newUser.fullName}.`)
      }

      setTimeout(() => {
        resetForm()
        onClose()
        if (onSuccess) onSuccess()
      }, 700)
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-[#FAF8F5] border border-[#E9E4DB] rounded-3xl shadow-2xl overflow-hidden text-[#1C231E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#263D2F] via-[#B8684A] to-[#263D2F]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-[#E9E4DB]/80">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#B8684A] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renoos Hotel Guest Portal</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#263D2F] mt-1">
              {tab === 'login' ? 'Sign In to Your Account' : 'Create Guest Profile'}
            </h3>
            <p className="text-xs text-[#646E68] mt-1">
              {tab === 'login'
                ? 'Access your confirmed reservations, room keys & tax invoices'
                : 'Register with your mobile number for seamless reservations'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#646E68] hover:text-[#263D2F] hover:bg-black/5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex bg-[#EFEAE2] p-1 rounded-2xl border border-[#E9E4DB]">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-white text-[#263D2F] shadow-sm'
                  : 'text-[#646E68] hover:text-[#263D2F]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-white text-[#263D2F] shadow-sm'
                  : 'text-[#646E68] hover:text-[#263D2F]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {tab === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#263D2F] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C9690] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E4DB] rounded-xl text-xs text-[#1C231E] focus:outline-none focus:ring-2 focus:ring-[#263D2F]/20 focus:border-[#263D2F]"
                />
              </div>
            </div>
          )}

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#263D2F] uppercase tracking-wider block">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8C9690] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="10-digit mobile (e.g. 9876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E4DB] rounded-xl text-xs font-mono text-[#1C231E] focus:outline-none focus:ring-2 focus:ring-[#263D2F]/20 focus:border-[#263D2F]"
              />
            </div>
            <p className="text-[10px] text-[#8C9690]">Used to retrieve all past and active hotel reservations.</p>
          </div>

          {/* Email (Optional, Sign Up only) */}
          {tab === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#263D2F] uppercase tracking-wider block">
                Email Address <span className="text-[#8C9690] font-normal">(Optional for invoice copy)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C9690] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E4DB] rounded-xl text-xs text-[#1C231E] focus:outline-none focus:ring-2 focus:ring-[#263D2F]/20 focus:border-[#263D2F]"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#263D2F] uppercase tracking-wider block">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C9690] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password (min 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E9E4DB] rounded-xl text-xs font-mono text-[#1C231E] focus:outline-none focus:ring-2 focus:ring-[#263D2F]/20 focus:border-[#263D2F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9690] hover:text-[#263D2F]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#263D2F] hover:bg-[#1A2A20] text-white text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-[#8C9690]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#263D2F]" />
            <span>256-bit encrypted authentication · Renoos Hotel PMS</span>
          </div>
        </form>
      </div>
    </div>
  )
}
