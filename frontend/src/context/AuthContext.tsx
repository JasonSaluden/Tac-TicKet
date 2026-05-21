import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'

interface AuthUser {
  userId: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'AGENT' | 'USER'
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
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
          userId: res.data.idUser,
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          role: res.data.role,
        }))
        .catch(() => logout())
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({
      userId: res.data.userId,
      email: res.data.email,
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      role: res.data.role,
    })
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { firstName, lastName, email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser({
      userId: res.data.userId,
      email: res.data.email,
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      role: res.data.role,
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
