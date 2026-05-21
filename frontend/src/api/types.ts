// Auth Types
export interface AuthUser {
    idUser: number
    email: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'AGENT' | 'USER'
}

export interface LoginResponse {
    token: string
    idUser: number
    email: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'AGENT' | 'USER'
}

// Ticket Types
export interface Ticket {
    idTicket: number
    title: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    createdAt: string
    updatedAt: string
    userCreatorId: number
    userCreatorName?: string
    userAgentId?: number
    userAgentName?: string
    idCategory: number
}

export interface CreateTicketDTO {
    title: string
    description: string
    status?: string
    priority?: string
    idCategory: number
    userCreatorId: number
}

export interface UpdateTicketDTO {
    title?: string
    description?: string
    status?: string
    priority?: string
    userAgentId?: number
    idCategory?: number
}

// Category Types
export interface Category {
    idCategory: number
    name: string
}

export interface CreateCategoryDTO {
    name: string
}

// Message Types
export interface Message {
    idMessage: number
    content: string
    createdAt: string
    updatedAt: string
    userId: number
    idConversation: number
}

export interface CreateMessageDTO {
    content: string
    idConversation: number
    userId: number
}

// Conversation Types
export interface Conversation {
    idConversation: number
    createdAt: string
    idTicket: number
}

// API Response Types
export interface ApiResponse<T> {
    data: T
    message?: string
}

export interface ApiError {
    status: number
    message: string
}
