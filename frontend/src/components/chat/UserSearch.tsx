import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

interface UserSearchProps {
    onStartChat: (userId: string) => void;
    currentUserId: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onStartChat, currentUserId }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data.filter((u: any) => u.id !== currentUserId));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-white">
            <div className="p-4 border-b border-[#334155]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        className="w-full bg-[#0f172a] text-white border border-[#334155] rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 text-sm"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading ? (
                    <div className="text-center text-gray-500 py-4">Loading users...</div>
                ) : (
                    filteredUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onStartChat(user.id)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#334155] cursor-pointer group transition-colors"
                            role="button"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    size="md"
                                    className="ring-2 ring-white/10"
                                />
                                <div>
                                    <h3 className="font-medium text-white group-hover:text-blue-200 transition-colors">{user.username}</h3>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="p-2 rounded-full bg-[#0f172a] text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-900/30 transition-all">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                        </motion.div>
                    ))
                )}
                {!loading && filteredUsers.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No users found</div>
                )}
            </div>
        </div>
    );
};
