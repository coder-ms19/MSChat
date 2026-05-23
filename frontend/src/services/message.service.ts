import api from '../api';

export interface Message {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
    updatedAt: string;
    sender?: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    attachments?: MessageAttachment[];
    isRead?: boolean;
}

export interface MessageAttachment {
    id: string;
    url: string;
    type: 'image' | 'video' | 'file';
    filename: string;
    size?: number;
}

export interface Conversation {
    id: string;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
    unreadCount?: number;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

export interface SendMessageData {
    content: string;
    conversationId: string;
    attachments?: File[];
}

export interface CreateConversationData {
    participantIds: string[];
    initialMessage?: string;
}

class MessageService {
    /**
     * Get all conversations for the current user
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await api.get<Conversation[]>('/conversations');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get a specific conversation by ID
     */
    async getConversation(conversationId: string): Promise<Conversation> {
        try {
            const response = await api.get<Conversation>(`/conversations/${conversationId}`);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
        try {
            const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`, {
                params: { page, limit },
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Send a message
     */
    async sendMessage(data: SendMessageData): Promise<Message> {
        try {
            const formData = new FormData();
            formData.append('content', data.content);
            formData.append('conversationId', data.conversationId);

            // Add attachments if any
            if (data.attachments && data.attachments.length > 0) {
                data.attachments.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            const response = await api.post<Message>('/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Create a new conversation
     */
    async createConversation(data: CreateConversationData): Promise<Conversation> {
        try {
            const response = await api.post<Conversation>('/conversations', data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Mark messages as read
     */
    async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
        try {
            await api.patch(`/conversations/${conversationId}/read`, { messageIds });
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Delete a message
     */
    async deleteMessage(messageId: string): Promise<void> {
        try {
            await api.delete(`/messages/${messageId}`);
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Edit a message
     */
    async editMessage(messageId: string, content: string): Promise<Message> {
        try {
            const response = await api.patch<Message>(`/messages/${messageId}`, { content });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Search messages
     */
    async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
        try {
            const response = await api.get<Message[]>('/messages/search', {
                params: { query, conversationId },
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await api.get<{ count: number }>('/messages/unread/count');
            return response.data.count;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): Error {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return new Error(message);
    }
}

// Export singleton instance
export const messageService = new MessageService();
export default messageService;
