import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketService, conversationService, messageService, userService, categoryService } from '../api/services'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, Category, Conversation, Message, Ticket } from '../api/types'

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
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
}

export default function TicketConversation() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const t = await ticketService.getTicketById(ticketId)
        if (cancelled) return
        setTicket(t)

        const [conv, allUsers, allCats] = await Promise.all([
          conversationService.getConversationByTicket(ticketId).catch(() => null),
          userService.getAllUsers().catch(() => [] as AuthUser[]),
          categoryService.getAllCategories().catch(() => [] as Category[]),
        ])
        if (cancelled) return
        setUsers(allUsers)
        setCategories(allCats)
        setConversation(conv)

        if (conv) {
          const msgs = await messageService.getMessagesByConversation(conv.idConversation)
          if (cancelled) return
          setMessages(msgs)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur de chargement')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [ticketId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const userMap = useMemo(() => {
    const map = new Map<number, AuthUser>()
    users.forEach(u => map.set(u.userId, u))
    return map
  }, [users])

  const categoryName = useMemo(() => {
    if (!ticket) return undefined
    return categories.find(c => c.idCategory === ticket.idCategory)?.name
  }, [categories, ticket])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !user || !conversation) return
    try {
      setSending(true)
      const msg = await messageService.createMessage({
        content,
        idConversation: conversation.idConversation,
        userId: user.userId,
      })
      setMessages(prev => [...prev, msg])
      setDraft('')
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec d'envoi")
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto p-8 text-gray-500">Chargement…</div>
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-red-600">{error ?? 'Ticket introuvable'}</p>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-blue-600 hover:underline">
          ← Retour aux tickets
        </button>
      </div>
    )
  }

  const creator = userMap.get(ticket.userCreatorId)
  const creatorName = creator
    ? `${creator.firstName} ${creator.lastName}`
    : ticket.userCreatorName ?? `Utilisateur #${ticket.userCreatorId}`

  const canPost =
    user != null &&
    (user.role === 'ADMIN' ||
      user.userId === ticket.userCreatorId ||
      user.userId === ticket.userAgentId)

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <button onClick={() => navigate('/tickets')} className="text-sm text-blue-600 hover:underline">
          ← Retour aux tickets
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Ticket #{ticket.idTicket}</p>
            <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[ticket.status] ?? 'bg-gray-100 text-gray-800'}`}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge[ticket.priority] ?? 'bg-gray-100 text-gray-800'}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4">
          <span>Catégorie : {categoryName ?? `#${ticket.idCategory}`}</span>
          <span>Créé par : {creatorName}</span>
          <span>
            Agent :{' '}
            {ticket.userAgentId
              ? (userMap.get(ticket.userAgentId)
                  ? `${userMap.get(ticket.userAgentId)!.firstName} ${userMap.get(ticket.userAgentId)!.lastName}`
                  : ticket.userAgentName ?? `#${ticket.userAgentId}`)
              : 'Non assigné'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <Bubble
          author={creatorName}
          authorRole="Demandeur"
          content={ticket.description || ticket.title}
          date={ticket.createdAt}
          mine={user?.userId === ticket.userCreatorId}
        />
        {messages
          .slice()
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map(m => {
            const author = userMap.get(m.userId)
            const authorName = author ? `${author.firstName} ${author.lastName}` : `Utilisateur #${m.userId}`
            const role = m.userId === ticket.userCreatorId
              ? 'Demandeur'
              : m.userId === ticket.userAgentId
                ? 'Agent'
                : author?.role === 'ADMIN' ? 'Admin' : undefined
            return (
              <Bubble
                key={m.idMessage}
                author={authorName}
                authorRole={role}
                content={m.content}
                date={m.createdAt}
                mine={user?.userId === m.userId}
              />
            )
          })}
        <div ref={endRef} />
      </div>

      {conversation && canPost && !isClosed ? (
        <div className="mt-4 flex items-end gap-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
          >
            Envoyer
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-500 italic">
          {isClosed
            ? 'Ce ticket est fermé, plus aucun message ne peut être envoyé.'
            : !conversation
              ? 'Aucune conversation associée à ce ticket.'
              : "Vous n'avez pas accès à la discussion de ce ticket."}
        </p>
      )}
    </div>
  )
}

interface BubbleProps {
  author: string
  authorRole?: string
  content: string
  date: string
  mine: boolean
}

function Bubble({ author, authorRole, content, date, mine }: BubbleProps) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'}`}>
        <div className={`flex items-baseline gap-2 mb-1 text-xs ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
          <span className="font-semibold">{author}</span>
          {authorRole && <span className="opacity-80">· {authorRole}</span>}
        </div>
        <p className="whitespace-pre-wrap text-sm">{content}</p>
        <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(date).toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  )
}
