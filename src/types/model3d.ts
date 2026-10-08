export interface Model3DConfig {
  /** Path to .glb or .gltf 3D asset */
  modelSrc?: string
  /** Alias for modelSrc */
  src?: string
  /** 2D preview / render fallback */
  thumbnailSrc?: string
  /** Transform scaling vector */
  scale?: [number, number, number] | number
  /** Default camera vantage position [x, y, z] */
  cameraPosition?: [number, number, number]
  /** Camera orbit target [x, y, z] */
  cameraTarget?: [number, number, number]
  /** Initial camera vantage and target configuration */
  initialCamera?: {
    position: [number, number, number]
    target: [number, number, number]
  }
  /** Auto-rotation behavior */
  autoRotate?: boolean
  autoRotateSpeed?: number
  /** Orbit controls flags */
  enablePan?: boolean
  enableZoom?: boolean
  /** HDRI lighting environment preset */
  environmentPreset?: 'city' | 'apartment' | 'dawn' | 'lobby' | 'studio'
  /** Flag for placeholder status */
  isPlaceholder?: boolean
  /** Dimensions in meters for architectural review */
  dimensions?: {
    widthMeters: number
    lengthMeters: number
    heightMeters: number
  }
}
