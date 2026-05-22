import { useEffect, useState } from 'react'
import { useCategoryStore } from '../stores/category.store'
import { userService } from '../api/services'
import { useAuth } from '../context/AuthContext'

export function AgentCategoryModal() {
  const { user, userLoaded, refreshUser } = useAuth()
  const categoryStore = useCategoryStore()

  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Only show once the real profile is loaded from /auth/me, not during the brief initial [] state
  const isOpen = userLoaded && user?.role === 'AGENT' && user.categoryIds.length === 0

  useEffect(() => {
    if (isOpen) {
      categoryStore.getAllCategories()
    }
  }, [isOpen, categoryStore])

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await userService.updateCategories(user!.idUser, selected)
      await refreshUser()
    } catch {
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bienvenue !</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez la ou les catégories dont vous êtes responsable. Vous verrez tous les tickets associés à ces catégories.
          </p>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {categoryStore.state.loading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Chargement…</p>
          ) : categoryStore.state.categories.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Aucune catégorie disponible.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categoryStore.state.categories.map(cat => (
                <label
                  key={cat.idCategory}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(cat.idCategory)}
                    onChange={() => toggle(cat.idCategory)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || selected.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement…' : `Confirmer (${selected.length} sélectionnée${selected.length > 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  )
}
