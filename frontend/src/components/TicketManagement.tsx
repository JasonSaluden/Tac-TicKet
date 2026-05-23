import { useState, useEffect, useCallback } from 'react'
import { Check, X, Pencil, Trash2 } from 'lucide-react'
import { useTicketStore } from '../stores/ticket.store'
import { useCategoryStore } from '../stores/category.store'
import { userService } from '../api/services'
import type { Ticket, AuthUser, UpdateTicketDTO } from '../api/types'

export function TicketManagement() {
    const ticketStore = useTicketStore()
    const categoryStore = useCategoryStore()
    const [users, setUsers] = useState<AuthUser[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingData, setEditingData] = useState<UpdateTicketDTO>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [usersLoading, setUsersLoading] = useState(false)

    const loadUsers = useCallback(async () => {
        try {
            setUsersLoading(true)
            const data = await userService.getAllUsers()
            setUsers(data)
        } catch (err) {
            console.error('Failed to load users:', err)
        } finally {
            setUsersLoading(false)
        }
    }, [])

    // Load all data on mount
    useEffect(() => {
        ticketStore.getAllTickets()
        categoryStore.getAllCategories()
        loadUsers()
    }, [loadUsers])

    const getAgentName = (userId?: number) => {
        if (!userId) return 'Non assigné'
        const user = users.find(u => u.idUser === userId)
        return user ? `${user.firstName} ${user.lastName}` : 'Inconnu'
    }

    const getCategoryName = (categoryId: number) => {
        const category = categoryStore.state.categories.find(c => c.idCategory === categoryId)
        return category?.name || 'Inconnue'
    }

    const handleStartEdit = useCallback((ticket: Ticket) => {
        setEditingId(ticket.idTicket)
        setEditingData({
            status: ticket.status,
            priority: ticket.priority,
            userAgentId: ticket.userAgentId,
            idCategory: ticket.idCategory,
        })
    }, [])

    const handleEditChange = useCallback((field: keyof UpdateTicketDTO, value: any) => {
        let finalValue: any = value

        // Convert empty strings to undefined for consistency
        if (value === '') {
            finalValue = undefined
        } else if (field === 'userAgentId' && value) {
            // Keep numeric values as-is
            finalValue = parseInt(value)
        } else if (field === 'idCategory' && value) {
            finalValue = parseInt(value)
        }

        setEditingData(prev => ({
            ...prev,
            [field]: finalValue,
        }))
    }, [])

    const handleSaveEdit = useCallback(async () => {
        if (editingId === null) return

        try {
            setIsSubmitting(true)
            await ticketStore.updateTicket(editingId, editingData)
            setEditingId(null)
            setEditingData({})
        } finally {
            setIsSubmitting(false)
        }
    }, [editingId, editingData, ticketStore])

    const handleCancelEdit = useCallback(() => {
        setEditingId(null)
        setEditingData({})
    }, [])

    const handleDeleteTicket = useCallback(
        async (id: number) => {
            if (globalThis.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
                try {
                    setIsSubmitting(true)
                    await ticketStore.deleteTicket(id)
                } finally {
                    setIsSubmitting(false)
                }
            }
        },
        [ticketStore]
    )

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-800'
            case 'IN_PROGRESS':
                return 'bg-purple-100 text-purple-800'
            case 'RESOLVED':
                return 'bg-green-100 text-green-800'
            case 'CLOSED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority) {
            case 'LOW':
                return 'bg-green-100 text-green-800'
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800'
            case 'HIGH':
                return 'bg-orange-100 text-orange-800'
            case 'URGENT':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const agents = users.filter(u => u.role === 'AGENT' || u.role === 'ADMIN')

    return (
        <div className="space-y-6">
            {/* Loading state */}
            {(ticketStore.state.loading || usersLoading) && !ticketStore.state.tickets.length ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Chargement des tickets...</p>
                </div>
            ) : ticketStore.state.tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Aucun ticket pour le moment.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Titre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priorité</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Agent</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Catégorie</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Créateur</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Créé le</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ticketStore.state.tickets.map((ticket) => (
                                <tr
                                    key={ticket.idTicket}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                                >
                                    {editingId === ticket.idTicket ? (
                                        <>
                                            {/* Editing Row */}
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{ticket.idTicket}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{ticket.title}</td>

                                            {/* Status Dropdown */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={editingData.status || ticket.status}
                                                    onChange={(e) => handleEditChange('status', e.target.value)}
                                                    disabled={isSubmitting}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="OPEN">Ouvert</option>
                                                    <option value="IN_PROGRESS">En cours</option>
                                                    <option value="RESOLVED">Résolu</option>
                                                    <option value="CLOSED">Fermé</option>
                                                </select>
                                            </td>

                                            {/* Priority Dropdown */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={editingData.priority || ticket.priority}
                                                    onChange={(e) => handleEditChange('priority', e.target.value)}
                                                    disabled={isSubmitting}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="LOW">Basse</option>
                                                    <option value="MEDIUM">Moyenne</option>
                                                    <option value="HIGH">Haute</option>
                                                    <option value="URGENT">Urgente</option>
                                                </select>
                                            </td>

                                            {/* Agent Dropdown */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={editingData.userAgentId ? String(editingData.userAgentId) : ''}
                                                    onChange={(e) => {
                                                        console.log('Agent change:', e.target.value, 'isSubmitting:', isSubmitting, 'agents:', agents)
                                                        handleEditChange('userAgentId', e.target.value)
                                                    }}
                                                    disabled={isSubmitting}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="">Non assigné</option>
                                                    {agents.length > 0 ? (
                                                        agents.map(agent => (
                                                            <option key={agent.idUser} value={String(agent.idUser)}>
                                                                {agent.firstName} {agent.lastName}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option disabled>Aucun agent disponible</option>
                                                    )}
                                                </select>
                                            </td>

                                            {/* Category Dropdown */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={editingData.idCategory || ticket.idCategory}
                                                    onChange={(e) => handleEditChange('idCategory', parseInt(e.target.value))}
                                                    disabled={isSubmitting}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    {categoryStore.state.categories.map(cat => (
                                                        <option key={cat.idCategory} value={cat.idCategory}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-600">{ticket.userCreatorName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                                            </td>

                                            {/* Save/Cancel Buttons */}
                                            <td className="px-4 py-3 flex gap-1">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Sauver
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded transition disabled:cursor-not-allowed font-medium"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Annuler
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            {/* Normal Row */}
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{ticket.idTicket}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                                                {ticket.title}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                                                    {ticket.status === 'OPEN' ? 'Ouvert' :
                                                        ticket.status === 'IN_PROGRESS' ? 'En cours' :
                                                            ticket.status === 'RESOLVED' ? 'Résolu' : 'Fermé'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                                                    {ticket.priority === 'LOW' ? 'Basse' :
                                                        ticket.priority === 'MEDIUM' ? 'Moyenne' :
                                                            ticket.priority === 'HIGH' ? 'Haute' : 'Urgente'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{getAgentName(ticket.userAgentId)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(ticket.idCategory)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{ticket.userCreatorName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                                            </td>

                                            {/* Edit/Delete Buttons */}
                                            <td className="px-4 py-3 flex gap-1">
                                                <button
                                                    onClick={() => handleStartEdit(ticket)}
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> Éditer
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTicket(ticket.idTicket)}
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Error Display */}
            {ticketStore.state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{ticketStore.state.error}</p>
                </div>
            )}
        </div>
    )
}
