import { createContext, useContext, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../features/auth/authApi'

const STORAGE_KEY = 'treeshop-auth-user'

const AuthContext = createContext(null)

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue ? JSON.parse(storedValue) : null
  } catch {
    return null
  }
}

function canManageRole(role) {
  return role === 'MANAGER' || role === 'SYSTEM_ADMIN'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  function updateUser(updatedData) {
    if (!user) return;
    const newUserState = {
      ...user,
      fullName: updatedData.fullName,
      phone: updatedData.phone
    };
    if (user.user) {
      newUserState.user = {
        ...user.user,
        fullName: updatedData.fullName,
        phone: updatedData.phone
      };
    }
    setUser(newUserState);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUserState));
    }
  }

  async function login(email, password) {
    const loggedInUser = await loginRequest(email, password)
    setUser(loggedInUser)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
    }

    return loggedInUser
  }

  async function register(fullName, email, password) {
    await registerRequest(fullName, email, password)
  }

  function logout() {
    setUser(null)

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const value = useMemo(
      () => ({
        user,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: Boolean(user),
        canManage: canManageRole(user?.role),
      }),
      [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}