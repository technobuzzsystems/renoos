import React, { useState } from 'react'
import {
  Monitor,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Building,
  User,
  Sparkles,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface ComputerTerminalProps {
  children: React.ReactNode
  onBackToReceptionist: () => void
  onBackToHotel3D: () => void
}

export const ComputerTerminal: React.FC<ComputerTerminalProps> = ({
  children,
  onBackToReceptionist,
  onBackToHotel3D,
}) => {
  const [isEdgeToEdge, setIsEdgeToEdge] = useState(false)

  return (
    <div className="relative w-full h-full bg-[#0a100c] flex flex-col overflow-hidden select-none">
      {/* =========================================================================
          1. TERMINAL WORKSTATION TOP BAR
          ========================================================================= */}
      <header className="h-12 sm:h-14 bg-[#111c14] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between text-xs font-mono text-cream/80 z-30 shrink-0">
        {/* Left: System Status & Workstation ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">
              TERMINAL 01 · FRONT DESK
            </span>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5 text-cream/60">
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>OPERATOR: ANANYA SHARMA (FRONT DESK)</span>
          </div>

          <span className="text-white/20 hidden lg:inline">|</span>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-cream/50">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>SB FARM PMS v4.2 ONLINE</span>
          </div>
        </div>

        {/* Right: Quick Breadcrumb Navigation & Screen Size Toggle */}
        <div className="flex items-center gap-2">
          {/* Back to Receptionist */}
          <button
            type="button"
            onClick={onBackToReceptionist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-cream text-xs font-medium border border-white/15 transition-all"
            title="Step back to chat with receptionist"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Speak to Receptionist</span>
            <span className="sm:hidden">Receptionist</span>
          </button>

          {/* Back to Hotel 3D View */}
          <button
            type="button"
            onClick={onBackToHotel3D}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-cream/80 hover:text-white text-xs border border-white/10 transition-all"
            title="Step outside to 3D Hotel Grounds"
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hotel 3D</span>
          </button>

          {/* Edge-to-Edge Monitor Bezel Toggle */}
          <button
            type="button"
            onClick={() => setIsEdgeToEdge(!isEdgeToEdge)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-cream text-xs border border-white/15 transition-all"
            title={isEdgeToEdge ? 'Show Monitor Bezel' : 'Expand Edge-to-Edge'}
            aria-label="Toggle edge to edge screen"
          >
            {isEdgeToEdge ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. COMPUTER MONITOR HOUSING & SCREEN VIEWPORT
          ========================================================================= */}
      <div
        className={`flex-1 w-full h-full relative overflow-hidden transition-all duration-500 ${
          isEdgeToEdge
            ? 'p-0'
            : 'p-1.5 sm:p-3 md:p-4 bg-[#0a100c] flex items-center justify-center'
        }`}
      >
        {/* Monitor Physical Bezel Frame (when not edge-to-edge) */}
        <div
          className={`relative w-full h-full overflow-hidden transition-all duration-300 ${
            isEdgeToEdge
              ? 'rounded-none border-none'
              : 'rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-[#1f2d23] shadow-[0_0_50px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Inner Gloss / Camera Dot at Top Bezel */}
          {!isEdgeToEdge && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black/80 border border-white/20 z-40 flex items-center justify-center pointer-events-none">
              <span className="w-0.5 h-0.5 rounded-full bg-emerald-400" />
            </div>
          )}

          {/* SCREEN CONTENT: THE COMPLETE BOOKING SYSTEM & 360 SUITE EXPLORER */}
          <div className="w-full h-full relative overflow-hidden bg-[#142018]">
            {children}
          </div>

          {/* Monitor Bottom Chin / Logo Badge */}
          {!isEdgeToEdge && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-black/60 border border-white/10 text-[8px] font-mono tracking-widest text-cream/40 uppercase pointer-events-none z-40">
              SB FARM SANCTUARY · WORKSTATION 01
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ComputerTerminal

