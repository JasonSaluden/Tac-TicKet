import api from '../axios'
import type { Message, CreateMessageDTO } from '../types'

class MessageService {
    /**
     * Get all messages
     */
    async getAllMessages(): Promise<Message[]> {
        const response = await api.get<Message[]>('/messages')
        return response.data
    }

    /**
     * Get message by ID
     */
    async getMessageById(id: number): Promise<Message> {
        const response = await api.get<Message>(`/messages/${id}`)
        return response.data
    }

    /**
     * Get messages by conversation
     */
    async getMessagesByConversation(conversationId: number): Promise<Message[]> {
        const response = await api.get<Message[]>(`/messages/conversation/${conversationId}`)
        return response.data
    }

    /**
     * Get messages by user
     */
    async getMessagesByUser(userId: number): Promise<Message[]> {
        const response = await api.get<Message[]>(`/messages/user/${userId}`)
        return response.data
    }

    /**
     * Create new message
     */
    async createMessage(message: CreateMessageDTO): Promise<Message> {
        const response = await api.post<Message>('/messages', message)
        return response.data
    }

    /**
     * Update message
     */
    async updateMessage(id: number, content: string): Promise<Message> {
        const response = await api.put<Message>(`/messages/${id}`, { content })
        return response.data
    }

    /**
     * Delete message
     */
    async deleteMessage(id: number): Promise<void> {
        await api.delete(`/messages/${id}`)
    }
}

export const messageService = new MessageService()
