import React, { useState } from 'react';
import { useCall } from '../contexts/CallContext';

interface CallButtonProps {
    recipientId: string;
    recipientName: string;
    conversationId?: string;
    className?: string;
}

export const CallButton: React.FC<CallButtonProps> = ({
    recipientId,
    conversationId,
    className = '',
}) => {
    const { initiateCall } = useCall();
    const [showMenu, setShowMenu] = useState(false);
    const [isInitiating, setIsInitiating] = useState(false);

    const handleCall = async (callType: 'AUDIO_1TO1' | 'VIDEO_1TO1') => {
        try {
            setIsInitiating(true);
            await initiateCall([recipientId], callType, conversationId);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to initiate call:', error);
            alert('Failed to start call. Please check your camera/microphone permissions.');
        } finally {
            setIsInitiating(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isInitiating}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
                aria-label="Call options"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600 dark:text-gray-300"
                >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => handleCall('AUDIO_1TO1')}
                            disabled={isInitiating}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-green-600 dark:text-green-400"
                                >
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Audio Call
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Voice only
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleCall('VIDEO_1TO1')}
                            disabled={isInitiating}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50 border-t border-gray-100 dark:border-gray-700"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-blue-600 dark:text-blue-400"
                                >
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Video Call
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Camera & voice
                                </p>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
