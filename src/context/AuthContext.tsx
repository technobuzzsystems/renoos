import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { UserProfile, ConfirmedReservation } from '@/types'
import {
  loginUserApi,
  registerUserApi,
  fetchUserBookingsApi,
  cancelBookingApi,
} from '@/services/api'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  isBookingsModalOpen: boolean
  setIsBookingsModalOpen: (open: boolean) => void
  login: (phone: string, password: string) => Promise<UserProfile>
  register: (fullName: string, phone: string, password: string, email?: string) => Promise<UserProfile>
  logout: () => void
  userBookings: (ConfirmedReservation & { status?: string })[]
  isLoadingBookings: boolean
  refreshUserBookings: () => Promise<void>
  cancelBooking: (bookingId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'renoos_hotel_active_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as UserProfile
      }
    } catch {
      // ignore
    }
    return null
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false)
  const [userBookings, setUserBookings] = useState<(ConfirmedReservation & { status?: string })[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  // Fetch bookings for the logged-in user
  const refreshUserBookings = useCallback(async () => {
    if (!user) {
      setUserBookings([])
      return
    }

    setIsLoadingBookings(true)
    try {
      const list = await fetchUserBookingsApi(user.phone || user.id)
      setUserBookings(list)
    } catch (err) {
      console.warn('Failed to load user bookings:', err)
    } finally {
      setIsLoadingBookings(false)
    }
  }, [user])

  // Sync bookings on user login or change
  useEffect(() => {
    if (user) {
      refreshUserBookings()
    } else {
      setUserBookings([])
    }
  }, [user, refreshUserBookings])

  const login = async (phone: string, password: string): Promise<UserProfile> => {
    const loggedUser = await loginUserApi(phone, password)
    setUser(loggedUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser))
    } catch {
      // ignore
    }
    return loggedUser
  }

  const register = async (
    fullName: string,
    phone: string,
    password: string,
    email?: string
  ): Promise<UserProfile> => {
    const newUser = await registerUserApi(fullName, phone, password, email)
    setUser(newUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    } catch {
      // ignore
    }
    return newUser
  }

  const logout = () => {
    setUser(null)
    setUserBookings([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const success = await cancelBookingApi(bookingId)
    if (success) {
      await refreshUserBookings()
    }
    return success
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isBookingsModalOpen,
        setIsBookingsModalOpen,
        login,
        register,
        logout,
        userBookings,
        isLoadingBookings,
        refreshUserBookings,
        cancelBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

