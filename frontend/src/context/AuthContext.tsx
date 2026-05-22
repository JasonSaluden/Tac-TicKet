import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'

interface AuthUser {
  idUser: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'AGENT' | 'USER'
  oauthProvider?: string | null
  categoryIds: number[]
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  userLoaded: boolean
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapUser(data: Record<string, unknown>): AuthUser {
  return {
    idUser: data.idUser as number,
    email: data.email as string,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
    role: data.role as AuthUser['role'],
    oauthProvider: (data.oauthProvider as string | null) ?? null,
    categoryIds: (data.categoryIds as number[]) ?? [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.get('/auth/me')
      setUser(mapUser(res.data))
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      refreshUser().catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
    }
  }, [token, refreshUser])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(mapUser(res.data))
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { firstName, lastName, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(mapUser(res.data))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, userLoaded: !!user, login, register, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
