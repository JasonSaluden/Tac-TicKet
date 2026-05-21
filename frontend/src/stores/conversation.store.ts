import { useState, useCallback } from 'react'
import { conversationService } from '../api/services'
import type { Conversation } from '../api/types'

interface ConversationStoreState {
    conversations: Conversation[]
    loading: boolean
    error: string | null
    selectedConversation: Conversation | null
}

interface ConversationStore {
    state: ConversationStoreState
    getAllConversations: () => Promise<void>
    getConversationById: (id: number) => Promise<void>
    getConversationByTicket: (ticketId: number) => Promise<void>
    createConversation: (ticketId: number) => Promise<Conversation>
    deleteConversation: (id: number) => Promise<void>
    clearError: () => void
    setSelectedConversation: (conversation: Conversation | null) => void
}

export function useConversationStore(): ConversationStore {
    const [state, setState] = useState<ConversationStoreState>({
        conversations: [],
        loading: false,
        error: null,
        selectedConversation: null,
    })

    const updateState = useCallback(
        (updates: Partial<ConversationStoreState> | ((prev: ConversationStoreState) => Partial<ConversationStoreState>)) => {
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

    const getAllConversations = useCallback(async () => {
        try {
            updateState({ loading: true, error: null })
            const data = await conversationService.getAllConversations()
            updateState({ conversations: data, loading: false })
        } catch (err) {
            handleError(err)
            updateState({ loading: false })
        }
    }, [updateState, handleError])

    const getConversationById = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                const conversation = await conversationService.getConversationById(id)
                updateState({ selectedConversation: conversation, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getConversationByTicket = useCallback(
        async (ticketId: number) => {
            try {
                updateState({ loading: true, error: null })
                const conversation = await conversationService.getConversationByTicket(ticketId)
                updateState({ selectedConversation: conversation, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const createConversation = useCallback(
        async (ticketId: number): Promise<Conversation> => {
            try {
                updateState({ loading: true, error: null })
                const newConversation = await conversationService.createConversation(ticketId)
                updateState((prev) => ({
                    conversations: [...prev.conversations, newConversation],
                    loading: false,
                }))
                return newConversation
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    const deleteConversation = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                await conversationService.deleteConversation(id)
                updateState((prev) => ({
                    conversations: prev.conversations.filter((c) => c.idConversation !== id),
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
        getAllConversations,
        getConversationById,
        getConversationByTicket,
        createConversation,
        deleteConversation,
        clearError: () => updateState({ error: null }),
        setSelectedConversation: (conversation) =>
            updateState({ selectedConversation: conversation }),
    }
}
