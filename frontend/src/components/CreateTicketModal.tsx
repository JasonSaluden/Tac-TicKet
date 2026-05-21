import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { useTicketStore } from '../stores/ticket.store'
import { useCategoryStore } from '../stores/category.store'
import { useAuth } from '../context/AuthContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const PRIORITIES = [
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' },
]

export function CreateTicketModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const ticketStore = useTicketStore()
  const categoryStore = useCategoryStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [idCategory, setIdCategory] = useState<number | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      categoryStore.getAllCategories()
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setIdCategory('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    if (idCategory === '') { setError('Veuillez sélectionner une catégorie.'); return }
    if (!user?.idUser) { setError('Utilisateur non identifié.'); return }

    setLoading(true)
    setError('')
    try {
      await ticketStore.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'OPEN',
        idCategory: idCategory as number,
        userCreatorId: user.idUser,
      })
      onSuccess?.()
      onClose()
    } catch {
      setError('Erreur lors de la création du ticket. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau ticket" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Décrivez brièvement le problème"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={150}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Détails supplémentaires (optionnel)"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={idCategory}
              onChange={e => setIdCategory(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {categoryStore.state.categories.map(c => (
                <option key={c.idCategory} value={c.idCategory}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Création…' : 'Créer le ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
