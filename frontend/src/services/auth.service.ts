import api from '../api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken?: string;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    createdAt: string;
}

class AuthService {
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'user';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            this.setAuthData(response.data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Register a new user
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/register', credentials);
            this.setAuthData(response.data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout the current user
     */
    async logout(): Promise<void> {
        try {
            // Call backend logout endpoint if needed
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
        }
    }

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post<{ accessToken: string }>('/auth/refresh', {
                refreshToken,
            });

            const newToken = response.data.accessToken;
            this.setToken(newToken);
            return newToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuthData();
            return null;
        }
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Set authentication data
     */
    setAuthData(data: AuthResponse): void {
        this.setToken(data.tokens.accessToken);
        this.setUser(data.user);

        if (data.tokens.refreshToken) {
            this.setRefreshToken(data.tokens.refreshToken);
        }
    }

    /**
     * Set auth token
     */
    setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /**
     * Set user data
     */
    setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Set refresh token
     */
    setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    /**
     * Clear all authentication data
     */
    clearAuthData(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        try {
            const response = await api.patch<User>('/users/profile', data);
            this.setUser(response.data);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): Error {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return new Error(message);
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
