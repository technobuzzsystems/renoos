import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box as BoxIcon,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Camera,
  Compass,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { Model3DConfig } from '@/types'

interface Model3DViewerProps {
  config?: Model3DConfig
  spaceTitle: string
  roomNumber: string
  onReturnToPhoto?: () => void
  onExplore360?: () => void
  className?: string
}

interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.reset)
    }
    return this.props.children
  }
}

/**
 * Architectural 3D loading overlay rendered inside Three.js scene
 */
function ModelLoadingState() {
  return (
    <Html center>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-luxury-gold/40 bg-luxury-black/95 backdrop-blur-md shadow-2xl text-neutral-200 pointer-events-none whitespace-nowrap">
        <RefreshCw className="w-4 h-4 text-luxury-gold animate-spin" />
        <span className="text-xs uppercase font-mono tracking-wider">
          Loading 3D Spatial Model...
        </span>
      </div>
    </Html>
  )
}

/**
 * GLTF/GLB Model instance component rendered inside R3F Canvas with disposal on unmount
 */
function ModelInstance({
  url,
  scale,
}: {
  url: string
  scale?: [number, number, number] | number
}) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    return () => {
      // Clean up geometries and materials on unmount
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh
          mesh.geometry?.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else if (mesh.material) {
            mesh.material.dispose()
          }
        }
      })
    }
  }, [scene])

  return <primitive object={scene} scale={scale ?? 1} />
}

/**
 * Three.js scene container for 3D spatial models
 */
