import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Check, AlertTriangle, Reply, ChevronDown, Download, FileText } from 'lucide-react';
import { ReadReceipt } from './ReadReceipt';
import Avatar from '../ui/Avatar';
import api from '../../api';
import { MediaModal } from './MediaModal';

interface MessageBubbleProps {
    message: any;
    isMe: boolean;
    isGroup: boolean;
    onUpdate: () => void;
    onReply: (message: any) => void;
    previousMessage?: any;
    showSenderInfo?: boolean;
    status?: 'sent' | 'delivered' | 'read';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMe,
    isGroup,
    onUpdate,
    onReply,
    showSenderInfo = true,
    status = 'sent'
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<any | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.content);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.post(`/conversations/messages/${message.id}/delete`, { userId: message.senderId });
            setShowDeleteModal(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to delete message');
        }
    };

    const handleEdit = async () => {
        if (editText.trim() === message.content) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        try {
            await api.post(`/conversations/messages/${message.id}/edit`, {
                userId: message.senderId,
                text: editText
            });
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to edit message');
        } finally {
            setLoading(false);
        }
    };

    const senderName = message.sender?.username || 'Unknown';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group ${showSenderInfo ? 'mb-3 md:mb-3' : 'mb-1'
                    }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Responsive max-width: 85% mobile, 70% tablet, 60% desktop, 55% large */}
                <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[55%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for other users in group - only show when sender changes */}
                    {!isMe && isGroup && showSenderInfo && (
                        <Avatar
                            src={message.sender?.avatarUrl}
                            alt={senderName}
                            size="sm"
                            className="flex-shrink-0 ring-2 ring-white/10 shadow-md"
                        />
                    )}

                    {/* Spacer when avatar is hidden (grouped messages) */}
                    {!isMe && isGroup && !showSenderInfo && (
                        <div className="flex-shrink-0 w-8 h-8" />
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Sender Name in Group - only show when sender changes */}
                        {!isMe && isGroup && showSenderInfo && (
                            <span className="text-xs font-semibold text-indigo-400 mb-1 ml-0.5 tracking-wide">
                                {senderName}
                            </span>
                        )}

                        <div className="relative">
                            {/* Message Bubble - Professional color system */}
                            <div
                                className={`
                                    shadow-md relative transition-all duration-200
                                    px-3 py-2 md:px-3.5 md:py-2.5 lg:px-4 lg:py-3 group
                                    ${isMe
                                        ? 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white rounded-[16px] md:rounded-[18px] rounded-tr-md shadow-blue-600/20'
                                        : 'bg-[#1e293b]/95 text-slate-100 border border-white/10 rounded-[16px] md:rounded-[18px] rounded-tl-md backdrop-blur-sm'
                                    }
                                    ${isHovered ? 'shadow-lg' : ''}
                                `}
                            >
                                {/* WhatsApp Style Menu Button */}
                                <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className={`p-1 rounded-full ${isMe ? 'hover:bg-white/10' : 'hover:bg-white/10'} text-white/70`}
                                    >
                                        <ChevronDown size={16} />
                                    </button>

                                    {/* Action Menu */}
                                    <AnimatePresence>
                                        {showMenu && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setShowMenu(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className={`absolute top-full right-0 mt-1 w-32 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden py-1`}
                                                >
                                                    <button
                                                        onClick={() => { onReply(message); setShowMenu(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                                                    >
                                                        <Reply size={14} /> Reply
                                                    </button>
                                                    {isMe && (
                                                        <>
                                                            <button
                                                                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-400 hover:bg-white/5 transition-colors"
                                                            >
                                                                <Pencil size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(); setShowMenu(false); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Reply Header in Bubble */}
                                {message.replyTo && (
                                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 min-w-[120px] ${isMe ? 'bg-black/20 border-white/30 text-white/80' : 'bg-white/5 border-blue-500/50 text-slate-400'
                                        }`}>
                                        <p className="font-bold mb-0.5">{message.replyTo.sender?.username}</p>
                                        <p className="truncate line-clamp-1">{message.replyTo.content}</p>
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[180px] md:min-w-[200px]">
                                        <textarea
                                            className="bg-black/20 text-white text-sm md:text-base rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-white/30 transition-colors resize-none touch-manipulation"
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            autoFocus
                                            rows={3}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleEdit();
                                                }
                                                if (e.key === 'Escape') {
                                                    setIsEditing(false);
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="p-1.5 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
                                                title="Cancel"
                                            >
                                                <X size={14} />
                                            </button>
                                            <button
                                                onClick={handleEdit}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-white/10 active:bg-white/20 rounded-lg text-green-400 transition-colors disabled:opacity-50 touch-manipulation"
                                                title="Save"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="flex flex-col gap-2 mb-2">
                                                {message.attachments.map((att: any) => (
                                                    att.type === 'IMAGE' ? (
                                                        <img
                                                            key={att.id}
                                                            src={att.url}
                                                            alt="attachment"
                                                            className="max-w-[300px] w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => setPreviewMedia({ url: att.url, type: 'IMAGE', name: att.originalName })}
                                                        />
                                                    ) : att.type === 'VIDEO' ? (
                                                        <div key={att.id} className="relative group/vid cursor-pointer max-w-[300px] w-full rounded-lg overflow-hidden shadow-lg bg-black/20" onClick={() => setPreviewMedia({ url: att.url, type: 'VIDEO', name: att.originalName })}>
                                                            <video
                                                                src={att.url}
                                                                className="w-full pointer-events-none"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                                                                    <div className="border-t-8 border-b-8 border-l-[12px] border-transparent border-l-white ml-1" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <a
                                                            key={att.id}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                                                }`}
                                                        >
                                                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold truncate leading-tight">Attachment</p>
                                                                <p className="text-[10px] opacity-60 uppercase tracking-widest">{att.mimeType?.split('/')[1] || 'FILE'}</p>
                                                            </div>
                                                            <Download size={16} className="opacity-40" />
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-sm md:text-[15px] leading-normal whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Timestamp with Read Receipt - Professional colors */}
                        <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'text-white/70' : 'text-slate-500'}`}>
                            <span className="text-[10px]">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <ReadReceipt status={status} />}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Message?</h3>
                                    <p className="text-sm text-slate-400">This cannot be undone</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6">
                                <p className="text-sm text-slate-300 line-clamp-3">{message.content}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg shadow-red-600/30"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Image/Video Preview Modal */}
            <MediaModal
                isOpen={!!previewMedia}
                onClose={() => setPreviewMedia(null)}
                media={previewMedia}
            />
        </>
    );
};
