import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Plus, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, Video, FileText, Check } from 'lucide-react';

interface MediaItem {
    id: string;
    file: File;
    previewUrl: string;
    type: 'IMAGE' | 'VIDEO' | 'FILE';
    progress: number;
    uploadData?: any;
}

interface MediaUploadModalProps {
    isOpen: boolean;
    items: MediaItem[];
    onClose: () => void;
    onSend: () => void;
    onRemove: (id: string) => void;
    onAddMore: () => void;
    caption: string;
    onCaptionChange: (val: string) => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
    isOpen,
    items,
    onClose,
    onSend,
    onRemove,
    onAddMore,
    caption,
    onCaptionChange
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!isOpen || items.length === 0) return null;

    const currentItem = items[activeIndex] || items[0];
    const isUploading = items.some(item => item.progress < 100 && item.progress >= 0);
    const allUploaded = items.every(item => item.progress === 100);

    const getFileIcon = (type: string) => {
        if (type === 'IMAGE') return <ImageIcon className="w-6 h-6" />;
        if (type === 'VIDEO') return <Video className="w-6 h-6" />;
        return <FileText className="w-6 h-6" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0a0f] flex flex-col md:inset-4 md:rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-xl border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <span className="text-sm font-bold text-white">{activeIndex + 1} / {items.length}</span>
                        </div>
                        {allUploaded && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                            >
                                <Check size={18} className="text-white" />
                            </motion.div>
                        )}
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Main Preview Area */}
                <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 md:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.id}
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                        >
                            {/* Preview Container */}
                            <div className="relative max-w-full max-h-full">
                                {currentItem.type === 'IMAGE' ? (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                        <img
                                            src={currentItem.previewUrl}
                                            className="relative max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                                            alt="preview"
                                        />
                                    </div>
                                ) : currentItem.type === 'VIDEO' ? (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                        <video
                                            src={currentItem.previewUrl}
                                            controls
                                            className="relative max-w-full max-h-[60vh] md:max-h-[70vh] rounded-2xl shadow-2xl border border-white/10"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-12 md:p-16 rounded-3xl border border-white/20 flex flex-col items-center gap-6 shadow-2xl">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            {getFileIcon(currentItem.type)}
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-white text-lg font-bold">{currentItem.file.name}</p>
                                            <p className="text-slate-400 text-sm">{formatFileSize(currentItem.file.size)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress Overlay */}
                                {currentItem.progress < 100 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{currentItem.progress}%</span>
                                                </div>
                                            </div>
                                            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${currentItem.progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <span className="text-white/80 text-sm">Uploading...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {items.length > 1 && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                                disabled={activeIndex === 0}
                                className="absolute left-4 md:left-8 p-3 bg-black/40 hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-white backdrop-blur-md border border-white/10 shadow-xl transition-all"
                            >
                                <ChevronLeft size={24} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveIndex(prev => Math.min(items.length - 1, prev + 1))}
                                disabled={activeIndex === items.length - 1}
                                className="absolute right-4 md:right-8 p-3 bg-black/40 hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-white backdrop-blur-md border border-white/10 shadow-xl transition-all"
                            >
                                <ChevronRight size={24} />
                            </motion.button>
                        </>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="relative z-10 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-xl p-4 md:p-6 flex flex-col gap-4 border-t border-white/10">
                    {/* Caption Input */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3 shadow-lg">
                        <input
                            type="text"
                            placeholder="Add a caption..."
                            className="bg-transparent border-none outline-none text-white w-full text-sm md:text-base placeholder-slate-400"
                            value={caption}
                            onChange={(e) => onCaptionChange(e.target.value)}
                        />
                    </div>

                    {/* Thumbnails and Send */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Thumbnails */}
                        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${activeIndex === idx
                                            ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/30'
                                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                                        }`}
                                >
                                    {item.type === 'IMAGE' || item.type === 'VIDEO' ? (
                                        <img src={item.previewUrl} className="w-full h-full object-cover" alt="thumb" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                                            {getFileIcon(item.type)}
                                        </div>
                                    )}

                                    {/* Progress Indicator */}
                                    {item.progress < 100 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="text-white text-xs font-bold">{item.progress}%</div>
                                        </div>
                                    )}

                                    {/* Success Checkmark */}
                                    {item.progress === 100 && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(item.id);
                                            if (activeIndex >= items.length - 1) setActiveIndex(Math.max(0, items.length - 2));
                                        }}
                                        className="absolute top-1 left-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            ))}

                            {/* Add More Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onAddMore}
                                className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-white/50 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-md"
                            >
                                <Plus size={24} />
                            </motion.button>
                        </div>

                        {/* Send Button */}
                        <motion.button
                            whileHover={{ scale: isUploading ? 1 : 1.05 }}
                            whileTap={{ scale: isUploading ? 1 : 0.95 }}
                            onClick={onSend}
                            disabled={isUploading}
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${isUploading
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-600/50'
                                }`}
                        >
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 md:w-7 md:h-7 text-white animate-spin" />
                            ) : (
                                <Send className="w-6 h-6 md:w-7 md:h-7 text-white ml-1" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
