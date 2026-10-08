export interface UserProfile {
  id: string
  fullName: string
  phone: string
  formattedPhone?: string
  email?: string
  createdAt?: string
}

export interface AuthResponse {
  success: boolean
  user?: UserProfile
  error?: string
  message?: string
}

export interface UserBookingsResponse {
  success: boolean
  count: number
  bookings: any[]
  error?: string
}