function ModelScene({
  url,
  scale,
  initialTarget,
  controlsRef,
}: {
  url: string
  scale?: [number, number, number] | number
  initialTarget: [number, number, number]
  controlsRef: React.RefObject<any>
}) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, 8, -8]} intensity={0.4} />
      <hemisphereLight intensity={0.35} groundColor="#141414" color="#f5f5f5" />

      <Suspense fallback={<ModelLoadingState />}>
        <ModelInstance url={url} scale={scale} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 + 0.05}
        target={initialTarget}
      />
    </>
  )
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  config,
  spaceTitle,
  roomNumber,
  onReturnToPhoto,
  onExplore360,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Architectural dimension fallbacks
  const width = config?.dimensions?.widthMeters || 5.0
  const length = config?.dimensions?.lengthMeters || 4.5
  const floorArea = Math.round(width * length)

  // Determine if a real, valid model asset is configured
  const modelUrl = config?.modelSrc || config?.src
  const isRealModel = Boolean(modelUrl && !config?.isPlaceholder)

  // Camera vantage and orbit targets
  const initialCamPos = React.useMemo(() => {
    return (config?.initialCamera?.position ||
      config?.cameraPosition || [5, 4, 6]) as [number, number, number]
  }, [config?.initialCamera?.position, config?.cameraPosition])

  const initialTarget = React.useMemo(() => {
    return (config?.initialCamera?.target ||
      config?.cameraTarget || [0, 1, 0]) as [number, number, number]
  }, [config?.initialCamera?.target, config?.cameraTarget])

  // Synchronize fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Camera controls
  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      controls.target.set(initialTarget[0], initialTarget[1], initialTarget[2])
      if (controls.object) {
        controls.object.position.set(
          initialCamPos[0],
          initialCamPos[1],
          initialCamPos[2]
        )
        controls.object.lookAt(
          initialTarget[0],
          initialTarget[1],
          initialTarget[2]
        )
      }
      controls.update()
    }
  }, [initialCamPos, initialTarget])

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      const cam = controls.object
      if (cam && controls.target) {
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target)
        if (offset.length() > 1.5) {
          offset.multiplyScalar(0.8)
          cam.position.copy(controls.target).add(offset)
          controls.update()
        }
      }
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      const cam = controls.object
      if (cam && controls.target) {
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target)
        if (offset.length() < 45) {
          offset.multiplyScalar(1.25)
          cam.position.copy(controls.target).add(offset)
          controls.update()
        }
      }
    }
  }, [])

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-testid="model3d-viewer"
      className={`relative bg-cream border border-[#E9E4DB] rounded-3xl overflow-hidden flex flex-col shadow-warm-lg ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-cream border-b border-[#E9E4DB] z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-ivory border border-[#E9E4DB] text-forest shadow-sm">
            <BoxIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-forest font-semibold">
                3D Spatial Architecture
              </span>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-full font-semibold">
                {isRealModel ? 'Live 3D View' : 'Architectural Preview'}
              </span>
            </div>
            <p className="text-xs text-charcoal-muted font-light mt-0.5">
              Room {roomNumber} · {spaceTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReturnToPhoto && (
            <button
              onClick={onReturnToPhoto}
              data-testid="model3d-return-photo"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ivory hover:bg-white text-forest border border-[#E9E4DB] text-xs uppercase tracking-wider rounded-full shadow-sm transition-colors font-medium"
            >
              <Camera className="w-3.5 h-3.5 text-sage" />
              <span>View Photography</span>
            </button>
          )}

          {isRealModel && (
            <button
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 bg-ivory hover:bg-white text-forest border border-[#E9E4DB] rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isRealModel && modelUrl ? (
        /* Real 3D GLB/GLTF Canvas Viewer */
        <div className="relative w-full h-[440px] sm:h-[540px] md:h-[620px] bg-neutral-950 flex flex-col justify-between overflow-hidden">
          <ModelErrorBoundary
            fallback={(error, reset) => (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="w-8 h-8 text-terracotta" />
                <h4 className="text-lg font-serif text-white">
                  Unable to Load 3D Asset
                </h4>
                <p className="text-xs text-neutral-400 max-w-md">
                  {error.message ||
                    'An error occurred while loading the 3D model asset. Please verify network access.'}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-cream text-forest font-semibold text-xs uppercase tracking-wider rounded-full shadow-warm hover:bg-ivory"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  {onReturnToPhoto && (
                    <button
                      onClick={onReturnToPhoto}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-neutral-200 text-xs uppercase tracking-wider rounded-full hover:bg-white/15"
                    >
                      <span>Return to Photography</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          >
            <Canvas
              camera={{
                position: initialCamPos,
                fov: 45,
                near: 0.1,
                far: 1000,
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <ModelScene
                url={modelUrl}
                scale={config?.scale}
                initialTarget={initialTarget}
                controlsRef={controlsRef}
              />
            </Canvas>
          </ModelErrorBoundary>

          {/* Viewer Floating Controls Toolbar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            <div className="px-3.5 py-1.5 bg-forest-dark/85 backdrop-blur-md border border-cream/20 rounded-full text-[11px] text-cream/90 font-light pointer-events-auto shadow-warm">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </div>

            <div className="flex items-center gap-1.5 bg-forest-dark/85 backdrop-blur-md border border-cream/20 p-1 rounded-full pointer-events-auto shadow-warm">
              <button
                onClick={handleZoomIn}
                aria-label="Zoom In"
                title="Zoom In"
                className="p-1.5 hover:bg-white/10 text-cream rounded-full transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                aria-label="Zoom Out"
                title="Zoom Out"
                className="p-1.5 hover:bg-white/10 text-cream rounded-full transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3.5 bg-cream/20 mx-0.5" />
              <button
                onClick={handleResetCamera}
                aria-label="Reset Camera"
                title="Reset Camera"
                className="inline-flex items-center gap-1 px-2.5 py-1 hover:bg-white/10 text-cream text-xs rounded-full transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-terracotta-light" />
                <span className="text-[10px] uppercase tracking-wider">Reset</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Clean Architectural Preview / Placeholder State (No fake models displayed) */
        <div
          data-testid="model3d-placeholder"
          className="relative p-8 sm:p-12 md:p-16 bg-cream flex flex-col items-center justify-center text-center"
        >
          {/* Subtle warm background ambient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(185,111,82,0.06),transparent_70%)] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta text-xs tracking-wider uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>Spatial Model Preview</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-forest font-normal leading-tight">
              Interactive 3D Walkthrough in Preparation
            </h3>

            <p className="text-xs uppercase font-mono tracking-wider text-terracotta font-semibold">
              Interactive 3D walkthrough coming soon
            </p>

            <p className="text-sm md:text-base text-charcoal-muted font-light leading-relaxed">
              True-to-scale 3D models for the{' '}
              <span className="text-forest font-medium">{spaceTitle}</span> are currently being
              developed. In the meantime, explore this space through high-resolution photography and our spherical 360° virtual tour.
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left pt-2 max-w-lg mx-auto">
              <div className="p-3.5 bg-ivory border border-[#E9E4DB] rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-mono text-charcoal-muted block mb-0.5">
                  Proportions
                </span>
                <span className="text-xs text-forest font-semibold">True-to-Scale 1:1</span>
              </div>

              <div className="p-3.5 bg-ivory border border-[#E9E4DB] rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-mono text-charcoal-muted block mb-0.5">
                  Floor Area
                </span>
                <span className="text-xs text-forest font-semibold">
                  {floorArea} m²
                </span>
              </div>

              <div className="p-3.5 bg-ivory border border-[#E9E4DB] rounded-2xl shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-charcoal-muted block mb-0.5">
                  Status
                </span>
                <span className="text-xs text-terracotta font-semibold">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {onExplore360 && (
                <button
                  onClick={onExplore360}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-cream hover:bg-forest-dark text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-warm"
                >
                  <Compass className="w-4 h-4 text-cream" />
                  <span>Explore 360° Tour</span>
                </button>
              )}

              {onReturnToPhoto && (
                <button
                  data-testid="model3d-return-photo"
                  onClick={onReturnToPhoto}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ivory hover:bg-white text-forest border border-[#E9E4DB] text-xs uppercase tracking-wider font-semibold transition-all duration-300 rounded-full shadow-sm"
                >
                  <Camera className="w-4 h-4 text-sage" />
                  <span>Back to Photography</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
