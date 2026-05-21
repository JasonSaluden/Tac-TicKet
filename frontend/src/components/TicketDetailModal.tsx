import { Modal } from './ui/Modal'
import type { Ticket } from '../api/types'

interface Props {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  categoryName?: string
}

const statusBadge: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const priorityBadge: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'En attente',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
}

export function TicketDetailModal({ ticket, isOpen, onClose, categoryName }: Props) {
  if (!ticket) return null

  const claimedAt = ticket.updatedAt && ticket.status !== 'OPEN'
    ? new Date(ticket.updatedAt).toLocaleString('fr-FR')
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket.idTicket}`} size="md">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
          {ticket.description && (
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Statut</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[ticket.status] ?? 'bg-gray-100 text-gray-800'}`}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Priorité</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge[ticket.priority] ?? 'bg-gray-100 text-gray-800'}`}>
              {ticket.priority}
            </span>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Catégorie</p>
            <p className="text-gray-800">{categoryName ?? `#${ticket.idCategory}`}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Créé le</p>
            <p className="text-gray-800">{new Date(ticket.createdAt).toLocaleString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Créé par</p>
            <p className="text-gray-800">{ticket.userCreatorName ?? `Utilisateur #${ticket.userCreatorId}`}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Pris en charge par</p>
            {ticket.userAgentId ? (
              <div>
                <p className="text-gray-800 font-medium">{ticket.userAgentName ?? `Utilisateur #${ticket.userAgentId}`}</p>
                {claimedAt && (
                  <p className="text-xs text-gray-500">le {claimedAt}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">Non assigné</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
