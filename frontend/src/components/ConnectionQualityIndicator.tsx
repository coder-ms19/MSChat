import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import type { ConnectionQuality } from '../hooks/useConnectionQuality';

interface ConnectionQualityIndicatorProps {
    quality: ConnectionQuality;
    latency: number;
    packetLoss: number;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
    quality,
    latency,
    packetLoss
}) => {
    const getQualityColor = () => {
        switch (quality) {
            case 'excellent': return 'text-green-400';
            case 'good': return 'text-yellow-400';
            case 'poor': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getQualityText = () => {
        switch (quality) {
            case 'excellent': return 'Great';
            case 'good': return 'Okay';
            case 'poor': return 'Poor';
            default: return 'Offline';
        }
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 ${getQualityColor()}`}>
            {quality === 'disconnected' ? (
                <WifiOff className="w-3.5 h-3.5" />
            ) : (
                <Wifi className="w-3.5 h-3.5" />
            )}

            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {getQualityText()}
                </span>
                {quality !== 'disconnected' && (
                    <span className="text-[9px] font-mono opacity-60">
                        {latency > 0 ? `${latency}ms` : '--'}
                    </span>
                )}
            </div>

            {/* Technical stats tooltip on hover could be added here */}
            {(latency > 200 || packetLoss > 2) && (
                <Activity className="w-3 h-3 text-orange-400 animate-pulse ml-1" />
            )}
        </div>
    );
};
