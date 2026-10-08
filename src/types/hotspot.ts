export type HotspotType = 'navigation' | 'info' | 'feature' | 'dimension' | 'audio'

export interface HotspotPosition {
  x: number
  y: number
  z: number
}

export interface HotspotSpherical {
  yaw: number   // horizontal angle in degrees (-180 to 180)
  pitch: number // vertical angle in degrees (-90 to 90)
}

export interface Hotspot {
  id: string
  title: string
  description?: string
  type: HotspotType
  /** Spherical coordinates or 3D vector coordinates */
  position?: HotspotPosition
  spherical?: HotspotSpherical
  /** If type is 'navigation', target space id */
  targetSpaceId?: string
  /** Highlight category (e.g., 'Material', 'Fixture', 'Architecture') */
  category?: string
  /** Extended detail or specification sheet */
  details?: string
  /** Optional icon identifier */
  icon?: string
}
