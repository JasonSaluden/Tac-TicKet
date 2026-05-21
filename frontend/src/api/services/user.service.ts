import api from '../axios'
import type { AuthUser } from '../types'

class UserService {
    /**
     * Get all users
     */
    async getAllUsers(): Promise<AuthUser[]> {
        const response = await api.get<AuthUser[]>('/users')
        return response.data
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<AuthUser> {
        const response = await api.get<AuthUser>(`/users/${id}`)
        return response.data
    }

    /**
     * Get users by role
     */
    async getUsersByRole(role: 'ADMIN' | 'AGENT' | 'USER'): Promise<AuthUser[]> {
        const response = await api.get<AuthUser[]>(`/users/role/${role}`)
        return response.data
    }

    /**
     * Update user profile
     */
    async updateUser(
        id: number,
        updates: Partial<Omit<AuthUser, 'userId'>>
    ): Promise<AuthUser> {
        const response = await api.put<AuthUser>(`/users/${id}`, updates)
        return response.data
    }

    /**
     * Update agent categories
     */
    async updateCategories(id: number, categoryIds: number[]): Promise<number[]> {
        const response = await api.patch<number[]>(`/users/${id}/categories`, { categoryIds })
        return response.data
    }

    /**
     * Delete user
     */
    async deleteUser(id: number): Promise<void> {
        await api.delete(`/users/${id}`)
    }
}

export const userService = new UserService()
