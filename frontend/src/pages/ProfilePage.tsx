import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Edit2, Mail, Calendar, MessageCircle, ArrowLeft, Upload, Check, X, Loader2 } from 'lucide-react';
import api from '../api';

interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    role: string;
    provider?: string;
    createdAt: string;
    _count?: {
        posts: number;
        followers: number;
        following: number;
    };
}

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ username: '', bio: '' });
    const [uploading, setUploading] = useState(false);
    const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
    const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            const endpoint = id ? `/users/${id}` : '/users/me';
            const res = await api.get(endpoint);
            setUser(res.data);
            setEditData({
                username: res.data.username || '',
                bio: res.data.bio || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.put('/users/me', editData);
            await fetchUserProfile();
            setIsEditing(false);

            // Update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                localStorage.setItem('user', JSON.stringify({ ...parsed, ...editData }));
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setTempAvatarFile(file);
        setTempAvatarUrl(URL.createObjectURL(file));
        setUploadSuccess(false);
    };

    const handleAvatarUpload = async () => {
        if (!tempAvatarFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', tempAvatarFile);

            const res = await api.put('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUser(res.data);
            setTempAvatarFile(null);
            setTempAvatarUrl(null);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);

            // Update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                localStorage.setItem('user', JSON.stringify({ ...parsed, avatarUrl: res.data.avatarUrl }));
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const cancelAvatarPreview = () => {
        setTempAvatarFile(null);
        setTempAvatarUrl(null);
    };

    const isOwnProfile = !id || currentUser?.id === user?.id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">User not found</h2>
                    <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300">
                        Go back home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                >
                    {/* Avatar Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                                {(tempAvatarUrl || user.avatarUrl) ? (
                                    <img
                                        src={tempAvatarUrl || user.avatarUrl}
                                        alt={user.username}
                                        className={`w-full h-full object-cover ${tempAvatarUrl ? 'opacity-50' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            {isOwnProfile && (
                                <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                                    {!tempAvatarUrl ? (
                                        <label className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarSelect}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                            {uploadSuccess ? <Check className="w-5 h-5 text-white" /> : <Camera className="w-5 h-5 text-white" />}
                                        </label>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAvatarUpload}
                                                disabled={uploading}
                                                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
                                            >
                                                <Upload className="w-5 h-5 text-white" />
                                            </button>
                                            <button
                                                onClick={cancelAvatarPreview}
                                                disabled={uploading}
                                                className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-3xl font-bold">{user.username}</h1>
                                {user.provider && user.provider !== 'LOCAL' && (
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                        {user.provider}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-400 mb-4 justify-center md:justify-start">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>

                            {user.bio && (
                                <p className="text-slate-300 mb-4">{user.bio}</p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-slate-400 justify-center md:justify-start">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Stats */}
                            {user._count && (
                                <div className="flex gap-6 mt-6 justify-center md:justify-start">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{user._count.posts}</div>
                                        <div className="text-sm text-slate-400">Posts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{user._count.followers}</div>
                                        <div className="text-sm text-slate-400">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-pink-400">{user._count.following}</div>
                                        <div className="text-sm text-slate-400">Following</div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 justify-center md:justify-start">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/chat`)}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-8 pt-8 border-t border-white/10"
                        >
                            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
