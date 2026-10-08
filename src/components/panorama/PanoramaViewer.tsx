import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Compass,
  Camera,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Move,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react'
import type { PanoramaConfig, Hotspot } from '@/types'
import { HotspotList, PanoramaHotspot } from '../hotspots'

interface PanoramaViewerProps {
  config: PanoramaConfig
  spaceTitle: string
  roomNumber: string
  previousSpaceTitle?: string
  onReturnPreviousSpace?: () => void
  onNavigateSpace?: (targetSpaceId: string) => void
  onReturnToPhoto?: () => void
  className?: string
  hideHotspotList?: boolean
  viewportHeightClass?: string
  hideInternalHeader?: boolean
  bottomBarOffsetClass?: string
  hideInternalBottomBar?: boolean
  onHotspotClick?: (hotspot: Hotspot) => boolean | void
}

type ValidHotspot = Hotspot & { spherical: { yaw: number; pitch: number } }

/**
 * Three.js inside-out spherical panorama scene component.
 * Renders the equirectangular texture onto an inverted sphere with smooth camera rotation,
 * FOV zoom, and 60fps direct screen-projected hotspot tracking.
 */
function PanoramaMesh({
  texture,
  targetLonRef,
  targetLatRef,
  targetFovRef,
  initialYaw,
  initialPitch,
  initialFov,
  validHotspots,
  hotspotElsRef,
  onHeadingUpdate,
}: {
  texture: THREE.Texture
  targetLonRef: React.RefObject<number>
  targetLatRef: React.RefObject<number>
  targetFovRef: React.RefObject<number>
  initialYaw: number
  initialPitch: number
  initialFov: number
  validHotspots: ValidHotspot[]
  hotspotElsRef: React.RefObject<Map<string, HTMLDivElement>>
  onHeadingUpdate?: (lon: number, lat: number, fov: number) => void
}) {
  const currentLon = useRef(initialYaw)
  const currentLat = useRef(initialPitch)
  const currentFov = useRef(initialFov)
  const lastUpdate = useRef(0)

  // Reusable vectors for 60fps projection without GC overhead
  const forwardVec = useRef(new THREE.Vector3())
  const tempVec = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    // Frame-rate independent exponential smoothing
    const factor = 1 - Math.exp(-14 * Math.min(delta, 0.1))

    currentLon.current = THREE.MathUtils.lerp(
      currentLon.current,
      targetLonRef.current ?? 0,
      factor
    )
    currentLat.current = THREE.MathUtils.lerp(
      currentLat.current,
      targetLatRef.current ?? 0,
      factor
    )
    currentFov.current = THREE.MathUtils.lerp(
      currentFov.current,
      targetFovRef.current ?? 82,
      factor
    )

    // Camera pinned strictly at the center of the sphere
    const cam = state.camera as THREE.PerspectiveCamera
    cam.position.set(0, 0, 0)

    // Spherical coordinate mathematics:
    // phi is polar angle from positive Y axis down (0 to PI)
    // lat is elevation: +90° looking up, -90° looking down
    // theta is azimuthal rotation around Y axis
    const phi = THREE.MathUtils.degToRad(90 - currentLat.current)
    const theta = THREE.MathUtils.degToRad(currentLon.current)

    const x = 500 * Math.sin(phi) * Math.cos(theta)
    const y = 500 * Math.cos(phi)
    const z = 500 * Math.sin(phi) * Math.sin(theta)

    cam.lookAt(x, y, z)
    cam.updateMatrixWorld()

    // Apply FOV-based zoom to perspective camera
    if (Math.abs(cam.fov - currentFov.current) > 0.02) {
      cam.fov = currentFov.current
      cam.updateProjectionMatrix()
    }

    // Direct 60fps GPU-accelerated hotspot screen projection
    const elsMap = hotspotElsRef.current
    if (elsMap && validHotspots.length > 0) {
      const { width, height } = state.size
      cam.getWorldDirection(forwardVec.current)

      for (let i = 0; i < validHotspots.length; i++) {
        const hs = validHotspots[i]
        const el = elsMap.get(hs.id)
        if (!el) continue

        const hsPhi = THREE.MathUtils.degToRad(90 - hs.spherical.pitch)
        const hsTheta = THREE.MathUtils.degToRad(hs.spherical.yaw)

        tempVec.current.set(
          500 * Math.sin(hsPhi) * Math.cos(hsTheta),
          500 * Math.cos(hsPhi),
          500 * Math.sin(hsPhi) * Math.sin(hsTheta)
        )

        // Check if hotspot is in front of camera
        const dot = tempVec.current.dot(forwardVec.current)
        if (dot <= 0) {
          el.style.display = 'none'
          continue
        }

        tempVec.current.project(cam)

        // Verify within perspective frustum
        if (tempVec.current.z >= 1.0) {
          el.style.display = 'none'
          continue
        }

        const screenX = (tempVec.current.x * 0.5 + 0.5) * width
        const screenY = (-tempVec.current.y * 0.5 + 0.5) * height

        el.style.display = 'block'
        el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`
      }
    }

    // Throttle HUD update callback to ~10 Hz
    const now = performance.now()
    if (now - lastUpdate.current > 100 && onHeadingUpdate) {
      lastUpdate.current = now
      onHeadingUpdate(currentLon.current, currentLat.current, currentFov.current)
    }
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  config,
  spaceTitle,
  roomNumber,
  previousSpaceTitle,
  onReturnPreviousSpace,
  onNavigateSpace,
  onReturnToPhoto,
  className = '',
  hideHotspotList = false,
  viewportHeightClass,
  hideInternalHeader = false,
  bottomBarOffsetClass,
  hideInternalBottomBar = false,
  onHotspotClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hotspotElsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  // Filter valid hotspots with spherical coordinates
  const validHotspots = (config.hotspots || []).filter(
    (hs): hs is ValidHotspot => Boolean(hs.spherical)
  )

  // Camera limits and defaults from configuration
  const minFov = config.minFov ?? 40
  const maxFov = config.maxFov ?? 105
  const defaultFov = config.initialFov ?? 82
  const initialYaw = config.initialYaw ?? 0
  const initialPitch = config.initialPitch ?? 0

  // Camera target coordinates stored in refs for 60fps smoothing without re-renders
  const targetLonRef = useRef(initialYaw)
  const targetLatRef = useRef(initialPitch)
  const targetFovRef = useRef(defaultFov)

  // Viewer state - strictly data-driven based on space configuration
  const isAvailable = Boolean(config.isAvailable && !config.isPlaceholder)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isLoading, setIsLoading] = useState(isAvailable)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionTargetTitle, setTransitionTargetTitle] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [headingState, setHeadingState] = useState({ yaw: initialYaw, pitch: initialPitch, fov: defaultFov })
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  // Auto-dismiss initial gesture hint after 3.5s so it never blocks beacons
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setHasInteracted(true)
    }, 3500)
    return () => clearTimeout(hintTimer)
  }, [])

  // Developer-only calibration support (?calibrate in URL, strictly gated behind DEV mode)
  const isCalibrating =
    Boolean(import.meta.env.DEV) &&
    typeof window !== 'undefined' &&
    (window.location.search.includes('calibrate') || window.location.hash.includes('calibrate'))

  // Expose camera controls to developer console / automated calibration scripts in DEV mode only
  useEffect(() => {
    if (Boolean(import.meta.env.DEV) && typeof window !== 'undefined') {
      const win = window as unknown as {
        setCameraAim?: (yaw: number, pitch: number, fov?: number) => void
        getCameraAim?: () => { yaw: number; pitch: number; fov: number }
      }
      win.setCameraAim = (yaw: number, pitch: number, fov?: number) => {
        targetLonRef.current = yaw
        targetLatRef.current = pitch
        if (fov != null) targetFovRef.current = fov
      }
      win.getCameraAim = () => ({
        yaw: headingState.yaw,
        pitch: headingState.pitch,
        fov: headingState.fov,
      })
    }
  }, [headingState])

  // Pointer drag and pinch tracking
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const dragStartRef = useRef({ x: 0, y: 0, lon: initialYaw, lat: initialPitch })
  const pinchStartRef = useRef({ dist: 0, fov: defaultFov })

  // Auto-dismiss interaction hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInteracted(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Texture loading and transition lifecycle management
  useEffect(() => {
    if (!isAvailable) {
      return
    }

    let isCancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(
      config.imageSrc,
      (loadedTexture) => {
        if (isCancelled) {
          loadedTexture.dispose()
          return
        }
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.minFilter = THREE.LinearFilter
        loadedTexture.magFilter = THREE.LinearFilter
        loadedTexture.generateMipmaps = false

        // Update texture and cleanly dispose previous texture to eliminate GPU VRAM leaks
        setTexture((prevTexture) => {
          if (prevTexture) {
            prevTexture.dispose()
          }
          return loadedTexture
        })

        // Orient camera smoothly to new destination's data-driven orientation
        targetLonRef.current = config.initialYaw ?? 0
        targetLatRef.current = config.initialPitch ?? 0
        targetFovRef.current = config.initialFov ?? defaultFov

        setIsLoading(false)
        setLoadError(null)

        // Allow smooth crossfade dissolve
        const fadeTimer = setTimeout(() => {
          if (!isCancelled) {
            setIsTransitioning(false)
            setTransitionTargetTitle(null)
          }
        }, 300)

        return () => clearTimeout(fadeTimer)
      },
      undefined,
      (err) => {
        if (isCancelled) return
        console.error('Failed to load 360 texture:', config.imageSrc, err)
        setLoadError(`Unable to load 360° panoramic texture for ${spaceTitle}.`)
        setIsLoading(false)
        setIsTransitioning(false)
        setTransitionTargetTitle(null)
      }
    )

    return () => {
      isCancelled = true
    }
  }, [config.imageSrc, isAvailable, config.initialYaw, config.initialPitch, config.initialFov, defaultFov, spaceTitle])

  // Dispose texture on component unmount
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose()
      }
    }
  }, [texture])

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Wheel zoom handler with preventDefault to avoid scrolling the page
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      setHasInteracted(true)
      const zoomDelta = e.deltaY * 0.05
      targetFovRef.current = THREE.MathUtils.clamp(
        targetFovRef.current + zoomDelta,
        minFov,
        maxFov
      )
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [minFov, maxFov])

  // Pointer event handlers for touch and mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent starting drag when clicking on interactive buttons, hotspots, or controls
    if ((e.target as HTMLElement).closest('button, [role="button"], a, input, .pointer-events-auto')) {
      return
    }

    // Only drag with primary click or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return

    setHasInteracted(true)
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size === 1) {
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        lon: targetLonRef.current,
        lat: targetLatRef.current,
      }
    } else if (activePointers.current.size === 2) {
      // Initiate pinch to zoom
      const pts = Array.from(activePointers.current.values())
      pinchStartRef.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        fov: targetFovRef.current,
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointers.current.has(e.pointerId)) return

    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size === 2) {
      // Multi-touch pinch zoom
      const pts = Array.from(activePointers.current.values())
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (pinchStartRef.current.dist > 0) {
        const ratio = pinchStartRef.current.dist / currentDist
        targetFovRef.current = THREE.MathUtils.clamp(
          pinchStartRef.current.fov * ratio,
          minFov,
          maxFov
        )
      }
    } else if (activePointers.current.size === 1 && isDragging) {
      // Single pointer drag rotation
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      // Rotation speed is proportional to current FOV
      const speedFactor = (targetFovRef.current / (config.initialFov ?? 82)) * 0.15

      targetLonRef.current = dragStartRef.current.lon - deltaX * speedFactor
      targetLatRef.current = THREE.MathUtils.clamp(
        dragStartRef.current.lat + deltaY * speedFactor,
        -85,
        85
      )
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if capture was already released
    }

    if (activePointers.current.size === 0) {
      setIsDragging(false)
    } else if (activePointers.current.size === 1) {
      // Transition from pinch back to single-pointer drag smoothly
      const remaining = Array.from(activePointers.current.values())[0]
      dragStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        lon: targetLonRef.current,
        lat: targetLatRef.current,
      }
    }
  }

  // Keyboard navigation controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    setHasInteracted(true)
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        targetLonRef.current -= 5
        break
      case 'ArrowRight':
        e.preventDefault()
        targetLonRef.current += 5
        break
      case 'ArrowUp':
        e.preventDefault()
        targetLatRef.current = Math.min(85, targetLatRef.current + 4)
        break
      case 'ArrowDown':
        e.preventDefault()
        targetLatRef.current = Math.max(-85, targetLatRef.current - 4)
        break
      case '+':
      case '=':
        e.preventDefault()
        targetFovRef.current = Math.max(minFov, targetFovRef.current - 5)
        break
      case '-':
      case '_':
        e.preventDefault()
        targetFovRef.current = Math.min(maxFov, targetFovRef.current + 5)
        break
      case 'r':
      case 'R':
        e.preventDefault()
        resetView()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        toggleFullscreen()
        break
    }
  }

  // Camera action helpers
  const resetView = () => {
    setHasInteracted(true)
    targetLonRef.current = initialYaw
    targetLatRef.current = initialPitch
    targetFovRef.current = defaultFov
  }

  const zoomIn = () => {
    setHasInteracted(true)
    targetFovRef.current = Math.max(minFov, targetFovRef.current - 10)
  }

  const zoomOut = () => {
    setHasInteracted(true)
    targetFovRef.current = Math.min(maxFov, targetFovRef.current + 10)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err)
    }
  }

  const handleHeadingUpdate = useCallback((lon: number, lat: number, fov: number) => {
    setHeadingState({ yaw: Math.round(lon), pitch: Math.round(lat), fov: Math.round(fov) })
  }, [])

  // Handle hotspot selection & navigation
  const handleSelectHotspot = useCallback((hs: Hotspot) => {
    if (onHotspotClick) {
      const handled = onHotspotClick(hs)
      if (handled) return
    }
    setSelectedHotspot(hs)
    if (hs.type === 'navigation' && hs.targetSpaceId && onNavigateSpace) {
      setIsTransitioning(true)
      setTransitionTargetTitle(hs.title)
      onNavigateSpace(hs.targetSpaceId)
    }
  }, [onHotspotClick, onNavigateSpace])

  // If this space does not have a real 360 panorama available, show elegant placeholder state
  if (!isAvailable) {
    return (
      <div
        className={`relative bg-luxury-surface border border-luxury-border rounded-sm overflow-hidden flex flex-col ${className}`}
      >
        {/* Top Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-luxury-surface/90 border-b border-luxury-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-luxury-black border border-luxury-gold/30 text-luxury-gold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-widest text-luxury-gold font-medium">
                  360° Virtual Tour
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 rounded">
                  In Preparation
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                Room {roomNumber} · {spaceTitle}
              </p>
            </div>
          </div>

          {onReturnToPhoto && (
            <button
              onClick={onReturnToPhoto}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-luxury-gold" />
              <span>View Photography</span>
            </button>
          )}
        </div>

        {/* Unavailable Narrative Card */}
        <div className="relative p-6 sm:p-10 md:p-12 bg-gradient-to-b from-luxury-black via-luxury-surface to-luxury-black flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(198,168,125,0.06),transparent_70%)] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/30 bg-luxury-gold/5 text-luxury-gold text-xs tracking-luxurious uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panoramic Experience In Preparation</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal leading-tight">
              360° Virtual Experience Coming Soon
            </h3>

            <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed">
              An immersive 360° virtual tour for the{' '}
              <span className="text-luxury-gold font-normal">{spaceTitle}</span> is currently being prepared.
              Please explore our high-resolution photography gallery in the meantime.
            </p>

            {/* Call to action */}
            {onReturnToPhoto && (
              <div className="pt-2">
                <button
                  onClick={onReturnToPhoto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider rounded-sm hover:bg-luxury-gold-light transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>View Space Photography</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Planned Hotspots Directory */}
        {config.hotspots.length > 0 && !hideHotspotList && (
          <div className="p-4 sm:p-6 bg-luxury-card/50 border-t border-luxury-border">
            <HotspotList
              hotspots={config.hotspots}
              onSelectHotspot={handleSelectHotspot}
              selectedHotspotId={selectedHotspot?.id}
            />
          </div>
        )}
      </div>
    )
  }

  // Active 360 Panorama Viewer with real Three.js inside-out sphere and interactive 3D hotspots
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`360° Virtual Tour of Room ${roomNumber} ${spaceTitle}`}
      onKeyDown={handleKeyDown}
      className={`relative group bg-black border border-luxury-border rounded-sm overflow-hidden select-none outline-none focus:ring-1 focus:ring-luxury-gold/50 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none' : 'w-full'
      } ${className}`}
    >
      {/* 3D Canvas Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full touch-none ${
          isFullscreen
            ? 'h-full'
            : viewportHeightClass || 'aspect-[16/9] sm:aspect-[21/10] min-h-[460px] sm:min-h-[520px] md:min-h-[600px]'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {texture && (
          <Canvas
            camera={{
              position: [0, 0, 0],
              fov: defaultFov,
              near: 0.1,
              far: 1000,
            }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: false,
            }}
            className="w-full h-full"
          >
            <PanoramaMesh
              texture={texture}
              targetLonRef={targetLonRef}
              targetLatRef={targetLatRef}
              targetFovRef={targetFovRef}
              initialYaw={initialYaw}
              initialPitch={initialPitch}
              initialFov={defaultFov}
              validHotspots={validHotspots}
              hotspotElsRef={hotspotElsRef}
              onHeadingUpdate={handleHeadingUpdate}
            />
          </Canvas>
        )}

        {/* 3D Interactive Hotspots HTML Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {validHotspots.map((hs) => (
            <div
              key={hs.id}
              ref={(el) => {
                if (el) {
                  hotspotElsRef.current.set(hs.id, el)
                } else {
                  hotspotElsRef.current.delete(hs.id)
                }
              }}
              className="absolute top-0 left-0 pointer-events-auto will-change-transform"
              style={{ display: 'none', transform: 'translate3d(-9999px, -9999px, 0)' }}
            >
              <PanoramaHotspot
                hotspot={hs}
                disabled={isTransitioning}
                onClick={handleSelectHotspot}
              />
            </div>
          ))}
        </div>

        {/* Smooth Room/Space Crossfade Transition Overlay */}
        <div
          className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-15 flex flex-col items-center justify-center ${
            isTransitioning && !isLoading ? 'opacity-70' : 'opacity-0'
          }`}
        >
          {transitionTargetTitle && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-luxury-surface/80 border border-luxury-gold/40 rounded-sm backdrop-blur-md">
              <Compass className="w-4 h-4 text-luxury-gold animate-spin" />
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-200">
                Entering {transitionTargetTitle}...
              </span>
            </div>
          )}
        </div>

        {/* Loading State Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-luxury-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-25">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-luxury-gold/20 border-t-luxury-gold animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Compass className="w-6 h-6 text-luxury-gold animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm uppercase font-mono tracking-widest text-luxury-gold">
                Loading 360° Virtual Environment
              </p>
              <p className="text-xs text-neutral-400 font-light">
                Room {roomNumber} · {spaceTitle}
              </p>
            </div>
          </div>
        )}

        {/* Error State Overlay */}
        {loadError && (
          <div className="absolute inset-0 bg-luxury-black/95 flex flex-col items-center justify-center gap-4 p-6 text-center z-25">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base font-medium text-white">Panorama Texture Unavailable</h4>
              <p className="text-xs text-neutral-400 font-light">{loadError}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setLoadError(null)
                  setIsLoading(true)
                  const loader = new THREE.TextureLoader()
                  loader.load(
                    config.imageSrc,
                    (loadedTexture) => {
                      loadedTexture.colorSpace = THREE.SRGBColorSpace
                      loadedTexture.minFilter = THREE.LinearFilter
                      loadedTexture.magFilter = THREE.LinearFilter
                      loadedTexture.generateMipmaps = false
                      setTexture(loadedTexture)
                      setIsLoading(false)
                    },
                    undefined,
                    () => {
                      setLoadError('Retry failed. Please check network connection or asset path.')
                      setIsLoading(false)
                    }
                  )
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-luxury-gold text-luxury-black text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-luxury-gold-light transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              {onReturnToPhoto && (
                <button
                  onClick={onReturnToPhoto}
                  className="px-4 py-2 bg-white/10 text-white text-xs uppercase tracking-wider rounded-sm hover:bg-white/20 transition-colors"
                >
                  Return to Photos
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected Feature Hotspot Detail Drawer / Card */}
        {selectedHotspot && selectedHotspot.type !== 'navigation' && (
          <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xs z-30 animate-fade-in pointer-events-auto">
            <div className="p-4 bg-luxury-black/95 border border-luxury-gold/50 backdrop-blur-xl rounded-sm shadow-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono tracking-widest text-luxury-gold font-medium">
                  {selectedHotspot.category || 'Architectural Detail'}
                </span>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="text-neutral-400 hover:text-white p-1 transition-colors"
                  aria-label="Close feature details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-serif text-sm text-white font-medium">
                {selectedHotspot.title}
              </h4>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                {selectedHotspot.description}
              </p>
            </div>
          </div>
        )}

        {/* Developer Hotspot Calibration Overlay (Active only when ?calibrate is in URL in DEV mode) */}
        {isCalibrating && (
          <>
            <div
              data-calibration-reticle
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border border-luxury-gold/80 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
              </div>
            </div>
            <div
              data-calibration-panel
              className="absolute top-20 left-4 z-30 p-2.5 bg-black/90 border border-luxury-gold text-[11px] font-mono text-luxury-gold rounded shadow-xl pointer-events-none"
            >
              <span className="font-semibold block text-[10px] text-white">CALIBRATION RETICLE</span>
              <span>Yaw: {headingState.yaw}° · Pitch: {headingState.pitch}°</span>
            </div>
          </>
        )}

        {/* First-Interaction Gesture Hint */}
        <div
          className={`absolute top-[36%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 z-10 ${
            hasInteracted || isLoading || loadError ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/80 border border-luxury-gold/40 text-neutral-200 backdrop-blur-md shadow-2xl max-w-[90vw]">
            <Move className="w-3.5 h-3.5 text-luxury-gold animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-medium text-white text-center">
              Drag in 360° to look around · Click beacons to explore
            </span>
          </div>
        </div>

        {/* Top Header Overlay Bar */}
        {!hideInternalHeader && (
          <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between pointer-events-none z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Room & Space Info */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="p-2 rounded bg-black/60 border border-luxury-gold/40 text-luxury-gold backdrop-blur-md shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-widest text-luxury-gold font-medium">
                    360° Virtual Tour
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Experience
                  </span>
                </div>
                <p className="text-xs text-neutral-200 font-light mt-0.5">
                  Room {roomNumber} · {spaceTitle}
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Quick Return to Previous Space Button (if traversed via hotspot) */}
              {previousSpaceTitle && onReturnPreviousSpace && (
                <button
                  onClick={onReturnPreviousSpace}
                  disabled={isTransitioning}
                  aria-label={`Return to ${previousSpaceTitle}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/90 text-neutral-200 hover:text-luxury-gold border border-white/15 hover:border-luxury-gold/50 text-xs uppercase tracking-wider rounded-sm backdrop-blur-md transition-all shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="hidden sm:inline">
                    Back to {previousSpaceTitle.split(' ')[0]}
                  </span>
                  <span className="sm:hidden">Back</span>
                </button>
              )}

              {onReturnToPhoto && (
                <button
                  onClick={onReturnToPhoto}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/60 hover:bg-black/90 text-neutral-200 hover:text-white border border-white/15 hover:border-luxury-gold/40 text-xs uppercase tracking-wider rounded-sm backdrop-blur-md transition-all shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="hidden sm:inline">View Photography</span>
                  <span className="sm:hidden">Photos</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive HUD & Controls Bar */}
        {!hideInternalBottomBar && (
          <div className={`absolute ${bottomBarOffsetClass || 'bottom-3 sm:bottom-4'} inset-x-0 px-4 sm:px-5 flex items-end justify-end pointer-events-none z-10`}>
            {/* Floating Controls Dock */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 p-1.5 bg-black/80 border border-white/15 rounded-sm backdrop-blur-md shadow-2xl pointer-events-auto"
            >
            {/* Zoom In */}
            <button
              onClick={zoomIn}
              disabled={headingState.fov <= minFov}
              aria-label="Zoom in"
              title="Zoom In (+)"
              className="p-2.5 rounded-sm text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={zoomOut}
              disabled={headingState.fov >= maxFov}
              aria-label="Zoom out"
              title="Zoom Out (-)"
              className="p-2.5 rounded-sm text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Reset View */}
            <button
              onClick={resetView}
              aria-label="Reset View"
              title="Reset View (R)"
              className="p-2.5 rounded-sm text-neutral-300 hover:text-luxury-gold hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              className="p-2.5 rounded-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Pre-Mapped Room Features & Hotspots Drawer */}
      {config.hotspots.length > 0 && !isFullscreen && !hideHotspotList && (
        <div className="p-4 sm:p-5 bg-luxury-card/50 border-t border-luxury-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-luxury-gold">
              Room Highlights ({config.hotspots.length})
            </span>
            <span className="text-[10px] text-neutral-400 font-light">
              Select any point to navigate or view details
            </span>
          </div>

          <HotspotList
            hotspots={config.hotspots}
            onSelectHotspot={handleSelectHotspot}
            selectedHotspotId={selectedHotspot?.id}
          />
        </div>
      )}
    </div>
  )
}
