import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'

interface AuthUser {
  idUser: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'AGENT' | 'USER'
  categoryIds: number[]
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
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
    categoryIds: (data.categoryIds as number[]) ?? [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me')
    setUser(mapUser(res.data))
  }, [])

  useEffect(() => {
    if (token) {
      refreshUser().catch(() => logout())
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({ ...mapUser(res.data), categoryIds: [] })
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { firstName, lastName, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({ ...mapUser(res.data), categoryIds: [] })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
