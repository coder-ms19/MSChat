// Example: How to show unread message counts in the conversation list

import { useState, useEffect } from 'react';
import api from '../../api';

interface ConversationWithUnread {
    id: string;
    name?: string;
    isGroup: boolean;
    users: any[];
    messages: any[];
    unreadCount: number;
}

export function ConversationListWithUnread({ currentUserId }: { currentUserId: string }) {
    const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
    const [loading, setLoading] = useState(true);

    // Load conversations with unread counts
    useEffect(() => {
        async function loadConversations() {
            try {
                const response = await api.get(`/conversations/user/${currentUserId}/with-unread`);
                setConversations(response.data);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setLoading(false);
            }
        }

        loadConversations();
    }, [currentUserId]);

    if (loading) {
        return <div>Loading conversations...</div>;
    }

    return (
        <div className="conversation-list">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}

function ConversationItem({
    conversation,
    currentUserId
}: {
    conversation: ConversationWithUnread;
    currentUserId: string;
}) {
    const otherUser = conversation.users.find(u => u.userId !== currentUserId)?.user;
    const displayName = conversation.isGroup
        ? conversation.name || 'Group Chat'
        : otherUser?.username || 'Unknown';

    const lastMessage = conversation.messages[0];
    const hasUnread = conversation.unreadCount > 0;

    return (
        <div
            className={`
        conversation-item
        flex items-center gap-3 p-4 cursor-pointer
        hover:bg-slate-800/50 transition-colors
        ${hasUnread ? 'bg-slate-800/30' : ''}
      `}
        >
            {/* Avatar */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {displayName[0]?.toUpperCase()}
                </div>

                {/* Unread badge on avatar */}
                {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                )}
            </div>

            {/* Conversation info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${hasUnread ? 'text-white' : 'text-slate-300'}`}>
                        {displayName}
                    </h3>
                    {lastMessage && (
                        <span className="text-xs text-slate-500">
                            {formatTime(lastMessage.createdAt)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${hasUnread ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {lastMessage?.content || 'No messages yet'}
                    </p>

                    {/* Unread badge as text */}
                    {hasUnread && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            {conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================
// ALTERNATIVE: Real-time unread count updates
// ============================================

export function ConversationListWithRealtime({
    currentUserId,
    socket
}: {
    currentUserId: string;
    socket: any;
}) {
    const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);

    useEffect(() => {
        // Load initial conversations
        async function loadConversations() {
            const response = await api.get(`/conversations/user/${currentUserId}/with-unread`);
            setConversations(response.data);
        }
        loadConversations();

        // Listen for new messages
        socket?.on('message', async (message: any) => {
            // If message is not from current user, increment unread count
            if (message.senderId !== currentUserId) {
                setConversations(prev => prev.map(conv => {
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            unreadCount: conv.unreadCount + 1,
                            messages: [message, ...conv.messages]
                        };
                    }
                    return conv;
                }));
            }
        });

        // Listen for conversation read updates
        socket?.on('conversation-read-update', (data: { conversationId: string; userId: string }) => {
            if (data.userId === currentUserId) {
                // Current user read a conversation, reset unread count
                setConversations(prev => prev.map(conv => {
                    if (conv.id === data.conversationId) {
                        return { ...conv, unreadCount: 0 };
                    }
                    return conv;
                }));
            }
        });

        return () => {
            socket?.off('message');
            socket?.off('conversation-read-update');
        };
    }, [currentUserId, socket]);

    return (
        <div className="conversation-list">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}

// ============================================
// Total unread count across all conversations
// ============================================

export function useTotalUnreadCount(currentUserId: string) {
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        async function loadTotalUnread() {
            try {
                const response = await api.get(`/conversations/user/${currentUserId}/with-unread`);
                const total = response.data.reduce(
                    (sum: number, conv: ConversationWithUnread) => sum + conv.unreadCount,
                    0
                );
                setTotalUnread(total);
            } catch (error) {
                console.error('Error loading total unread:', error);
            }
        }

        loadTotalUnread();
    }, [currentUserId]);

    return totalUnread;
}

// Usage in header/navbar:
export function AppHeader({ currentUserId }: { currentUserId: string }) {
    const totalUnread = useTotalUnreadCount(currentUserId);

    return (
        <header className="app-header">
            <nav>
                <a href="/chat" className="relative">
                    Messages
                    {totalUnread > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </a>
            </nav>
        </header>
    );
}
