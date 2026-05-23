import React from 'react';

interface ReadReceiptProps {
    status: 'sent' | 'delivered' | 'read';
    className?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, className = '' }) => {
    if (status === 'sent') {
        // Single gray checkmark
        return (
            <svg
                className={`w-4 h-4 text-gray-400 ${className}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        );
    }

    if (status === 'delivered') {
        // Double gray checkmarks
        return (
            <div className={`relative w-4 h-4 ${className}`}>
                <svg
                    className="absolute w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                <svg
                    className="absolute w-4 h-4 text-gray-400"
                    style={{ left: '4px' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>
        );
    }

    // Read - Double blue checkmarks
    return (
        <div className={`relative w-4 h-4 ${className}`}>
            <svg
                className="absolute w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
            <svg
                className="absolute w-4 h-4 text-blue-500"
                style={{ left: '4px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        </div>
    );
};
