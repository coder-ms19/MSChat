import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import {
    Video, Shield, Globe, Zap,
    ArrowRight, Star, MessageCircle, Heart
} from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
        setUser(null);
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 selection:text-purple-200 font-sans overflow-x-hidden">
            <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} currentPage="home" />

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span>Welcome</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
                    >
                        Meet Strangers <br />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Make Friends
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience the thrill of random connections. Our advanced matching algorithm
                        pairs you with people worldwide for instant, high-quality video calls.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to={isLoggedIn ? "/random-chat" : "/register"}>
                            <Button className="px-8 py-4  text-black hover:bg-slate-200 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                <Video className="w-5 h-5" />
                                Start Random Chat
                            </Button>
                        </Link>
                        <Link to={isLoggedIn ? "/chat" : "/login"}>
                            <Button className="px-8 py-4 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 rounded-full text-lg font-semibold transition-all flex items-center gap-2">
                                Chat Dashboard <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Feature Grid - Complete Communication Suite */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Complete Communication Suite</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                                More than just random connections. We provide a fully-featured platform for all your social needs.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Video,
                                title: "Random Video Chat",
                                desc: "Our signature feature. Meet interesting people globally with one click.",
                                color: "text-purple-400",
                                bg: "bg-purple-500/10"
                            },
                            {
                                icon: MessageCircle,
                                title: "Private & Group Chat",
                                desc: "Create unlimited groups or chat 1-on-1. Stay connected with your circle.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10"
                            },
                            {
                                icon: Zap,
                                title: "HD Audio & Video Calls",
                                desc: "Crystal clear voice and video calls for both individuals and groups.",
                                color: "text-yellow-400",
                                bg: "bg-yellow-500/10"
                            },
                            {
                                icon: Heart,
                                title: "Rich Media Sharing",
                                desc: "Share photos, videos, and files seamlessly within your conversations.",
                                color: "text-pink-400",
                                bg: "bg-pink-500/10"
                            },
                            {
                                icon: Globe,
                                title: "Global Connectivity",
                                desc: "Low-latency infrastructure ensures smooth chatting anywhere in the world.",
                                color: "text-cyan-400",
                                bg: "bg-cyan-500/10"
                            },
                            {
                                icon: Shield,
                                title: "Secure & Encrypted",
                                desc: "Your private conversations and calls are protected with top-tier security.",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="p-8 rounded-3xl bg-[#0f0f12] border border-white/5 hover:border-white/10 transition-colors group hover:-translate-y-1 duration-300"
                            >
                                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer Section */}
            <footer className="border-t border-white/5 bg-[#0a0a0c] py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">SocialApp</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-400">
                        <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Safety Guidelines</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        Developed by Manish Keer © 2025
                    </div>
                </div>
            </footer>
        </div>
    );
}
