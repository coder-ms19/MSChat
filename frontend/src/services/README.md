# Frontend Services Documentation

This directory contains all the service layer logic for the application. Services encapsulate business logic and API calls, keeping components clean and focused on UI.

## 📁 Service Structure

```
services/
├── auth.service.ts      # Authentication operations
├── oauth.service.ts     # OAuth (Google/GitHub) authentication
├── message.service.ts   # Messaging and conversations
└── index.ts            # Barrel exports
```

## 🔐 AuthService

Handles all authentication-related operations.

### Methods

- **`login(credentials)`** - Login with email/password
- **`register(credentials)`** - Register a new user
- **`logout()`** - Logout current user
- **`refreshToken()`** - Refresh the access token
- **`getCurrentUser()`** - Get current user from localStorage
- **`getToken()`** - Get current auth token
- **`isAuthenticated()`** - Check if user is authenticated
- **`updateProfile(data)`** - Update user profile

### Usage Example

```typescript
import { authService } from '../services';

// Login
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', response.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Get current user
const user = authService.getCurrentUser();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout
await authService.logout();
```

## 🔑 OAuthService

Handles OAuth authentication with Google and GitHub.

### Methods

- **`loginWithGoogle()`** - Initiate Google OAuth flow
- **`loginWithGithub()`** - Initiate GitHub OAuth flow
- **`handleCallback(token, userStr)`** - Handle OAuth callback
- **`isProviderConfigured(provider)`** - Check if OAuth provider is configured
- **`getAvailableProviders()`** - Get list of available OAuth providers

### Usage Example

```typescript
import { oauthService } from '../services';

// Login with Google
const handleGoogleLogin = () => {
  oauthService.loginWithGoogle();
};

// Login with GitHub
const handleGithubLogin = () => {
  oauthService.loginWithGithub();
};

// In OAuth callback page
const token = searchParams.get('token');
const userStr = searchParams.get('user');
await oauthService.handleCallback(token, userStr);
```

### Configuration

Add these environment variables to `.env.development`:

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

## 💬 MessageService

Handles all messaging and conversation operations.

### Methods

- **`getConversations()`** - Get all conversations
- **`getConversation(id)`** - Get specific conversation
- **`getMessages(conversationId, page, limit)`** - Get messages for a conversation
- **`sendMessage(data)`** - Send a message
- **`createConversation(data)`** - Create new conversation
- **`markAsRead(conversationId, messageIds)`** - Mark messages as read
- **`deleteMessage(messageId)`** - Delete a message
- **`editMessage(messageId, content)`** - Edit a message
- **`searchMessages(query, conversationId)`** - Search messages
- **`getUnreadCount()`** - Get unread message count

### Usage Example

```typescript
import { messageService } from '../services';

// Get all conversations
const conversations = await messageService.getConversations();

// Send a message
const message = await messageService.sendMessage({
  content: 'Hello!',
  conversationId: 'conv-123',
  attachments: [file1, file2] // Optional
});

// Get messages with pagination
const messages = await messageService.getMessages('conv-123', 1, 50);

// Create new conversation
const conversation = await messageService.createConversation({
  participantIds: ['user-1', 'user-2'],
  initialMessage: 'Hey there!'
});

// Mark as read
await messageService.markAsRead('conv-123', ['msg-1', 'msg-2']);

// Get unread count
const unreadCount = await messageService.getUnreadCount();
```

## 🎯 Best Practices

### 1. **Always Use Services in Components**

❌ **Don't** make direct API calls in components:
```typescript
// Bad
const response = await api.post('/auth/login', { email, password });
localStorage.setItem('token', response.data.token);
```

✅ **Do** use services:
```typescript
// Good
await authService.login({ email, password });
```

### 2. **Error Handling**

Services throw errors with meaningful messages. Always wrap service calls in try-catch:

```typescript
try {
  await authService.login(credentials);
  navigate('/dashboard');
} catch (error) {
  setError(error.message); // User-friendly error message
}
```

### 3. **Type Safety**

All services are fully typed. Use the exported types:

```typescript
import { authService, type LoginCredentials, type User } from '../services';

const credentials: LoginCredentials = {
  email: 'user@example.com',
  password: 'password123'
};

const user: User = authService.getCurrentUser();
```

### 4. **Singleton Pattern**

Services are exported as singleton instances. Don't create new instances:

```typescript
// Good
import { authService } from '../services';

// Bad
import AuthService from '../services/auth.service';
const authService = new AuthService(); // Don't do this
```

## 🔄 Token Management

The `AuthService` automatically handles token storage and retrieval. The API client (axios instance) automatically attaches the token to requests via interceptors.

### Token Refresh Flow

```typescript
// Automatic token refresh on 401 errors
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const newToken = await authService.refreshToken();
      if (newToken) {
        // Retry the original request
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing Services

Services are designed to be easily testable:

```typescript
import { authService } from '../services';
import api from '../api';

jest.mock('../api');

describe('AuthService', () => {
  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token123' }
      }
    };
    
    (api.post as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(result.user.email).toBe('test@example.com');
    expect(authService.isAuthenticated()).toBe(true);
  });
});
```

## 📦 Adding New Services

To add a new service:

1. Create a new file in `services/` (e.g., `user.service.ts`)
2. Define interfaces for request/response types
3. Create a class with methods
4. Export a singleton instance
5. Add to `services/index.ts` for barrel export

Example:

```typescript
// user.service.ts
import api from '../api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

class UserService {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
```

```typescript
// index.ts
export { userService, type UserProfile } from './user.service';
```

## 🚀 Production Considerations

1. **Error Logging**: Services log errors to console. In production, integrate with error tracking (Sentry, LogRocket, etc.)
2. **Caching**: Consider adding caching for frequently accessed data
3. **Retry Logic**: Add retry logic for failed requests
4. **Rate Limiting**: Handle rate limiting responses appropriately
5. **Security**: Never log sensitive data (passwords, tokens)

## 📚 Related Documentation

- [API Documentation](../api/README.md)
- [Component Guidelines](../components/README.md)
- [Environment Variables](.env.example)
