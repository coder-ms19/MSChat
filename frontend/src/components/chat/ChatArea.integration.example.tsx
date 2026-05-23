// Example: How to integrate message read tracking into ChatArea.tsx

import { useMessageReadTracking } from '../../hooks/useMessageReadTracking';
import { useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Socket } from 'socket.io-client';

// Type definitions
interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
    status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
    id: string;
    isGroup: boolean;
}

interface User {
    id: string;
    username: string;
}

interface ChatAreaProps {
    conversation: Conversation;
    messages: Message[];
    currentUser: User;
    socket: Socket;
}

// Inside your ChatArea component:

export function ChatArea({ conversation, messages, currentUser, socket }: ChatAreaProps) {
    const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});

    // Initialize the read tracking hook
    const {
        markAsDelivered,
        markConversationAsRead,
    } = useMessageReadTracking(
        socket,
        conversation?.id,
        currentUser?.id,
        (messageId, status) => {
            // Update message status when we receive updates
            setMessageStatuses(prev => ({
                ...prev,
                [messageId]: status.status
            }));
        }
    );

    // Mark conversation as read when user opens it
    useEffect(() => {
        if (conversation?.id && currentUser?.id) {
            markConversationAsRead();
        }
    }, [conversation?.id, currentUser?.id, markConversationAsRead]);

    // Mark new messages as delivered when they arrive
    useEffect(() => {
        if (!messages || !currentUser) return;

        messages.forEach((message: Message) => {
            // Only mark others' messages as delivered
            if (message.senderId !== currentUser.id && !messageStatuses[message.id]) {
                markAsDelivered(message.id);
                setMessageStatuses(prev => ({
                    ...prev,
                    [message.id]: 'delivered'
                }));
            }
        });
    }, [messages, currentUser, markAsDelivered, messageStatuses]);

    // Note: If you need to mark messages as read when user scrolls to them,
    // you can implement an IntersectionObserver in the MessageBubble component
    // and call markAsRead from there.

    const handleRefresh = () => {
        // Placeholder for refresh functionality
        console.log('Refreshing messages...');
    };

    return (
        <div className="chat-area">
            {messages.map((message: Message, index: number) => {
                const isMe = message.senderId === currentUser.id;
                const status = messageStatuses[message.id] || 'sent';

                return (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isMe={isMe}
                        isGroup={conversation.isGroup}
                        status={status}
                        onUpdate={handleRefresh}
                        onReply={() => console.log('Reply clicked')}
                        showSenderInfo={shouldShowSenderInfo(message, messages[index - 1])}
                    />
                );
            })}
        </div>
    );
}

// Helper function to determine if sender info should be shown
function shouldShowSenderInfo(currentMessage: Message, previousMessage: Message | undefined): boolean {
    if (!previousMessage) return true;

    // Show sender info if:
    // 1. Different sender than previous message
    // 2. More than 5 minutes since last message
    const differentSender = currentMessage.senderId !== previousMessage.senderId;
    const timeDiff = new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
    const moreThan5Minutes = timeDiff > 5 * 60 * 1000;

    return differentSender || moreThan5Minutes;
}

// ============================================
// ALTERNATIVE: Fetch messages with status from API
// ============================================

interface ChatAreaWithAPIProps {
    conversation: Conversation;
    currentUser: User;
    socket: Socket;
}

export function ChatAreaWithAPI({ conversation, currentUser }: ChatAreaWithAPIProps) {
    const [messagesWithStatus, setMessagesWithStatus] = useState<Message[]>([]);

    useEffect(() => {
        async function loadMessages() {
            if (!conversation?.id || !currentUser?.id) return;

            try {
                // Fetch messages with read status
                // Note: You need to import your API client (e.g., import api from '../../api')
                // Uncomment the following lines when your API is ready:
                // const response = await api.get(
                //     `/conversations/${conversation.id}/messages-with-status/${currentUser.id}`
                // );
                // setMessagesWithStatus(response.data);

                // For now, set empty array to avoid unused variable warning
                setMessagesWithStatus([]);
                console.log('Loading messages for conversation:', conversation.id);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }

        loadMessages();
    }, [conversation?.id, currentUser?.id]);

    return (
        <div className="chat-area">
            {messagesWithStatus.map((message: Message) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    isMe={message.senderId === currentUser.id}
                    isGroup={conversation.isGroup}
                    status={message.status}
                    onUpdate={() => {
                        // Reload messages
                        console.log('Updating messages...');
                    }}
                    onReply={() => console.log('Reply clicked')}
                />
            ))}
        </div>
    );
}
