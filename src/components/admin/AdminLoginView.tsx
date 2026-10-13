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
    <div className="min-h-[100dvh] w-full bg-[#f8f9fa] dark:bg-[#0B110E] text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none py-safe transition-colors duration-300">
      {/* Subtle Atmospheric Gradients */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-[#131D17] border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Emblem & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#047857] dark:text-emerald-400 shadow-xs">
            <Sparkles className="w-7 h-7 text-[#047857] dark:text-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-mono tracking-widest text-[#047857] dark:text-emerald-400 font-semibold uppercase">
              <ShieldCheck className="w-3 3 text-[#047857] dark:text-emerald-400" />
              <span>Restricted Administration</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold tracking-tight">
              RENOOS HOTEL
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Executive PMS & Front Desk Operations Portal
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block text-rose-800 dark:text-rose-200 mb-0.5">Authentication Failed</span>
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
                className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono font-medium"
              >
                Security Passcode
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Management Tier
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-[#0B110E] border border-slate-200 dark:border-emerald-950 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#0B110E] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 font-mono transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
                aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Authorized personnel only. Access attempts are rate-limited and logged.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full py-3.5 px-5 bg-[#047857] hover:bg-[#065f46] text-white rounded-2xl font-mono text-xs uppercase tracking-wider font-semibold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </>
            )}
          </button>
        </form>

        {/* Footer & Navigation Back to Tour */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-mono transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-400" />
            <span>Return to 360° Guest Experience</span>
          </button>

          <p className="text-[9px] text-slate-400 font-mono text-center">
            Renoos Hotel PMS Security · Encrypted Token Authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginView
