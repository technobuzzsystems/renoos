import type { Hotspot } from './hotspot'

export interface PanoramaConfig {
  /** Path to 2:1 equirectangular image asset */
  imageSrc: string
  /** Low-resolution blur preview or thumbnail */
  thumbnailSrc?: string
  /** Field of View in degrees (standard 75) */
  initialFov?: number
  minFov?: number
  maxFov?: number
  /** Initial viewing camera angles in degrees */
  initialPitch?: number
  initialYaw?: number
  /** Standard equirectangular ratio */
  aspectRatio?: '2:1'
  /** Interactive points of interest */
  hotspots: Hotspot[]
  /** Whether this is a placeholder asset pending Phase 2 capture */
  isPlaceholder?: boolean
  /** Whether a real 360 panorama file is available */
  isAvailable?: boolean
  /** Descriptive caption for accessibility and UI */
  caption?: string
}
