import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';
import { oauthService } from '../services';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Completing authentication...');

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            // Use an async IIFE to properly await the callback handler
            (async () => {
                try {
                    // MUST await — handleCallback is async and saves tokens to localStorage
                    await oauthService.handleCallback(token, userStr);

                    // Notify App.tsx that auth state changed so ProtectedRoutes work
                    window.dispatchEvent(new Event('auth-change'));

                    setStatus('success');
                    setMessage('Authentication successful! Redirecting...');

                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                } catch (error) {
                    console.error('Error handling OAuth callback:', error);
                    setStatus('error');
                    setMessage('Authentication failed. Redirecting to login...');

                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
            })();
        } else {
            setStatus('error');
            setMessage('Invalid authentication response. Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] text-white flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20" />
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            {status === 'loading' && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Loader className="w-16 h-16 text-blue-400" />
                                </motion.div>
                            )}
                            {status === 'success' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                >
                                    <CheckCircle className="w-16 h-16 text-green-400" />
                                </motion.div>
                            )}
                            {status === 'error' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <span className="text-4xl">❌</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Message */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {status === 'loading' && 'Authenticating...'}
                            {status === 'success' && 'Success!'}
                            {status === 'error' && 'Oops!'}
                        </h2>
                        <p className="text-slate-400">{message}</p>

                        {/* Loading Bar */}
                        {status === 'loading' && (
                            <div className="mt-6 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2, ease: 'easeInOut' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
