import { authService, type AuthResponse } from './auth.service';

export type OAuthProvider = 'google' | 'github';

export interface OAuthConfig {
    google: {
        clientId: string;
        redirectUri: string;
        authUrl: string;
    };
    github: {
        clientId: string;
        redirectUri: string;
        authUrl: string;
    };
}

class OAuthService {
    private readonly API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    /**
     * Get OAuth configuration from environment variables
     */
    private getConfig(): OAuthConfig {
        return {
            google: {
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
                authUrl: `${this.API_URL}/auth/google`,
            },
            github: {
                clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
                redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`,
                authUrl: `${this.API_URL}/auth/github`,
            },
        };
    }

    /**
     * Initiate OAuth login flow
     */
    loginWithProvider(provider: OAuthProvider): void {
        const config = this.getConfig();
        const authUrl = config[provider].authUrl;

        // Store the provider in sessionStorage for callback handling
        sessionStorage.setItem('oauth_provider', provider);

        // Redirect to backend OAuth endpoint
        window.location.href = authUrl;
    }

    /**
     * Login with Google
     */
    loginWithGoogle(): void {
        this.loginWithProvider('google');
    }

    /**
     * Login with GitHub
     */
    loginWithGithub(): void {
        this.loginWithProvider('github');
    }

    /**
     * Handle OAuth callback
     * This should be called from the callback page
     */
    async handleCallback(token: string, userStr: string): Promise<AuthResponse> {
        try {
            // Parse user data
            const user = JSON.parse(decodeURIComponent(userStr));

            // Create auth response object
            const authResponse: AuthResponse = {
                user,
                tokens: {
                    accessToken: token,
                },
            };

            // Store auth data using AuthService
            authService.setAuthData(authResponse);

            // Clear OAuth provider from sessionStorage
            sessionStorage.removeItem('oauth_provider');

            return authResponse;
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
            throw new Error('Failed to process OAuth callback');
        }
    }

    /**
     * Get the OAuth provider from sessionStorage
     */
    getStoredProvider(): OAuthProvider | null {
        return sessionStorage.getItem('oauth_provider') as OAuthProvider | null;
    }

    /**
     * Check if OAuth is configured for a provider
     */
    isProviderConfigured(provider: OAuthProvider): boolean {
        const config = this.getConfig();
        return !!config[provider].clientId;
    }

    /**
     * Get available OAuth providers
     */
    getAvailableProviders(): OAuthProvider[] {
        const providers: OAuthProvider[] = [];

        if (this.isProviderConfigured('google')) {
            providers.push('google');
        }

        if (this.isProviderConfigured('github')) {
            providers.push('github');
        }

        return providers;
    }
}

// Export singleton instance
export const oauthService = new OAuthService();
export default oauthService;
