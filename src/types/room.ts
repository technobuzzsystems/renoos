import type { Space } from './space'

export type AmenityCategory = 'comfort' | 'technology' | 'dining' | 'wellness' | 'service'

export interface Amenity {
  id: string
  name: string
  description?: string
  icon: string
  category: AmenityCategory
  highlight?: boolean
}

export interface RoomImages {
  hero: string
  card: string
  thumbnail: string
  gallery: {
    src: string
    alt: string
    caption?: string
  }[]
}

export interface RoomSpaces {
  bedroom: Space
  washroom: Space
  bathroom?: Space
  [key: string]: Space | undefined
}

export interface Room {
  id: string // e.g. "201"
  roomNumber: string // "201"
  name: string // "Deluxe Room"
  tagline: string
  category: 'Deluxe' | 'Premium' | 'Executive Suite'
  description: string
  longDescription: string
  area: number // sq meters
  guestCapacity: number
  bedType: string
  viewType: string
  floor: string
  pricePerNight?: number
  currency?: string
  previewImages: RoomImages
  amenities: Amenity[]
  spaces: RoomSpaces
  badges?: string[]
}
