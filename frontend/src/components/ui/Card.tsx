import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-[#1e293b] rounded-2xl shadow-xl border border-[#334155] overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-[#334155] bg-[#0f172a]/50">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};
