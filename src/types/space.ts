import type { PanoramaConfig } from './panorama'
import type { Model3DConfig } from './model3d'

export type SpaceType = 'bedroom' | 'bathroom' | 'washroom' | 'kitchen' | 'living' | 'balcony' | 'dining' | 'garden'

export interface SpaceImages {
  main: string
  gallery: string[]
  alt: string
}

export interface Space {
  id: string
  type: SpaceType
  title: string
  subtitle?: string
  description: string
  area?: number // in sq meters
  features: string[]
  images: SpaceImages
  panorama: PanoramaConfig
  model3d?: Model3DConfig
}
