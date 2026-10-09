import React, { useState } from 'react'
import {
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Compass,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react'
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
      setError('Please enter your administrator passcode.')
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

  return (
    <div className="min-h-[100dvh] w-full bg-[#09110D] text-cream flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none py-safe">
      {/* Subtle Atmospheric Luxury Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,#162B1F_0%,#09110D_75%)] pointer-events-none opacity-90" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-300/80 to-emerald-600" />

      {/* Decorative ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-[#132219]/95 backdrop-blur-2xl border border-amber-200/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Emblem & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400/15 to-emerald-900/30 flex items-center justify-center text-amber-200 shadow-lg shadow-black/40">
            <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-300/25 text-[10px] font-mono tracking-widest text-amber-200 uppercase">
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              <span>Restricted Administration</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-cream font-medium tracking-tight">
              RENOOS HOTEL
            </h1>
            <p className="text-xs text-cream/70 font-sans font-light">
              Executive PMS & Front Desk Operations Portal
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 bg-red-950/70 border border-red-500/40 rounded-2xl flex items-start gap-3 text-xs text-red-200 animate-in fade-in"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block text-red-300 mb-0.5">Authentication Failed</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-passcode"
                className="block text-[11px] uppercase tracking-wider text-cream/80 font-mono font-medium"
              >
                Security Passcode
              </label>
              <span className="text-[10px] text-cream/40 font-mono">
                Management Tier
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-200/70">
                <Lock className="w-4 h-4" />
              </div>

              <input
                id="admin-passcode"
                name="admin-passcode"
                type={showPasscode ? 'text' : 'password'}
                placeholder="Enter executive passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  if (error) setError(null)
                }}
                autoFocus
                autoComplete="current-password"
                aria-invalid={!!error}
                className="w-full pl-10 pr-11 py-3 bg-[#0a140f]/90 border border-cream/20 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-amber-300/80 focus:ring-2 focus:ring-amber-300/30 font-mono transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/50 hover:text-amber-200 transition-colors cursor-pointer focus:outline-none focus:text-amber-200"
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[10px] text-cream/45 font-mono leading-relaxed">
              Authorized personnel only. Access attempts are rate-limited and logged.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-800 via-[#183a24] to-emerald-800 hover:from-emerald-700 hover:via-[#1e472c] hover:to-emerald-700 text-cream border border-amber-300/30 rounded-2xl font-mono text-xs uppercase tracking-wider font-semibold shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-amber-200 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4 text-amber-200/80" />
              </>
            )}
          </button>
        </form>

        {/* Footer & Navigation Back to Tour */}
        <div className="pt-3 border-t border-cream/15 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-xs text-cream/70 hover:text-amber-200 font-mono transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-200" />
            <span>Return to 360° Guest Experience</span>
          </button>

          <p className="text-[9px] text-cream/30 font-mono text-center">
            Renoos Hotel PMS Security · Encrypted Token Authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginView
