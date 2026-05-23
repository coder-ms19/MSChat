import { User } from 'lucide-react';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
};

export default function Avatar({ src, alt = 'User', size = 'md', className = '' }: AvatarProps) {
    const sizeClass = sizeClasses[size];

    return (
        <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                                ${alt[0]?.toUpperCase() || 'U'}
                            </div>
                        `;
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                    {alt[0]?.toUpperCase() || <User className="w-1/2 h-1/2" />}
                </div>
            )}
        </div>
    );
}
