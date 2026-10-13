import React, { createContext, useContext, useState, useEffect } from 'react'

export type AdminTheme = 'light' | 'dark'

interface AdminThemeContextType {
  theme: AdminTheme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: AdminTheme) => void
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    try {
      const saved = localStorage.getItem('renoos_admin_theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch (e) {
      // ignore
    }
    return 'light'
  })

  useEffect(() => {
    try {
      localStorage.setItem('renoos_admin_theme', theme)
    } catch (e) {
      // ignore
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme)
  }

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  )
}

export const useAdminTheme = (): AdminThemeContextType => {
  const context = useContext(AdminThemeContext)
  if (!context) {
    return {
      theme: 'light',
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  return context
}

export default AdminThemeContext
