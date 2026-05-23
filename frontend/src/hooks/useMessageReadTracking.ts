import { useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import api from '../api';

export interface MessageStatus {
    messageId: string;
    status: 'sent' | 'delivered' | 'read';
    deliveredAt?: Date | null;
    readAt?: Date | null;
}

export const useMessageReadTracking = (
    socket: Socket | null,
    conversationId: string | null,
    currentUserId: string | null,
    onStatusUpdate?: (messageId: string, status: MessageStatus) => void
) => {
    // Use ref to always have the latest conversationId
    const conversationIdRef = useRef(conversationId);

    // Update ref when conversationId changes
    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // Mark message as delivered when received
    const markAsDelivered = useCallback(async (messageId: string) => {
        if (!currentUserId || !socket) return;

        try {
            // Emit WebSocket event
            socket.emit('message-delivered', {
                messageId,
                userId: currentUserId,
            });

            // Also call REST API as backup
            await api.post(`/conversations/messages/${messageId}/delivered`, {
                messageId,
                userId: currentUserId,
            });
        } catch (error) {
            console.error('Error marking message as delivered:', error);
        }
    }, [currentUserId, socket]);

    // Mark message as read
    const markAsRead = useCallback(async (messageId: string) => {
        if (!currentUserId || !socket) return;

        try {
            // Emit WebSocket event
            socket.emit('message-read', {
                messageId,
                userId: currentUserId,
            });

            // Also call REST API as backup
            await api.post(`/conversations/messages/${messageId}/read`, {
                messageId,
                userId: currentUserId,
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }, [currentUserId, socket]);

    // Mark entire conversation as read
    const markConversationAsRead = useCallback(async () => {
        const currentConversationId = conversationIdRef.current;

        if (!currentConversationId || !currentUserId || !socket) {
            console.log('markConversationAsRead - Missing dependencies:', {
                conversationId: currentConversationId,
                currentUserId,
                hasSocket: !!socket
            });
            return;
        }

        try {
            console.log('Marking conversation as read:', { conversationId: currentConversationId, currentUserId });

            // Emit WebSocket event
            socket.emit('conversation-read', {
                conversationId: currentConversationId,
                userId: currentUserId,
            });

            // Also call REST API as backup (conversationId is in URL, only send userId in body)
            const response = await api.post(`/conversations/${currentConversationId}/mark-read`, {
                userId: currentUserId,
            });

            console.log('Conversation marked as read successfully:', response.data);
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }, [currentUserId, socket]); // Remove conversationId from dependencies

    // Get unread count for a conversation
    const getUnreadCount = useCallback(async (convId: string): Promise<number> => {
        if (!currentUserId) return 0;

        try {
            const response = await api.get(`/conversations/${convId}/unread-count/${currentUserId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }, [currentUserId]);

    // Listen for delivery/read updates from other users
    useEffect(() => {
        if (!socket) return;

        const handleDeliveryUpdate = (data: {
            messageId: string;
            userId: string;
            status: 'delivered';
            deliveredAt: Date;
        }) => {
            if (onStatusUpdate) {
                onStatusUpdate(data.messageId, {
                    messageId: data.messageId,
                    status: data.status,
                    deliveredAt: data.deliveredAt,
                });
            }
        };

        const handleReadUpdate = (data: {
            messageId: string;
            userId: string;
            status: 'read';
            readAt: Date;
        }) => {
            if (onStatusUpdate) {
                onStatusUpdate(data.messageId, {
                    messageId: data.messageId,
                    status: data.status,
                    readAt: data.readAt,
                });
            }
        };

        socket.on('message-delivery-update', handleDeliveryUpdate);
        socket.on('message-read-update', handleReadUpdate);

        return () => {
            socket.off('message-delivery-update', handleDeliveryUpdate);
            socket.off('message-read-update', handleReadUpdate);
        };
    }, [socket, onStatusUpdate]);

    return {
        markAsDelivered,
        markAsRead,
        markConversationAsRead,
        getUnreadCount,
    };
};
