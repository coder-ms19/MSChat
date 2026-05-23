import api from '../api';

export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalPosts: number;
        totalGroups: number;
        totalMessages: number;
        totalCalls: number;
        bannedUsers: number;
        activeUsers: number;
    };
    recent: {
        newUsers: number;
        newPosts: number;
        newGroups: number;
    };
    topUsers: Array<{
        id: string;
        username: string;
        email: string;
        avatarUrl?: string;
        _count: {
            posts: number;
            messages: number;
            comments: number;
        };
    }>;
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
}

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    role: string;
    provider?: string;
    isOnline: boolean;
    lastSeen?: Date;
    createdAt: Date;
    deletedAt?: Date;
    _count: {
        posts: number;
        followers: number;
        following: number;
        messages: number;
    };
}

export interface Group {
    id: string;
    name?: string;
    iconUrl?: string;
    createdAt: Date;
    owner: {
        id: string;
        username: string;
        email: string;
    };
    _count: {
        users: number;
        messages: number;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class AdminService {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get('/admin/dashboard');
        return response.data;
    }

    /**
     * Get all users with pagination and filters
     */
    async getAllUsers(
        page = 1,
        limit = 20,
        search?: string,
        role?: string,
        status?: 'active' | 'banned'
    ): Promise<{ users: User[]; pagination: any }> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (status) params.append('status', status);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data;
    }

    /**
     * Get user details
     */
    async getUserDetails(userId: string): Promise<any> {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    }

    /**
     * Ban a user
     */
    async banUser(userId: string, reason?: string): Promise<any> {
        const response = await api.post(`/admin/users/${userId}/ban`, { reason });
        return response.data;
    }

    /**
     * Unban a user
     */
    async unbanUser(userId: string): Promise<any> {
        const response = await api.post(`/admin/users/${userId}/unban`);
        return response.data;
    }

    /**
     * Delete a user permanently
     */
    async deleteUser(userId: string): Promise<any> {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    /**
     * Get all groups with pagination
     */
    async getAllGroups(page = 1, limit = 20): Promise<{ groups: Group[]; pagination: any }> {
        const response = await api.get(`/admin/groups?page=${page}&limit=${limit}`);
        return response.data;
    }

    /**
     * Delete a group
     */
    async deleteGroup(groupId: string): Promise<any> {
        const response = await api.delete(`/admin/groups/${groupId}`);
        return response.data;
    }
}

export default new AdminService();
