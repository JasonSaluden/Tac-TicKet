import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login')
      return
    }

    localStorage.setItem('token', token)
    api.get('/auth/me')
      .then(() => {
        window.location.href = '/dashboard'
      })
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login')
      })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  )
}
