import React, { useState } from 'react'
import { Sparkles, Lock, ArrowRight, ShieldCheck, AlertCircle, Compass, Eye, EyeOff } from 'lucide-react'
import { adminLoginApi, type AdminSession } from '@/services/adminApi'

interface AdminLoginViewProps {
  onSuccess: (session: AdminSession) => void
  onExit: () => void
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onExit }) => {
  const [passcode, setPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim()) {
      setError('Please enter the administrator passcode')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const session = await adminLoginApi(passcode)
      onSuccess(session)
    } catch (err: any) {
      setError(err.message || 'Invalid administrator passcode. Access denied.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFillDemo = () => {
    setPasscode('renoos2026')
    setError(null)
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#0E1712] text-cream flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden select-none py-safe">
      {/* Subtle Atmospheric Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#1F3A29_0%,#0E1712_70%)] pointer-events-none opacity-80" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-300 to-terracotta" />

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-[#16251C]/90 backdrop-blur-2xl border border-amber-200/25 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        {/* Emblem & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-amber-200 shadow-lg">
            <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-200/80 uppercase">
              Property Management System
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-cream font-medium tracking-tight mt-0.5">
              RENOOS HOTEL
            </h1>
            <p className="text-xs text-cream/70 font-light mt-1">
              Executive PMS Administration & Front Desk Control
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-cream/70 font-mono mb-1.5 flex items-center justify-between">
              <span>Security Passcode</span>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="text-amber-200 hover:text-white underline text-[10px] lowercase cursor-pointer"
              >
                auto-fill demo key
              </button>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/50">
                <Lock className="w-4 h-4 text-amber-200/70" />
              </div>
              <input
                type={showPasscode ? 'text' : 'password'}
                placeholder="Enter master passcode (e.g. renoos2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-[#0d1712]/90 border border-cream/20 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-amber-300/80 focus:ring-1 focus:ring-amber-300/60 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/50 hover:text-cream cursor-pointer"
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-cream/50 font-mono mt-1.5">
              Authorized personnel only. Default master passcode: <code className="text-amber-200">renoos2026</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-700 to-[#1E3325] hover:from-emerald-600 hover:to-[#254230] text-cream border border-emerald-400/30 rounded-2xl font-mono text-xs uppercase tracking-wider font-semibold shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />
                <span>Authorizing Executive Access...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link: Return to Public Experience */}
        <div className="pt-2 border-t border-cream/15 flex items-center justify-center">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-xs text-cream/70 hover:text-cream font-mono transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-200" />
            <span>Return to 360° Hotel Experience</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginView

