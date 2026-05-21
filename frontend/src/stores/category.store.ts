import { useState, useCallback } from 'react'
import { categoryService } from '../api/services'
import type { Category, CreateCategoryDTO } from '../api/types'

interface CategoryStoreState {
    categories: Category[]
    loading: boolean
    error: string | null
    selectedCategory: Category | null
}

interface CategoryStore {
    state: CategoryStoreState
    getAllCategories: () => Promise<void>
    getCategoryById: (id: number) => Promise<void>
    createCategory: (category: CreateCategoryDTO) => Promise<Category>
    updateCategory: (id: number, category: CreateCategoryDTO) => Promise<Category>
    deleteCategory: (id: number) => Promise<void>
    clearError: () => void
    setSelectedCategory: (category: Category | null) => void
}

export function useCategoryStore(): CategoryStore {
    const [state, setState] = useState<CategoryStoreState>({
        categories: [],
        loading: false,
        error: null,
        selectedCategory: null,
    })

    const updateState = useCallback(
        (updates: Partial<CategoryStoreState> | ((prev: CategoryStoreState) => Partial<CategoryStoreState>)) => {
            setState((prev) => ({
                ...prev,
                ...(typeof updates === 'function' ? updates(prev) : updates),
            }))
        },
        []
    )

    const handleError = useCallback(
        (err: unknown) => {
            const message = err instanceof Error ? err.message : 'An error occurred'
            updateState({ error: message })
            return message
        },
        [updateState]
    )

    const getAllCategories = useCallback(async () => {
        try {
            updateState({ loading: true, error: null })
            const data = await categoryService.getAllCategories()
            updateState({ categories: data, loading: false })
        } catch (err) {
            handleError(err)
            updateState({ loading: false })
        }
    }, [updateState, handleError])

    const getCategoryById = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                const category = await categoryService.getCategoryById(id)
                updateState({ selectedCategory: category, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const createCategory = useCallback(
        async (category: CreateCategoryDTO): Promise<Category> => {
            try {
                updateState({ loading: true, error: null })
                const newCategory = await categoryService.createCategory(category)
                updateState((prev) => ({
                    categories: [...prev.categories, newCategory],
                    loading: false,
                }))
                return newCategory
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    const updateCategory = useCallback(
        async (id: number, category: CreateCategoryDTO): Promise<Category> => {
            try {
                updateState({ loading: true, error: null })
                const updated = await categoryService.updateCategory(id, category)
                updateState((prev) => ({
                    categories: prev.categories.map((c) => (c.idCategory === id ? updated : c)),
                    loading: false,
                }))
                return updated
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    const deleteCategory = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                await categoryService.deleteCategory(id)
                updateState((prev) => ({
                    categories: prev.categories.filter((c) => c.idCategory !== id),
                    loading: false,
                }))
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    return {
        state,
        getAllCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        clearError: () => updateState({ error: null }),
        setSelectedCategory: (category) => updateState({ selectedCategory: category }),
    }
}
