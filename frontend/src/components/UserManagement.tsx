import { useCallback, useEffect, useState } from 'react'
import { userService } from '../api/services'
import { useCategoryStore } from '../stores/category.store'
import { useAuth } from '../context/AuthContext'
import { Modal } from './ui/Modal'

type Role = 'ADMIN' | 'AGENT' | 'USER'

interface AdminUser {
    idUser: number
    firstName: string
    lastName: string
    email: string
    role: Role
    createdAt: string
    categoryIds?: number[]
}

const ROLES: Role[] = ['ADMIN', 'AGENT', 'USER']

const roleBadge: Record<Role, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    AGENT: 'bg-blue-100 text-blue-800',
    USER: 'bg-gray-100 text-gray-800',
}

export function UserManagement() {
    const { user: currentUser } = useAuth()
    const categoryStore = useCategoryStore()

    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<Role | ''>('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingRole, setEditingRole] = useState<Role>('USER')
    const [savingId, setSavingId] = useState<number | null>(null)

    // Category editing state
    const [categoryEditingUser, setCategoryEditingUser] = useState<AdminUser | null>(null)
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
    const [savingCategories, setSavingCategories] = useState(false)
    const [categoryError, setCategoryError] = useState('')

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = (await userService.getAllUsers()) as unknown as AdminUser[]
            setUsers(data)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
        categoryStore.getAllCategories()
    }, [fetchUsers])

    const startEdit = (u: AdminUser) => {
        setEditingId(u.idUser)
        setEditingRole(u.role)
    }

    const cancelEdit = () => setEditingId(null)

    const saveRole = async (u: AdminUser) => {
        try {
            setSavingId(u.idUser)
            setError(null)
            await userService.updateUser(u.idUser, {
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: editingRole,
            } as any)
            setUsers(prev => prev.map(x => (x.idUser === u.idUser ? { ...x, role: editingRole } : x)))
            setEditingId(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour')
        } finally {
            setSavingId(null)
        }
    }

    const deleteUser = async (u: AdminUser) => {
        if (!globalThis.confirm(`Supprimer l'utilisateur ${u.firstName} ${u.lastName} ?`)) return
        try {
            setSavingId(u.idUser)
            setError(null)
            await userService.deleteUser(u.idUser)
            setUsers(prev => prev.filter(x => x.idUser !== u.idUser))
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
        } finally {
            setSavingId(null)
        }
    }

    const openCategoryEdit = (u: AdminUser) => {
        setCategoryEditingUser(u)
        setSelectedCategoryIds(u.categoryIds ?? [])
        setCategoryError('')
    }

    const toggleCategory = (id: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const saveCategories = async () => {
        if (!categoryEditingUser) return
        setSavingCategories(true)
        setCategoryError('')
        try {
            await userService.updateCategories(categoryEditingUser.idUser, selectedCategoryIds)
            setUsers(prev => prev.map(u =>
                u.idUser === categoryEditingUser.idUser
                    ? { ...u, categoryIds: selectedCategoryIds }
                    : u
            ))
            setCategoryEditingUser(null)
        } catch (e) {
            setCategoryError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour')
        } finally {
            setSavingCategories(false)
        }
    }

    const filtered = users.filter(u => {
        if (roleFilter && u.role !== roleFilter) return false
        const term = search.trim().toLowerCase()
        if (!term) return true
        return (
            u.email.toLowerCase().includes(term) ||
            u.firstName.toLowerCase().includes(term) ||
            u.lastName.toLowerCase().includes(term)
        )
    })

    const counts = {
        total: users.length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        agent: users.filter(u => u.role === 'AGENT').length,
        user: users.filter(u => u.role === 'USER').length,
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total" value={counts.total} />
                <StatCard label="Admins" value={counts.admin} accent="text-purple-700" />
                <StatCard label="Agents" value={counts.agent} accent="text-blue-700" />
                <StatCard label="Utilisateurs" value={counts.user} accent="text-gray-700" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher (nom, email)…"
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as Role | '')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tous les rôles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Nom</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Rôle</th>
                            <th className="px-4 py-3 text-left font-semibold">Catégories</th>
                            <th className="px-4 py-3 text-left font-semibold">Créé le</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Chargement…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Aucun utilisateur</td></tr>
                        ) : (
                            filtered.map(u => {
                                const isEditing = editingId === u.idUser
                                const isSaving = savingId === u.idUser
                                const isSelf = currentUser?.idUser === u.idUser
                                const catNames = (u.categoryIds ?? [])
                                    .map(id => categoryStore.state.categories.find(c => c.idCategory === id)?.name)
                                    .filter(Boolean)
                                return (
                                    <tr key={u.idUser} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {u.firstName} {u.lastName}
                                            {isSelf && <span className="ml-2 text-xs text-gray-400">(vous)</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <select
                                                    value={editingRole}
                                                    onChange={e => setEditingRole(e.target.value as Role)}
                                                    disabled={isSaving}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge[u.role]}`}>
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {u.role === 'AGENT' ? (
                                                catNames.length > 0
                                                    ? <span className="text-xs">{catNames.join(', ')}</span>
                                                    : <span className="text-xs text-orange-500 italic">Aucune</span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isEditing ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => saveRole(u)}
                                                        disabled={isSaving || editingRole === u.role}
                                                        className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        disabled={isSaving}
                                                        className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => startEdit(u)}
                                                        disabled={isSaving}
                                                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        Rôle
                                                    </button>
                                                    {u.role === 'AGENT' && (
                                                        <button
                                                            onClick={() => openCategoryEdit(u)}
                                                            disabled={isSaving}
                                                            className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded"
                                                        >
                                                            Catégories
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteUser(u)}
                                                        disabled={isSaving || isSelf}
                                                        title={isSelf ? 'Impossible de supprimer son propre compte' : 'Supprimer'}
                                                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category edit modal */}
            <Modal
                isOpen={categoryEditingUser !== null}
                onClose={() => setCategoryEditingUser(null)}
                title={`Catégories — ${categoryEditingUser?.firstName} ${categoryEditingUser?.lastName}`}
                description="Sélectionnez les catégories dont cet agent est responsable."
                size="sm"
            >
                {categoryError && (
                    <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {categoryError}
                    </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {categoryStore.state.categories.map(cat => (
                        <label
                            key={cat.idCategory}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(cat.idCategory)}
                                onChange={() => toggleCategory(cat.idCategory)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-800">{cat.name}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setCategoryEditingUser(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={saveCategories}
                        disabled={savingCategories}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                    >
                        {savingCategories ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

function StatCard({ label, value, accent = 'text-gray-900' }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent}`}>{value}</p>
        </div>
    )
}
