import { useState, useCallback } from 'react'
import { ticketService } from '../api/services'
import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../api/types'

interface TicketStoreState {
    tickets: Ticket[]
    loading: boolean
    error: string | null
    selectedTicket: Ticket | null
}

interface TicketStore {
    state: TicketStoreState
    getAllTickets: () => Promise<void>
    getTicketById: (id: number) => Promise<void>
    getTicketsByCategory: (categoryId: number) => Promise<void>
    getTicketsByCreator: (userId: number) => Promise<void>
    getTicketsByStatus: (status: string) => Promise<void>
    createTicket: (ticket: CreateTicketDTO) => Promise<Ticket>
    updateTicket: (id: number, updates: UpdateTicketDTO) => Promise<Ticket>
    deleteTicket: (id: number) => Promise<void>
    clearError: () => void
    setSelectedTicket: (ticket: Ticket | null) => void
}

/**
 * Custom hook for ticket management
 * Provides all ticket-related operations and state
 */
export function useTicketStore(): TicketStore {
    const [state, setState] = useState<TicketStoreState>({
        tickets: [],
        loading: false,
        error: null,
        selectedTicket: null,
    })

    const updateState = useCallback(
        (updates: Partial<TicketStoreState> | ((prev: TicketStoreState) => Partial<TicketStoreState>)) => {
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

    const getAllTickets = useCallback(async () => {
        try {
            updateState({ loading: true, error: null })
            const data = await ticketService.getAllTickets()
            updateState({ tickets: data, loading: false })
        } catch (err) {
            handleError(err)
            updateState({ loading: false })
        }
    }, [updateState, handleError])

    const getTicketById = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                const ticket = await ticketService.getTicketById(id)
                updateState({ selectedTicket: ticket, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getTicketsByCategory = useCallback(
        async (categoryId: number) => {
            try {
                updateState({ loading: true, error: null })
                const data = await ticketService.getTicketsByCategory(categoryId)
                updateState({ tickets: data, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getTicketsByCreator = useCallback(
        async (userId: number) => {
            try {
                updateState({ loading: true, error: null })
                const data = await ticketService.getTicketsByCreator(userId)
                updateState({ tickets: data, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getTicketsByStatus = useCallback(
        async (status: string) => {
            try {
                updateState({ loading: true, error: null })
                const data = await ticketService.getTicketsByStatus(status)
                updateState({ tickets: data, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const createTicket = useCallback(
        async (ticket: CreateTicketDTO): Promise<Ticket> => {
            try {
                updateState({ loading: true, error: null })
                const newTicket = await ticketService.createTicket(ticket)
                updateState((prev) => ({
                    tickets: [...prev.tickets, newTicket],
                    loading: false
                }))
                return newTicket
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    const updateTicket = useCallback(
        async (id: number, updates: UpdateTicketDTO): Promise<Ticket> => {
            try {
                updateState({ loading: true, error: null })
                const updated = await ticketService.updateTicket(id, updates)
                updateState((prev) => ({
                    tickets: prev.tickets.map((t) => (t.idTicket === id ? updated : t)),
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

    const deleteTicket = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                await ticketService.deleteTicket(id)
                updateState((prev) => ({
                    tickets: prev.tickets.filter((t) => t.idTicket !== id),
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
        getAllTickets,
        getTicketById,
        getTicketsByCategory,
        getTicketsByCreator,
        getTicketsByStatus,
        createTicket,
        updateTicket,
        deleteTicket,
        clearError: () => updateState({ error: null }),
        setSelectedTicket: (ticket) => updateState({ selectedTicket: ticket }),
    }
}
