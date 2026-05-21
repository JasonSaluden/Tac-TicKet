import { useState, useCallback } from 'react'
import { messageService } from '../api/services'
import type { Message, CreateMessageDTO } from '../api/types'

interface MessageStoreState {
    messages: Message[]
    loading: boolean
    error: string | null
}

interface MessageStore {
    state: MessageStoreState
    getAllMessages: () => Promise<void>
    getMessageById: (id: number) => Promise<void>
    getMessagesByConversation: (conversationId: number) => Promise<void>
    getMessagesByUser: (userId: number) => Promise<void>
    createMessage: (message: CreateMessageDTO) => Promise<Message>
    updateMessage: (id: number, content: string) => Promise<Message>
    deleteMessage: (id: number) => Promise<void>
    clearError: () => void
}

export function useMessageStore(): MessageStore {
    const [state, setState] = useState<MessageStoreState>({
        messages: [],
        loading: false,
        error: null,
    })

    const updateState = useCallback(
        (updates: Partial<MessageStoreState> | ((prev: MessageStoreState) => Partial<MessageStoreState>)) => {
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

    const getAllMessages = useCallback(async () => {
        try {
            updateState({ loading: true, error: null })
            const data = await messageService.getAllMessages()
            updateState({ messages: data, loading: false })
        } catch (err) {
            handleError(err)
            updateState({ loading: false })
        }
    }, [updateState, handleError])

    const getMessageById = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                await messageService.getMessageById(id)
                updateState({ loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getMessagesByConversation = useCallback(
        async (conversationId: number) => {
            try {
                updateState({ loading: true, error: null })
                const data = await messageService.getMessagesByConversation(conversationId)
                updateState({ messages: data, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const getMessagesByUser = useCallback(
        async (userId: number) => {
            try {
                updateState({ loading: true, error: null })
                const data = await messageService.getMessagesByUser(userId)
                updateState({ messages: data, loading: false })
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
            }
        },
        [updateState, handleError]
    )

    const createMessage = useCallback(
        async (message: CreateMessageDTO): Promise<Message> => {
            try {
                updateState({ loading: true, error: null })
                const newMessage = await messageService.createMessage(message)
                updateState((prev) => ({
                    messages: [...prev.messages, newMessage],
                    loading: false,
                }))
                return newMessage
            } catch (err) {
                handleError(err)
                updateState({ loading: false })
                throw err
            }
        },
        [updateState, handleError]
    )

    const updateMessage = useCallback(
        async (id: number, content: string): Promise<Message> => {
            try {
                updateState({ loading: true, error: null })
                const updated = await messageService.updateMessage(id, content)
                updateState((prev) => ({
                    messages: prev.messages.map((m) => (m.idMessage === id ? updated : m)),
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

    const deleteMessage = useCallback(
        async (id: number) => {
            try {
                updateState({ loading: true, error: null })
                await messageService.deleteMessage(id)
                updateState((prev) => ({
                    messages: prev.messages.filter((m) => m.idMessage !== id),
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
        getAllMessages,
        getMessageById,
        getMessagesByConversation,
        getMessagesByUser,
        createMessage,
        updateMessage,
        deleteMessage,
        clearError: () => updateState({ error: null }),
    }
}
