import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-4 py-3 rounded-xl border bg-[#0f172a]
          text-white placeholder-slate-500
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-[#1e293b] disabled:text-slate-500 cursor-text
          shadow-inner
          ${error ? 'border-red-500/50 focus:ring-red-500' : 'border-[#334155] hover:border-slate-600'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-400 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" /> {error}
                </p>
            )}
        </div>
    );
};
