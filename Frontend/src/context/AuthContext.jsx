import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
} from '../features/auth/api/authApi'

const STORAGE_KEY = 'treeshop-auth-user'

const AuthContext = createContext(null)

function readStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function canManageRole(role) {
  return role === 'MANAGER' || role === 'SYSTEM_ADMIN'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const persistUser = useCallback((userData) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const loggedInUser = await loginRequest(email, password)
    persistUser(loggedInUser)
    return loggedInUser
  }, [persistUser])

  const register = useCallback(async (fullName, email, password) => {
    await registerRequest(fullName, email, password)
    await login(email, password)
  }, [login])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const loginWithGoogle = useCallback((userData) => {
    persistUser(userData)
  }, [persistUser])

  const updateUser = useCallback((updatedData) => {
    if (!user) return
    const updated = {
      ...user,
      fullName: updatedData.fullName,
      phone: updatedData.phone,
    }
    persistUser(updated)
  }, [user, persistUser])

  const value = useMemo(
      () => ({
        user,
        login,
        register,
        logout,
        updateUser,
        loginWithGoogle,
        isAuthenticated: Boolean(user),
        canManage: canManageRole(user?.role),
      }),
      [user, login, register, logout, updateUser, loginWithGoogle],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}