import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, type DashboardStats, type AdminUser, type Group } from '../services';
import Navbar from '../components/layout/Navbar';
import {
    Users,
    MessageSquare,
    UserX,
    UserCheck,
    TrendingUp,
    Activity,
    Trash2,
    Ban,
    Shield,
    Search,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups'>('dashboard');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'banned' | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [user, setUser] = useState<any>(null);

    // Check if user is admin
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            if (userData.role !== 'ADMIN') {
                navigate('/');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Load dashboard stats
    useEffect(() => {
        if (activeTab === 'dashboard') {
            loadDashboardStats();
        } else if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'groups') {
            loadGroups();
        }
    }, [activeTab, currentPage, searchTerm, roleFilter, statusFilter]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers(
                currentPage,
                20,
                searchTerm || undefined,
                roleFilter || undefined,
                statusFilter || undefined
            );
            setUsers(response.users);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadGroups = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllGroups(currentPage, 20);
            setGroups(response.groups);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!confirm('Are you sure you want to ban this user?')) return;
        try {
            await adminService.banUser(userId);
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to ban user');
        }
    };

    const handleUnbanUser = async (userId: string) => {
        try {
            await adminService.unbanUser(userId);
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to unban user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone!')) return;
        try {
            await adminService.deleteUser(userId);
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this group?')) return;
        try {
            await adminService.deleteGroup(groupId);
            loadGroups();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete group');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-2">{value.toLocaleString()}</h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050508]">
            <Navbar user={user} isLoggedIn={true} onLogout={handleLogout} />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-purple-500" />
                        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-400">Manage users, groups, and monitor platform statistics</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-800">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: Activity },
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'groups', label: 'Groups', icon: MessageSquare },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setCurrentPage(1);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${activeTab === tab.id
                                ? 'text-purple-500 border-purple-500'
                                : 'text-gray-400 border-transparent hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-8">
                        {/* Overview Stats */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon={Users}
                                    title="Total Users"
                                    value={stats.overview.totalUsers}
                                    subtitle={`${stats.overview.activeUsers} active`}
                                    color="from-blue-500 to-blue-600"
                                />
                                <StatCard
                                    icon={MessageSquare}
                                    title="Total Posts"
                                    value={stats.overview.totalPosts}
                                    subtitle={`${stats.recent.newPosts} this week`}
                                    color="from-green-500 to-green-600"
                                />
                                <StatCard
                                    icon={Users}
                                    title="Total Groups"
                                    value={stats.overview.totalGroups}
                                    subtitle={`${stats.recent.newGroups} this week`}
                                    color="from-purple-500 to-purple-600"
                                />
                                <StatCard
                                    icon={UserX}
                                    title="Banned Users"
                                    value={stats.overview.bannedUsers}
                                    color="from-red-500 to-red-600"
                                />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity (Last 7 Days)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UserCheck className="w-5 h-5 text-blue-500" />
                                        <p className="text-gray-400 text-sm font-medium">New Users</p>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.recent.newUsers}</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        <p className="text-gray-400 text-sm font-medium">New Posts</p>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.recent.newPosts}</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MessageSquare className="w-5 h-5 text-purple-500" />
                                        <p className="text-gray-400 text-sm font-medium">New Groups</p>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.recent.newGroups}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Users */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Top Active Users</h2>
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-900/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Posts</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Messages</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {stats.topUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`}
                                                                alt={user.username}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                            <div>
                                                                <p className="text-white font-medium">{user.username}</p>
                                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">{user._count.posts}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">{user._count.messages}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">{user._count.comments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as any);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setRoleFilter('');
                                        setStatusFilter('');
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-900/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stats</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`}
                                                                alt={user.username}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                            <div>
                                                                <p className="text-white font-medium">{user.username}</p>
                                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {user.deletedAt ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                                                Banned
                                                            </span>
                                                        ) : user.isOnline ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                                Online
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                                                Offline
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-400">
                                                            <p>{user._count.posts} posts</p>
                                                            <p>{user._count.followers} followers</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {user.deletedAt ? (
                                                                <button
                                                                    onClick={() => handleUnbanUser(user.id)}
                                                                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                                                    title="Unban user"
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBanUser(user.id)}
                                                                    className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                                                                    title="Ban user"
                                                                    disabled={user.role === 'ADMIN'}
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                                                title="Delete user permanently"
                                                                disabled={user.role === 'ADMIN'}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-white px-4">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Groups Tab */}
                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-900/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Group</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Members</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Messages</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {groups.map((group) => (
                                                <tr key={group.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={group.iconUrl || `https://ui-avatars.com/api/?name=${group.name || 'Group'}`}
                                                                alt={group.name || 'Group'}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                            <p className="text-white font-medium">{group.name || 'Unnamed Group'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                        {group.owner.username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">
                                                        {group._count.users}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">
                                                        {group._count.messages}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                        {new Date(group.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleDeleteGroup(group.id)}
                                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                                            title="Delete group"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-white px-4">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
