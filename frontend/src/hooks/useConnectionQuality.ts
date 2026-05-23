import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected';

interface ConnectionStats {
    quality: ConnectionQuality;
    latency: number;
    packetLoss: number;
}

export const useConnectionQuality = (socket: Socket | null, peerConnection: RTCPeerConnection | null) => {
    const [stats, setStats] = useState<ConnectionStats>({
        quality: 'excellent',
        latency: 0,
        packetLoss: 0,
    });

    const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const statsIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const lastHeartbeatTimeRef = useRef<number>(0);
    const heartbeatAckHandlerRef = useRef<((data: any) => void) | null>(null);

    // Heartbeat handler with proper cleanup
    const handleHeartbeatAck = useCallback((data: { quality: ConnectionQuality; timestamp: number }) => {
        const latency = Date.now() - lastHeartbeatTimeRef.current;
        setStats(prev => ({
            ...prev,
            latency,
            quality: data.quality,
        }));
    }, []);

    // Connection quality update handler
    const handleConnectionQuality = useCallback((data: { quality: ConnectionQuality }) => {
        setStats(prev => ({ ...prev, quality: data.quality }));
    }, []);

    // Socket heartbeat monitoring
    useEffect(() => {
        if (!socket) {
            setStats(prev => ({ ...prev, quality: 'disconnected' }));
            return;
        }

        // Store handler ref for cleanup
        heartbeatAckHandlerRef.current = handleHeartbeatAck;

        // Register event listeners
        socket.on('heartbeat-ack', handleHeartbeatAck);
        socket.on('connection-quality', handleConnectionQuality);

        // Send heartbeat every 10 seconds
        heartbeatIntervalRef.current = setInterval(() => {
            lastHeartbeatTimeRef.current = Date.now();
            socket.emit('heartbeat');
        }, 10000);

        // Send initial heartbeat
        lastHeartbeatTimeRef.current = Date.now();
        socket.emit('heartbeat');

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = undefined;
            }
            // Properly remove event listeners
            socket.off('heartbeat-ack', handleHeartbeatAck);
            socket.off('connection-quality', handleConnectionQuality);
        };
    }, [socket, handleHeartbeatAck, handleConnectionQuality]);

    // WebRTC stats monitoring
    useEffect(() => {
        if (!peerConnection) return;

        let lastPacketsLost = 0;
        let lastPacketsReceived = 0;

        statsIntervalRef.current = setInterval(async () => {
            try {
                const rtcStats = await peerConnection.getStats();
                let packetsLost = 0;
                let packetsReceived = 0;

                rtcStats.forEach((report) => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        packetsLost += report.packetsLost || 0;
                        packetsReceived += report.packetsReceived || 0;
                    }
                });

                // Calculate delta (change since last check)
                const deltaLost = packetsLost - lastPacketsLost;
                const deltaReceived = packetsReceived - lastPacketsReceived;

                lastPacketsLost = packetsLost;
                lastPacketsReceived = packetsReceived;

                // Calculate packet loss percentage based on delta
                const packetLoss = deltaReceived > 0
                    ? (deltaLost / (deltaLost + deltaReceived)) * 100
                    : 0;

                // Determine quality based on packet loss
                let quality: ConnectionQuality = 'excellent';
                if (packetLoss > 5) {
                    quality = 'poor';
                } else if (packetLoss > 2) {
                    quality = 'good';
                }

                setStats(prev => ({
                    ...prev,
                    packetLoss: Math.max(0, packetLoss), // Ensure non-negative
                    // Only downgrade quality, let heartbeat upgrade it
                    quality: quality === 'poor' ? 'poor' : prev.quality,
                }));

                // Report quality to server if poor
                if (quality === 'poor' && socket) {
                    socket.emit('report-quality', { quality: 'poor' });
                }
            } catch (error) {
                console.error('Error getting WebRTC stats:', error);
            }
        }, 5000);

        return () => {
            if (statsIntervalRef.current) {
                clearInterval(statsIntervalRef.current);
                statsIntervalRef.current = undefined;
            }
        };
    }, [peerConnection, socket]);

    return stats;
};
