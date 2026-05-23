import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090A] p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 leading-none select-none animate-gradient">
                        404
                    </h1>
                    <div className="absolute inset-0 blur-3xl opacity-30">
                        <h1 className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 leading-none">
                            404
                        </h1>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-lg text-slate-400 max-w-md mx-auto">
                        The page you're looking for seems to have wandered off into the digital void.
                        Let's get you back on track!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105">
                            Go to Home
                        </Button>
                    </Link>
                    <Link to="/chat">
                        <Button
                            variant="secondary"
                            className="px-8 py-3 rounded-xl border-2 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105"
                        >
                            Go to Chat
                        </Button>
                    </Link>
                </div>

                {/* Decorative elements */}
                <div className="mt-16 flex justify-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}
