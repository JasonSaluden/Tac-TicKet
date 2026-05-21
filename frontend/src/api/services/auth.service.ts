import api from '../axios'
import type { LoginResponse, AuthUser } from '../types'

class AuthService {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', { email, password })
        return response.data
    }

    /**
     * Register new user
     */
    async register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/register', {
            firstName,
            lastName,
            email,
            password,
        })
        return response.data
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<AuthUser> {
        const response = await api.get<AuthUser>('/auth/me')
        return response.data
    }

    /**
     * Logout (client-side only, token removal handled in interceptor)
     */
    logout(): void {
        localStorage.removeItem('token')
    }
}

export const authService = new AuthService()
