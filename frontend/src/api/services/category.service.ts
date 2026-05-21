import api from '../axios'
import type { Category, CreateCategoryDTO } from '../types'

class CategoryService {
    /**
     * Get all categories
     */
    async getAllCategories(): Promise<Category[]> {
        const response = await api.get<Category[]>('/categories')
        return response.data
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: number): Promise<Category> {
        const response = await api.get<Category>(`/categories/${id}`)
        return response.data
    }

    /**
     * Create new category
     */
    async createCategory(category: CreateCategoryDTO): Promise<Category> {
        const response = await api.post<Category>('/categories', category)
        return response.data
    }

    /**
     * Update category
     */
    async updateCategory(id: number, category: CreateCategoryDTO): Promise<Category> {
        const response = await api.put<Category>(`/categories/${id}`, category)
        return response.data
    }

    /**
     * Delete category
     */
    async deleteCategory(id: number): Promise<void> {
        await api.delete(`/categories/${id}`)
    }
}

export const categoryService = new CategoryService()
