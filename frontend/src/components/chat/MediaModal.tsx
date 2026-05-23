import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface MediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    media: { url: string; type: string; name?: string } | null;
}

export const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, media }) => {
    if (!media) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-[#0a0f1e]/80 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12 lg:p-20"
                    onClick={onClose}
                >
                    {/* Floating Close Button - Top Right */}
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl text-white transition-all z-[120] hover:scale-110 active:scale-95 shadow-2xl"
                    >
                        <X size={24} />
                    </motion.button>

                    {/* Floating Download Button - Top Right (Next to close) */}
                    <motion.a
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        href={media.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-6 right-20 p-3 bg-blue-600/20 hover:bg-blue-600/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl text-blue-400 transition-all z-[120] hover:scale-110 active:scale-95 shadow-2xl"
                        title="Download Original"
                    >
                        <Download size={22} />
                    </motion.a>

                    {/* Media Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, rotateX: -10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full h-full flex items-center justify-center pointer-events-none"
                    >
                        <div
                            className="bg-[#1e293b]/40 backdrop-blur-sm p-2 rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] max-w-full max-h-full flex items-center justify-center overflow-hidden pointer-events-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {media.type === 'IMAGE' || media.type.startsWith('image/') ? (
                                <img
                                    src={media.url}
                                    alt="Preview"
                                    className="max-w-full max-h-[80vh] object-contain rounded-3xl"
                                />
                            ) : media.type === 'VIDEO' || media.type.startsWith('video/') ? (
                                <div className="relative w-full max-h-[80vh] aspect-video">
                                    <video
                                        src={media.url}
                                        controls
                                        autoPlay
                                        className="w-full h-full rounded-3xl"
                                    />
                                </div>
                            ) : (
                                <div className="p-12 md:p-20 flex flex-col items-center gap-6 text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                        <Download size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white text-xl font-bold tracking-tight">Document Preview</p>
                                        <p className="text-slate-400 text-sm max-w-xs">{media.name || 'Untitled File'}</p>
                                    </div>
                                    <a
                                        href={media.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-2xl text-white font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                    >
                                        Download to view
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Info Footer - Centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full text-slate-300 text-xs font-medium tracking-widest uppercase"
                    >
                        Click space outside to close
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
