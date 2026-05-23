// Export all services from a single entry point
export { authService, type AuthResponse, type User, type LoginCredentials, type RegisterCredentials } from './auth.service';
export { oauthService, type OAuthProvider, type OAuthConfig } from './oauth.service';
export { messageService, type Message, type Conversation, type SendMessageData, type CreateConversationData } from './message.service';
export { default as adminService } from './admin.service';
export type { DashboardStats, User as AdminUser, Group } from './admin.service';

