import React, { useState, useRef, useMemo, useEffect } from 'react'
import {
  Sparkles,
  Compass,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trees,
  Maximize2,
  RotateCcw,
  Camera,
  Eye,
} from 'lucide-react'
import { PanoramaViewer } from '../panorama/PanoramaViewer'
import { GuestAccountButton } from '@/components/auth'
import { ESTATE_GARDEN_DATA } from '@/data/rooms'

export type OutdoorArea = 'entrance' | 'garden'

interface Hotel3DSceneProps {
  onEnterReception: () => void
  initialArea?: OutdoorArea
}

/**
 * STAGE 1: Full-Screen 360° Hotel Exterior Virtual Tour
 * Coordinates the outdoor hotel areas:
 * 1. Grand Entrance & Lakeside Pavilion Grounds
 * 2. Lakeside Estate Garden with artisanal lawn swing & sunset vistas
 * Features seamless bidirectional navigation between Entrance and Garden,
 * and direct walk-in transition into the 360° Grand Lobby.
 */
export const Hotel3DScene: React.FC<Hotel3DSceneProps> = ({
  onEnterReception,
  initialArea = 'entrance',
}) => {
  const [currentArea, setCurrentArea] = useState<OutdoorArea>(initialArea)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isWalkingIn, setIsWalkingIn] = useState(false)
  const [isTransitioningArea, setIsTransitioningArea] = useState(false)
  const [areaTransitionMessage, setAreaTransitionMessage] = useState<string | null>(null)
  const [isCardMinimized, setIsCardMinimized] = useState(false)

  // Garden view mode: 360° Virtual Tour or high-res Photography
  const [gardenViewMode, setGardenViewMode] = useState<'360' | 'photo'>('360')
  const [activeGardenPhotoIdx, setActiveGardenPhotoIdx] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)

  // Sync if initialArea prop changes externally
  useEffect(() => {
    if (initialArea && initialArea !== currentArea) {
      setCurrentArea(initialArea)
    }
  }, [initialArea])

  // Gentle Welcoming Chime & Walk-in Transition into Reception Lobby
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

  // Smooth Atmospheric Transition between Entrance and Garden
  const handleSwitchArea = (nextArea: OutdoorArea) => {
    if (currentArea === nextArea || isTransitioningArea) return
    setIsTransitioningArea(true)
    setAreaTransitionMessage(
      nextArea === 'garden'
        ? 'Strolling into Lakeside Estate Garden...'
        : 'Returning to Hotel Exterior Entrance...'
    )

    setTimeout(() => {
      setCurrentArea(nextArea)
      setGardenViewMode('360')
      setIsTransitioningArea(false)
      setAreaTransitionMessage(null)
    }, 450)
  }

  // Unified Hotspot Space Navigation
  const handleNavigateSpace = (targetSpaceId: string) => {
    if (targetSpaceId === 'reception') {
      handleWalkIntoReception()
    } else if (targetSpaceId === 'garden') {
      handleSwitchArea('garden')
    } else if (targetSpaceId === 'entrance' || targetSpaceId === 'exterior') {
      handleSwitchArea('entrance')
    }
  }

  // Gentle Sanctuary Mountain Breeze Ambient Sound
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

  // 1. Hotel Exterior Grand Entrance 360° Panorama
  const entrancePanoramaConfig = useMemo(
    () => ({
      imageSrc: '/images/Renos Hotel at Golden Hour.png',
      aspectRatio: '2:1' as const,
      initialFov: 90,
      minFov: 40,
      maxFov: 110,
      initialPitch: -2,
      initialYaw: 180,
      isPlaceholder: false,
      isAvailable: true,
      caption: 'Renoos Hotel — 360° Panoramic Hotel Exterior',
      hotspots: [
        {
          id: 'hs-entrance-walk',
          title: 'Walk to Reception Desk',
          description: 'Step through the entrance door into the 360° Grand Lobby',
          type: 'navigation' as const,
          spherical: { yaw: 180, pitch: -2.5 },
          targetSpaceId: 'reception',
          category: 'Hotel Entrance',
        },
        {
          id: 'hs-entrance-to-garden',
          title: 'Explore Garden',
          description: 'Walk across the manicured lawn to the Lakeside Estate Garden',
          type: 'navigation' as const,
          spherical: { yaw: 85, pitch: -3.5 },
          targetSpaceId: 'garden',
          category: 'Estate Grounds',
        },
      ],
    }),
    []
  )

  // 2. Lakeside Estate Garden 360° Panorama
  const gardenPanoramaConfig = useMemo(() => {
    return (
      ESTATE_GARDEN_DATA.panorama || {
        imageSrc: '/panoramas/garden/garden.jpg',
        aspectRatio: '2:1' as const,
        initialFov: 82,
        minFov: 40,
        maxFov: 105,
        initialPitch: 0,
        initialYaw: 0,
        isPlaceholder: false,
        isAvailable: true,
        caption: '360° Equirectangular Panoramic View — Lakeside Estate Garden',
        hotspots: [],
      }
    )
  }, [])

  const gardenPhotos = useMemo(() => {
    return (
      ESTATE_GARDEN_DATA.images.gallery || [
        '/panoramas/garden/garden-3.avif',
        '/panoramas/garden/garden-2.avif',
        '/panoramas/garden/garden-4.avif',
        '/panoramas/garden/garden-1.avif',
      ]
    )
  }, [])

  return (
    <div className="relative w-full h-full bg-[#0d1510] overflow-hidden select-none">
      {/* =========================================================================
          1. 360° PHOTOGRAPHIC VIRTUAL TOUR VIEWPORT
          Includes cinematic push-in scale when walking in, or area transition
          ========================================================================= */}
      <div
        className={`w-full h-full relative transition-all duration-700 ease-out ${
          isWalkingIn
            ? 'scale-[1.14] -translate-y-2 filter blur-[2px] opacity-80'
            : isTransitioningArea
            ? 'scale-[1.03] filter blur-[1px] opacity-70'
            : 'scale-100 translate-y-0 filter-none opacity-100'
        }`}
      >
        {/* VIEW A: GRAND ENTRANCE 360° */}
        {currentArea === 'entrance' && (
          <PanoramaViewer
            config={entrancePanoramaConfig}
            spaceTitle="Grand Resort Exterior"
            roomNumber="Sanctuary"
            onNavigateSpace={handleNavigateSpace}
            hideHotspotList={true}
            hideInternalHeader={true}
            bottomBarOffsetClass={
              isCardMinimized ? 'bottom-4 sm:bottom-6' : 'bottom-36 sm:bottom-32 md:bottom-6'
            }
            viewportHeightClass="h-full w-full"
            className="h-full w-full"
          />
        )}

        {/* VIEW B: LAKESIDE ESTATE GARDEN */}
        {currentArea === 'garden' && (
          <>
            {gardenViewMode === '360' ? (
              <PanoramaViewer
                config={gardenPanoramaConfig}
                spaceTitle="Lakeside Estate Garden"
                roomNumber="Sanctuary"
                onNavigateSpace={handleNavigateSpace}
                hideHotspotList={true}
                hideInternalHeader={true}
                bottomBarOffsetClass={
                  isCardMinimized ? 'bottom-4 sm:bottom-6' : 'bottom-36 sm:bottom-32 md:bottom-6'
                }
                viewportHeightClass="h-full w-full"
                className="h-full w-full"
              />
            ) : (
              /* Garden High-Res Photo Mode */
              <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-8 bg-[#0a120c]">
                <img
                  src={gardenPhotos[activeGardenPhotoIdx]}
                  alt="Lakeside Estate Garden"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-cream/20"
                />
              </div>
            )}
          </>
        )}
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

      {/* Atmospheric Area Transition Dissolve Overlay */}
      {isTransitioningArea && (
        <div className="absolute inset-0 bg-[#16251C]/85 z-40 flex flex-col items-center justify-center space-y-3 animate-fade-in backdrop-blur-md pointer-events-none">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-cream/30 border-t-cream animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              {currentArea === 'entrance' ? (
                <Trees className="w-5 h-5 text-emerald-300 animate-pulse" />
              ) : (
                <Compass className="w-5 h-5 text-amber-200 animate-pulse" />
              )}
            </div>
          </div>
          <div className="text-center space-y-1">
            <span className="font-serif text-lg text-cream font-medium tracking-wide block">
              {areaTransitionMessage}
            </span>
            <span className="text-[10px] font-mono text-cream/70 uppercase tracking-widest block">
              Renoos Hotel · Luxury Nature Sanctuary
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. TOP HEADER HUD OVERLAY (Minimal, Editorial, Unobtrusive)
          ========================================================================= */}
      <header className="absolute top-0 inset-x-0 p-3 sm:p-6 flex items-center justify-between pointer-events-none z-20 bg-gradient-to-b from-black/85 via-black/50 to-transparent pt-safe">
        {/* Brand Header & Outdoor Area Pills */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-cream/20 bg-[#16251C]/75 backdrop-blur-md flex items-center justify-center text-cream shadow-lg shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif text-base sm:text-xl text-cream font-medium tracking-tight">
                  RENOOS HOTEL
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cream/15 border border-cream/20 text-cream/90 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">
                  360°
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-cream/70 font-light font-mono hidden xs:block">
                {currentArea === 'entrance' ? 'Grand Resort Exterior' : 'Lakeside Estate Garden'}
              </p>
            </div>
          </div>

          {/* Outdoor Area Segmented Switcher Pills */}
          <div className="hidden md:flex items-center p-1 rounded-full bg-[#16251C]/80 backdrop-blur-md border border-cream/20 shadow-md">
            <button
              type="button"
              onClick={() => handleSwitchArea('entrance')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                currentArea === 'entrance'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Grand Entrance</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchArea('garden')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                currentArea === 'garden'
                  ? 'bg-cream text-[#16251C] font-semibold shadow-sm'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Lakeside Garden</span>
            </button>
          </div>
        </div>

        {/* Top Controls: Return to Exterior (if in garden), Audio, Guest Account, Walk to Reception */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3">
          {/* Quick Return to Exterior Button (Visible when in Garden) */}
          {currentArea === 'garden' && (
            <button
              type="button"
              onClick={() => handleSwitchArea('entrance')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16251C]/80 hover:bg-[#16251C] text-cream border border-cream/20 backdrop-blur-md text-[11px] font-mono transition-all shadow-md cursor-pointer"
              title="Return to Hotel Entrance"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cream" />
              <span className="hidden sm:inline">Grand Entrance</span>
              <span className="sm:hidden">Entrance</span>
            </button>
          )}

          {/* Guest Account / Portal Trigger */}
          <GuestAccountButton variant="dark" />

          {/* Nature Breeze Ambience Toggle */}
          <button
            type="button"
            onClick={toggleSanctuarySound}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#16251C]/70 hover:bg-[#16251C]/90 text-cream/80 hover:text-cream border border-cream/20 backdrop-blur-md text-xs font-mono flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Toggle Nature Sound Ambience"
            aria-label="Toggle Nature Sound Ambience"
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
            className="hidden sm:flex px-4 py-2 rounded-full bg-cream hover:bg-white text-[#16251C] font-semibold text-xs font-mono items-center gap-1.5 transition-all shadow-lg cursor-pointer transform hover:scale-105"
          >
            <Compass className="w-3.5 h-3.5 text-[#16251C]" />
            <span>Walk to Reception</span>
            <ArrowRight className="w-3 h-3 text-[#16251C]" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. BOTTOM INTERACTION CARD: ENTRANCE OR GARDEN DETAILS
          ========================================================================= */}
      <div className="absolute bottom-3 sm:bottom-5 inset-x-0 flex justify-center pointer-events-none z-20 px-3 sm:px-4 pb-safe">
        {isCardMinimized ? (
          <button
            type="button"
            onClick={() => setIsCardMinimized(false)}
            className="pointer-events-auto px-4 py-2.5 rounded-full bg-[#16251C]/90 hover:bg-[#16251C] backdrop-blur-xl border border-cream/25 text-cream text-xs font-mono flex items-center gap-2 shadow-2xl transition-all cursor-pointer animate-fade-in"
          >
            {currentArea === 'entrance' ? (
              <Compass className="w-4 h-4 text-emerald-300" />
            ) : (
              <Trees className="w-4 h-4 text-emerald-300" />
            )}
            <span>
              {currentArea === 'entrance' ? 'Open Entrance Card' : 'Open Garden Card'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
          </button>
        ) : (
          <div className="pointer-events-auto max-w-lg w-full bg-[#16251C]/90 backdrop-blur-xl border border-cream/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl space-y-2.5 sm:space-y-3 text-cream animate-fade-in">
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold">
                  {currentArea === 'entrance'
                    ? 'Lakeside Grounds & Pavilion'
                    : 'Lakeside Estate Garden · Outdoor Grounds'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentArea === 'garden' ? (
                  <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setGardenViewMode('360')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        gardenViewMode === '360'
                          ? 'bg-cream text-[#16251C] font-semibold'
                          : 'text-cream/70 hover:text-white'
                      }`}
                    >
                      360°
                    </button>
                    <button
                      type="button"
                      onClick={() => setGardenViewMode('photo')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        gardenViewMode === 'photo'
                          ? 'bg-cream text-[#16251C] font-semibold'
                          : 'text-cream/70 hover:text-white'
                      }`}
                    >
                      Photos
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-cream/60 hidden xs:inline">
                    3 Bespoke Suites
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsCardMinimized(true)}
                  className="text-[10px] font-mono text-cream/50 hover:text-cream px-1.5 py-0.5 rounded bg-cream/10 border border-cream/15 cursor-pointer"
                  title="Minimize card to explore full view"
                >
                  Hide
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] sm:text-xs text-cream/80 font-light leading-relaxed line-clamp-2 sm:line-clamp-none">
              {currentArea === 'entrance'
                ? 'Drag to explore the 360° sanctuary grounds. Click "Explore Garden" to stroll the lakeside lawn, or tap below to walk into the 360° Grand Lobby.'
                : 'Sprawling lakeside lawn featuring an artisanal lawn swing, relaxed patio seating, and panoramic sunset vistas. Stroll the 360° grounds, return to the entrance, or enter the lobby to reserve.'}
            </p>

            {/* Garden Photo Filmstrip (when in Garden mode) */}
            {currentArea === 'garden' && gardenViewMode === 'photo' && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {gardenPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGardenPhotoIdx(idx)}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeGardenPhotoIdx === idx
                        ? 'border-cream scale-105 shadow-md'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
              {currentArea === 'entrance' ? (
                <>
                  <button
                    type="button"
                    onClick={handleWalkIntoReception}
                    className="flex-1 py-2.5 sm:py-3 px-4 bg-cream hover:bg-white text-[#16251C] font-semibold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#16251C]" />
                    <span>Walk to Reception</span>
                    <ArrowRight className="w-4 h-4 text-[#16251C]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchArea('garden')}
                    className="py-2.5 sm:py-3 px-4 bg-[#142318] hover:bg-[#1a2d1f] text-cream border border-cream/25 font-semibold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trees className="w-4 h-4 text-emerald-300" />
                    <span>Explore Garden</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleWalkIntoReception}
                    className="flex-1 py-2.5 sm:py-3 px-4 bg-cream hover:bg-white text-[#16251C] font-semibold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#16251C]" />
                    <span>Walk to Reception</span>
                    <ArrowRight className="w-4 h-4 text-[#16251C]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchArea('entrance')}
                    className="py-2.5 sm:py-3 px-4 bg-[#142318] hover:bg-[#1a2d1f] text-cream border border-cream/25 font-semibold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-cream" />
                    <span>Return to Exterior</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hotel3DScene
