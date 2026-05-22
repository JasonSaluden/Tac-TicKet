import { useState, useEffect, useCallback } from 'react'
import { Plus, Check, X, Pencil, Trash2 } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useCategoryStore } from '../stores/category.store'
import type { Category } from '../api/types'

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CategoryModal({ isOpen, onClose }: Readonly<CategoryModalProps>) {
    const categoryStore = useCategoryStore()
    const [newCategoryName, setNewCategoryName] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load categories when modal opens
    useEffect(() => {
        if (isOpen) {
            categoryStore.getAllCategories()
        }
    }, [isOpen])

    const handleCreateCategory = useCallback(async () => {
        if (!newCategoryName.trim()) return

        try {
            setIsSubmitting(true)
            await categoryStore.createCategory({ name: newCategoryName })
            setNewCategoryName('')
        } finally {
            setIsSubmitting(false)
        }
    }, [newCategoryName, categoryStore])

    const handleStartEdit = useCallback((category: Category) => {
        setEditingId(category.idCategory)
        setEditingName(category.name)
    }, [])

    const handleSaveEdit = useCallback(async () => {
        if (!editingName.trim() || editingId === null) return

        try {
            setIsSubmitting(true)
            await categoryStore.updateCategory(editingId, { name: editingName } as any)
            setEditingId(null)
            setEditingName('')
        } finally {
            setIsSubmitting(false)
        }
    }, [editingId, editingName, categoryStore])

    const handleCancelEdit = useCallback(() => {
        setEditingId(null)
        setEditingName('')
    }, [])

    const handleDeleteCategory = useCallback(
        async (id: number) => {
            if (globalThis.confirm('Are you sure you want to delete this category?')) {
                try {
                    setIsSubmitting(true)
                    await categoryStore.deleteCategory(id)
                } finally {
                    setIsSubmitting(false)
                }
            }
        },
        [categoryStore]
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Categories"
            description="Create, edit, or delete ticket categories"
            size="full"
        >
            <div className="space-y-6">
                {/* Create New Category */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Add New Category</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreateCategory()
                                }
                            }}
                            disabled={isSubmitting}
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <Button
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName.trim() || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>
                    {categoryStore.state.error && (
                        <p className="text-red-600 text-xs mt-2">{categoryStore.state.error}</p>
                    )}
                </div>

                {/* Categories List */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Existing Categories</h3>
                    {categoryStore.state.loading && !categoryStore.state.categories.length ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading categories...</p>
                        </div>
                    ) : categoryStore.state.categories.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No categories yet. Create one above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryStore.state.categories.map((category) => (
                                <div
                                    key={category.idCategory}
                                    className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    {editingId === category.idCategory ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                disabled={isSubmitting}
                                                className="w-full px-3 py-2 border border-blue-300 rounded bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={!editingName.trim() || isSubmitting}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 text-sm text-green-600 hover:bg-green-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                    title="Save"
                                                >
                                                    <Check className="w-4 h-4" /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={isSubmitting}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 text-sm text-gray-500 hover:bg-gray-200 rounded transition disabled:cursor-not-allowed font-medium"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(category)}
                                                className="text-base font-semibold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition p-2 -m-2 rounded w-full text-left bg-transparent border-0"
                                                title="Click to edit"
                                            >
                                                {category.name}
                                            </button>
                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleStartEdit(category)}
                                                    disabled={isSubmitting}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.idCategory)}
                                                    disabled={isSubmitting}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 p-2 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
