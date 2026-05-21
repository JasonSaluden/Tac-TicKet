import api from '../axios'
import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../types'

class TicketService {
    /**
     * Get all tickets
     */
    async getAllTickets(): Promise<Ticket[]> {
        const response = await api.get<Ticket[]>('/tickets')
        return response.data
    }

    /**
     * Get ticket by ID
     */
    async getTicketById(id: number): Promise<Ticket> {
        const response = await api.get<Ticket>(`/tickets/${id}`)
        return response.data
    }

    /**
     * Get tickets by category
     */
    async getTicketsByCategory(categoryId: number): Promise<Ticket[]> {
        const response = await api.get<Ticket[]>(`/tickets/category/${categoryId}`)
        return response.data
    }

    /**
     * Get tickets by creator user
     */
    async getTicketsByCreator(userId: number): Promise<Ticket[]> {
        const response = await api.get<Ticket[]>(`/tickets/creator/${userId}`)
        return response.data
    }

    /**
     * Get tickets by status
     */
    async getTicketsByStatus(status: string): Promise<Ticket[]> {
        const response = await api.get<Ticket[]>(`/tickets/search`, { params: { status } })
        return response.data
    }

    /**
     * Create new ticket
     */
    async createTicket(ticket: CreateTicketDTO): Promise<Ticket> {
        const response = await api.post<Ticket>('/tickets', ticket)
        return response.data
    }

    /**
     * Update ticket
     */
    async updateTicket(id: number, updates: UpdateTicketDTO): Promise<Ticket> {
        const response = await api.put<Ticket>(`/tickets/${id}`, updates)
        return response.data
    }

    /**
     * Delete ticket
     */
    async deleteTicket(id: number): Promise<void> {
        await api.delete(`/tickets/${id}`)
    }
}

export const ticketService = new TicketService()
