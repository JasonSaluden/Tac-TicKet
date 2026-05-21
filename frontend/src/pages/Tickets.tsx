import { useEffect, useMemo, useState } from 'react'
import { useTicketStore } from '../stores/ticket.store'
import { useCategoryStore } from '../stores/category.store'
import { useAuth } from '../context/AuthContext'
import { CreateTicketModal } from '../components/CreateTicketModal'
import { TicketDetailModal } from '../components/TicketDetailModal'
import type { Ticket } from '../api/types'

type SortKey = 'idTicket' | 'title' | 'status' | 'priority' | 'createdAt' | 'idCategory'
type SortDir = 'asc' | 'desc'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
}

const priorityBadge: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
}

const statusBadge: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

export default function Tickets() {
  const ticketStore = useTicketStore()
  const categoryStore = useCategoryStore()
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    ticketStore.getAllTickets()
    categoryStore.getAllCategories()
  }, [])

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>()
    categoryStore.state.categories.forEach(c => map.set(c.idCategory, c.name))
    return map
  }, [categoryStore.state.categories])

  // Visibility rules:
  // ADMIN  → all tickets
  // AGENT  → unclaimed OPEN tickets (any category)
  //        + all tickets in their specialty categories (any status/agent)
  //        + tickets they claimed
  // USER   → unclaimed OPEN tickets (status=OPEN, no agent)
  //        + tickets they claimed
  //        + tickets they created
  const visibleByRole = useMemo(() => {
    if (!user) return []
    if (user.role === 'ADMIN') return ticketStore.state.tickets

    return ticketStore.state.tickets.filter(t => {
      const isUnclaimed = t.status === 'OPEN' && t.userAgentId == null
      const isClaimed = t.userAgentId === user.userId
      const isCreated = t.userCreatorId === user.userId

      if (user.role === 'AGENT') {
        const isInMyCategory = user.categoryIds.includes(t.idCategory)
        return isUnclaimed || isClaimed || isInMyCategory
      }

      // USER
      return isUnclaimed || isClaimed || isCreated
    })
  }, [ticketStore.state.tickets, user])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return visibleByRole.filter(t => {
      if (statusFilter && t.status !== statusFilter) return false
      if (priorityFilter && t.priority !== priorityFilter) return false
      if (term && !t.title.toLowerCase().includes(term) && !(t.description ?? '').toLowerCase().includes(term)) return false
      return true
    })
  }, [visibleByRole, search, statusFilter, priorityFilter])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="text-gray-300">↕</span>
    return <span className="text-gray-700">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
  }

  const handleClaim = async (ticket: Ticket) => {
    if (!user) return
    await ticketStore.updateTicket(ticket.idTicket, {
      status: 'IN_PROGRESS',
      userAgentId: user.userId,
    })
  }

  const handleStatusChange = async (ticket: Ticket, newStatus: string) => {
    await ticketStore.updateTicket(ticket.idTicket, { status: newStatus })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
          <p className="text-sm text-gray-600">
            {sorted.length} ticket{sorted.length > 1 ? 's' : ''} affiché{sorted.length > 1 ? 's' : ''}
            {user?.role === 'USER' && ' · mes tickets et catégories'}
            {user?.role === 'AGENT' && ' · tickets assignés ou non attribués'}
            {user?.role === 'ADMIN' && ' · tous les tickets'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          + Nouveau ticket
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (titre, description)…"
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les priorités</option>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(search || statusFilter || priorityFilter) && (
            <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              Réinitialiser
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th onClick={() => toggleSort('idTicket')} icon={sortIcon('idTicket')}>#</Th>
                <Th onClick={() => toggleSort('title')} icon={sortIcon('title')}>Titre</Th>
                <Th onClick={() => toggleSort('status')} icon={sortIcon('status')}>Statut</Th>
                <Th onClick={() => toggleSort('priority')} icon={sortIcon('priority')}>Priorité</Th>
                <Th onClick={() => toggleSort('idCategory')} icon={sortIcon('idCategory')}>Catégorie</Th>
                <Th onClick={() => toggleSort('createdAt')} icon={sortIcon('createdAt')}>Créé le</Th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticketStore.state.loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Chargement…</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Aucun ticket à afficher</td></tr>
              ) : (
                sorted.map(t => (
                  <Row
                    key={t.idTicket}
                    ticket={t}
                    categoryName={categoryMap.get(t.idCategory)}
                    user={user}
                    onClaim={handleClaim}
                    onStatusChange={handleStatusChange}
                    onView={setSelectedTicket}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => ticketStore.getAllTickets()}
      />
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={selectedTicket !== null}
        onClose={() => setSelectedTicket(null)}
        categoryName={selectedTicket ? categoryMap.get(selectedTicket.idCategory) : undefined}
      />
    </div>
  )
}

function Th({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-semibold">
      <button onClick={onClick} className="flex items-center gap-1 hover:text-gray-900">
        {children} {icon}
      </button>
    </th>
  )
}

interface RowProps {
  ticket: Ticket
  categoryName?: string
  user: { userId: number; role: string; categoryIds: number[] } | null
  onClaim: (ticket: Ticket) => void
  onStatusChange: (ticket: Ticket, status: string) => void
  onView: (ticket: Ticket) => void
}

const STATUS_OPTIONS_SELECT = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

function Row({ ticket, categoryName, user, onClaim, onStatusChange, onView }: RowProps) {
  const isAdmin = user?.role === 'ADMIN'
  const canClaim = ticket.status === 'OPEN' && ticket.userAgentId == null && !isAdmin && user != null

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-500">#{ticket.idTicket}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{ticket.title}</td>
      <td className="px-4 py-3">
        {isAdmin ? (
          <select
            value={ticket.status}
            onChange={e => onStatusChange(ticket, e.target.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusBadge[ticket.status] ?? 'bg-gray-100 text-gray-800'}`}
          >
            {STATUS_OPTIONS_SELECT.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[ticket.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {ticket.status}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge[ticket.priority] ?? 'bg-gray-100 text-gray-800'}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">{categoryName ?? `#${ticket.idCategory}`}</td>
      <td className="px-4 py-3 text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {canClaim && (
            <button
              onClick={() => onClaim(ticket)}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition"
            >
              Prendre en charge
            </button>
          )}
          <button
            onClick={() => onView(ticket)}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs"
          >
            Voir
          </button>
        </div>
      </td>
    </tr>
  )
}
