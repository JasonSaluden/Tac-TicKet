import api from '../axios'
import type { Conversation } from '../types'

class ConversationService {
    /**
     * Get all conversations
     */
    async getAllConversations(): Promise<Conversation[]> {
        const response = await api.get<Conversation[]>('/conversations')
        return response.data
    }

    /**
     * Get conversation by ID
     */
    async getConversationById(id: number): Promise<Conversation> {
        const response = await api.get<Conversation>(`/conversations/${id}`)
        return response.data
    }

    /**
     * Get conversation by ticket ID
     */
    async getConversationByTicket(ticketId: number): Promise<Conversation> {
        const response = await api.get<Conversation>(`/conversations/ticket/${ticketId}`)
        return response.data
    }

    /**
     * Create new conversation (usually auto-created with ticket)
     */
    async createConversation(ticketId: number): Promise<Conversation> {
        const response = await api.post<Conversation>('/conversations', { idTicket: ticketId })
        return response.data
    }

    /**
     * Delete conversation
     */
    async deleteConversation(id: number): Promise<void> {
        await api.delete(`/conversations/${id}`)
    }
}

export const conversationService = new ConversationService()
