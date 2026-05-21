import { useAuth } from '../context/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTicketStore } from '../stores/ticket.store'
import { useCategoryStore } from '../stores/category.store'
import { CategoryModal } from '../components/CategoryModal'
import { CreateTicketModal } from '../components/CreateTicketModal'
import { userService } from '../api/services'
import type { AuthUser } from '../api/types'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const ticketStore = useTicketStore()
  const categoryStore = useCategoryStore()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [users, setUsers] = useState<AuthUser[]>([])

  useEffect(() => {
    ticketStore.getAllTickets()
    categoryStore.getAllCategories()
    userService.getAllUsers().then(setUsers).catch(() => setUsers([]))
  }, [])

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    users.forEach(u => map.set(u.userId, `${u.firstName} ${u.lastName}`))
    return map
  }, [users])

  // Apply same visibility rules as Tickets page
  const visibleTickets = (() => {
    if (!user) return []
    if (user.role === 'ADMIN') return ticketStore.state.tickets
    return ticketStore.state.tickets.filter(t => {
      const isUnclaimed = t.status === 'OPEN' && t.userAgentId == null
      const isClaimed = t.userAgentId === user.userId
      const isCreated = t.userCreatorId === user.userId
      if (user.role === 'AGENT') return isUnclaimed || isClaimed || user.categoryIds.includes(t.idCategory)
      return isUnclaimed || isClaimed || isCreated
    })
  })()

  // Calculate statistics
  const stats = {
    total: visibleTickets.length,
    open: visibleTickets.filter(t => t.status === 'OPEN').length,
    inProgress: visibleTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: visibleTickets.filter(t => t.status === 'RESOLVED').length,
    closed: visibleTickets.filter(t => t.status === 'CLOSED').length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 border-blue-200'
      case 'IN_PROGRESS': return 'bg-purple-50 border-purple-200'
      case 'RESOLVED': return 'bg-green-50 border-green-200'
      case 'CLOSED': return 'bg-gray-50 border-gray-200'
      default: return 'bg-white border-gray-200'
    }
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">Here's what's happening with your support tickets today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Open</p>
                <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                ✨
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ⚡
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Closed</p>
                <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                ✔️
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Tickets</h3>
                <button
                  onClick={() => navigate('/tickets')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </button>
              </div>

              {ticketStore.state.loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              ) : visibleTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tickets yet. Create your first ticket! 🚀</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleTickets.slice(0, 5).map(ticket => (
                    <div
                      key={ticket.idTicket}
                      className={`border rounded-lg p-4 transition hover:shadow-md ${getStatusColor(ticket.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{ticket.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            <span className="text-xs text-gray-600">
                              par {userMap.get(ticket.userCreatorId) ?? ticket.userCreatorName ?? `#${ticket.userCreatorId}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Manage Categories */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsCreateTicketOpen(true)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-sm"
                >
                  + Create Ticket
                </button>
                <button className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition text-sm">
                  View Reports
                </button>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                >
                  + New Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={() => ticketStore.getAllTickets()}
      />
    </div>
  )
}
