import React, { useState, useRef, useMemo } from 'react'
import {
  Sparkles,
  Compass,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
} from 'lucide-react'
import { PanoramaViewer } from '../panorama/PanoramaViewer'
import { GuestAccountButton } from '@/components/auth'

interface Hotel3DSceneProps {
  onEnterReception: () => void
}

/**
 * STAGE 1: Full-Screen 360° Hotel Exterior Virtual Tour
 * Uses real 4K equirectangular panorama of Renoos Hotel's grand entrance pavilion.
 * Features ONE elegant entrance hotspot ("Walk to Reception") and a short cinematic forward
 * dolly/walk-in transition into the grand lobby.
 */
export const Hotel3DScene: React.FC<Hotel3DSceneProps> = ({ onEnterReception }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isWalkingIn, setIsWalkingIn] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Cinematic Walk-In Forward Dolly Transition & Doorway Chime
  const handleWalkIntoReception = () => {
    if (isWalkingIn) return
    setIsWalkingIn(true)

    // Gentle welcoming chime via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.35) // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.8)
      }
    } catch {
      // Audio policy ignored
    }

    // Short cinematic transition before loading reception scene
    setTimeout(() => {
      onEnterReception()
    }, 750)
  }

  // Gentle Sanctuary Mountain Breeze ambient sound synthesis
  const toggleSanctuarySound = () => {
    if (!isAudioPlaying) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()
        audioCtxRef.current = ctx

        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0,
          b1 = 0,
          b2 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          output[i] = (b0 + b1 + b2) * 0.04
        }
        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(360, ctx.currentTime)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        whiteNoise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        whiteNoise.start(0)
        setIsAudioPlaying(true)
      } catch {
        // Audio policy ignored
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      setIsAudioPlaying(false)
    }
  }

  // True Equirectangular 360 Grounds & Grand Entrance Panorama Configuration (User Uploaded Reference)
  const exteriorPanoramaConfig = useMemo(
    () => ({
      imageSrc: '/images/Renos Hotel at Golden Hour.png',
      aspectRatio: '2:1' as const,
      initialFov: 90,
      minFov: 40,
      maxFov: 110,
      initialPitch: -2,
      initialYaw: 0,
      isPlaceholder: false,
      isAvailable: true,
      caption: 'Renoos Hotel — 360° Panoramic Hotel Exterior',
      hotspots: [
        {
          id: 'hs-entrance-walk',
          title: 'Walk to Receptionist',
          description: 'Step through the entrance door into the 360° Grand Lobby',
          type: 'navigation' as const,
          spherical: { yaw: -6.5, pitch: -3.5 },
          targetSpaceId: 'reception',
          category: 'Hotel Entrance',
        },
      ],
    }),
    []
  )

  return (
    <div className="relative w-full h-full bg-[#0d1510] overflow-hidden select-none">
      {/* =========================================================================
          1. 360° PHOTOGRAPHIC VIRTUAL TOUR VIEWPORT
          Includes cinematic forward push-in scale & depth blur when walking in
          ========================================================================= */}
      <div
        className={`w-full h-full relative transition-all duration-700 ease-out ${
          isWalkingIn
            ? 'scale-[1.14] -translate-y-2 filter blur-[2px] opacity-80'
            : 'scale-100 translate-y-0 filter-none opacity-100'
        }`}
      >
        <PanoramaViewer
          config={exteriorPanoramaConfig}
          spaceTitle="Grand Resort Exterior"
          roomNumber="Sanctuary"
          onNavigateSpace={() => handleWalkIntoReception()}
          hideHotspotList={true}
          hideInternalHeader={true}
          bottomBarOffsetClass="bottom-56 sm:bottom-6"
          viewportHeightClass="h-full w-full"
          className="h-full w-full"
        />
      </div>

      {/* Cinematic Forward Walk-In Warm Light Dissolve Overlay */}
      {isWalkingIn && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#16251C]/90 via-[#16251C]/60 to-transparent z-40 flex flex-col items-center justify-center space-y-4 animate-fade-in pointer-events-none backdrop-blur-sm">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="w-5 h-5 text-cream animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <span className="font-serif text-xl sm:text-2xl text-cream font-medium tracking-wide block">
              Entering Grand Lobby
            </span>
            <span className="text-[10px] font-mono text-cream/70 uppercase tracking-widest block">
              Walking into Renoos Hotel...
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. TOP HEADER HUD OVERLAY (Minimal, Editorial, Unobtrusive)
          ========================================================================= */}
      <header className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between pointer-events-none z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Brand Header */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-cream/20 bg-[#16251C]/75 backdrop-blur-md flex items-center justify-center text-cream shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl text-cream font-medium tracking-tight">
                RENOOS HOTEL
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cream/15 border border-cream/20 text-cream/90 text-[10px] font-mono uppercase tracking-wider">
                360° Exterior
              </span>
            </div>
            <p className="text-xs text-cream/70 font-light font-mono">
              Luxury Mountain Resort · India
            </p>
          </div>
        </div>

        {/* Top Controls: Sound Ambience, Guest Account & Direct Walk In */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Guest Account / Portal Trigger */}
          <GuestAccountButton variant="dark" />

          {/* Nature Breeze Ambience Toggle */}
          <button
            type="button"
            onClick={toggleSanctuarySound}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#16251C]/70 hover:bg-[#16251C]/90 text-cream/80 hover:text-cream border border-cream/20 backdrop-blur-md text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
            title="Toggle Nature Sound Ambience"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">Breeze On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-cream/60" />
                <span className="hidden sm:inline text-[11px]">Sound Off</span>
              </>
            )}
          </button>

          {/* Primary Walk to Reception Action */}
          <button
            type="button"
            onClick={handleWalkIntoReception}
            className="px-4 py-2 rounded-full bg-cream hover:bg-white text-[#16251C] font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg cursor-pointer transform hover:scale-105"
          >
            <Compass className="w-3.5 h-3.5 text-[#16251C]" />
            <span>Walk to Receptionist</span>
            <ArrowRight className="w-3 h-3 text-[#16251C]" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. BOTTOM INTERACTION CARD: ELEGANT ENTRANCE INVITATION
          ========================================================================= */}
      <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none z-20 px-3 sm:px-4">
        <div className="pointer-events-auto max-w-lg w-full bg-[#16251C]/80 backdrop-blur-xl border border-cream/20 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2.5 text-cream">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold">
                Lakeside Grounds & Pavilion
              </span>
            </div>
            <span className="text-[10px] font-mono text-cream/60">
              3 Bespoke Suites
            </span>
          </div>

          <p className="text-xs text-cream/80 font-light leading-relaxed">
            Drag to explore the 360° sanctuary grounds. When you are ready, click the entrance door spot to walk into the 360° Grand Lobby and meet the receptionist.
          </p>

          <button
            type="button"
            onClick={handleWalkIntoReception}
            className="w-full py-3 px-5 bg-cream hover:bg-white text-[#16251C] font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#16251C]" />
            <span>Walk to Receptionist & Book Rooms</span>
            <ArrowRight className="w-4 h-4 text-[#16251C]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hotel3DScene
