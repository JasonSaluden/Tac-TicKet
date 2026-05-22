import { createContext, useContext, useState, useEffect } from 'react'
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
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser({
          idUser: res.data.idUser,
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          role: res.data.role,
          oauthProvider: res.data.oauthProvider,
          categoryIds: res.data.categoryIds ?? [],
        }))
        .catch(() => logout())
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({
      idUser: res.data.idUser,
      email: res.data.email,
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      role: res.data.role,
      oauthProvider: res.data.oauthProvider,
      categoryIds: [],
    })
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { firstName, lastName, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({
      idUser: res.data.idUser,
      email: res.data.email,
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      role: res.data.role,
      oauthProvider: res.data.oauthProvider,
      categoryIds: [],
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token) return
    try {
      const res = await api.get('/auth/me')
      setUser({
        idUser: res.data.idUser,
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        role: res.data.role,
        oauthProvider: res.data.oauthProvider,
        categoryIds: res.data.categoryIds ?? [],
      })
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
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
