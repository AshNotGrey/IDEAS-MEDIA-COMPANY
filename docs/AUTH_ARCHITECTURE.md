# Authentication Architecture

## Overview

This admin client uses a **REST-only approach for authentication** and **lazy-loaded GraphQL for data operations**. This separation provides better security, easier testing, cleaner code organization, and **zero background requests** until GraphQL is actually needed.

## Architecture Components

### 1. Authentication (REST Only)
- **Login/Logout**: `/api/auth/login`, `/api/auth/logout`
- **Token Refresh**: `/api/auth/refresh`
- **Session Management**: `/api/auth/sessions/*`
- **Admin Registration**: `/api/auth/register`
- **Admin Verification**: `/api/auth/verify`
- **Invite Management**: `/api/auth/invites`

### 2. Data Operations (GraphQL - Lazy Loaded)
- User management
- Analytics and reporting
- Service management
- Campaign management
- Media library operations

**Note**: GraphQL is now completely lazy-loaded and will not make any background requests until explicitly used.

## Key Files

### Authentication Service
- `src/services/authService.js` - REST API calls for auth operations
- `src/hooks/useAdminAuth.js` - React hook for auth state management
- `src/utils/graphqlAuth.js` - Utilities for GraphQL auth headers

### GraphQL Utilities
- `src/utils/apolloProvider.js` - Dynamic Apollo Client provider
- `src/graphql/client.js` - Apollo Client configuration (only loaded when needed)

### Components
- `src/components/auth/AdminLogin.jsx` - Login form
- `src/components/auth/AdminRegistration.jsx` - Registration form
- `src/components/auth/SessionManagement.jsx` - Session management
- `src/components/auth/AdminVerification.jsx` - Admin verification

## Authentication Flow

### 1. Login Process
```javascript
// User submits credentials
const result = await login({
  username: "admin",
  password: "password",
  deviceInfo: { deviceId, platform, browser },
  rememberMe: true
});

// On success, tokens are stored in localStorage
// User is redirected to dashboard
```

### 2. Token Management
- **Access Token**: Short-lived (1 day), stored in localStorage
- **Refresh Token**: Long-lived (7 days), stored in localStorage
- **Auto-refresh**: Token is refreshed 5 minutes before expiration
- **Session tracking**: Device-specific session management

### 3. Session Management
- Multiple device sessions supported
- Device fingerprinting for security
- Session revocation capabilities
- Remember me functionality

## GraphQL Integration (When Needed)

### Option 1: Dynamic Provider
```javascript
// In your main App.jsx when you need GraphQL
import { DynamicApolloProvider } from './utils/apolloProvider';

function App() {
  return (
    <DynamicApolloProvider>
      <YourAppContent />
    </DynamicApolloProvider>
  );
}
```

### Option 2: Manual Initialization
```javascript
// In any component where you need GraphQL
import { initializeApollo } from './utils/apolloProvider';

function MyComponent() {
  const [apolloReady, setApolloReady] = useState(false);

  useEffect(() => {
    initializeApollo().then(() => {
      setApolloReady(true);
    });
  }, []);

  if (!apolloReady) {
    return <div>Loading GraphQL...</div>;
  }

  // Now you can use GraphQL hooks
  return <GraphQLComponent />;
}
```

## Security Features

### 1. Token Security
- JWT tokens with proper expiration
- Refresh token rotation
- Device-specific session tracking
- Automatic logout on token expiration

### 2. Rate Limiting
- Login attempts limited
- Refresh token requests limited
- Invite creation limited

### 3. Account Protection
- Account lockout after failed attempts
- Account deactivation support
- Admin verification workflow
- Permission-based access control

## Performance Benefits

### No Background Requests
- **Before**: Apollo Client made requests every 5 seconds
- **After**: No requests until GraphQL is explicitly used

### Lazy Loading
- **Before**: GraphQL client loaded on app start
- **After**: GraphQL client only loads when needed

### Memory Usage
- **Before**: Apollo cache always active
- **After**: Apollo cache only active during GraphQL usage

## Usage Examples

### Basic Authentication
```javascript
import { useAdminAuth } from '../hooks/useAdminAuth';

function MyComponent() {
  const { admin, isAuthenticated, login, logout } = useAdminAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {admin.username}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls
```javascript
import authService from '../services/authService';

// Get current user
const user = await authService.getCurrentUser(token);

// Get sessions
const sessions = await authService.getSessions(token);

// Revoke a session
await authService.revokeSession(token, sessionId);
```

### GraphQL with Authentication (When Needed)
```javascript
import { getAuthHeaders } from '../utils/graphqlAuth';

// When making GraphQL calls that need auth
const headers = getAuthHeaders();
// Use headers in your GraphQL client configuration
```

## Error Handling

### Login Errors
- `Invalid credentials` - Username/password incorrect
- `Account deactivated` - Account disabled by admin
- `Account locked` - Too many failed attempts
- `Admin not verified` - Account pending verification
- `Admin access required` - Insufficient privileges
- `Too Many Requests` - Rate limit exceeded

### Registration Errors
- `Username already taken` - Username exists
- `Invalid invite code` - Code expired or invalid
- `Verifier not found` - Verifier admin doesn't exist

## Configuration

### Environment Variables
```bash
VITE_API_URL=http://localhost:4001/api
VITE_GRAPHQL_ENDPOINT=http://localhost:4001/admin-graphql
```

### Token Expiration
```bash
JWT_EXPIRES_IN=1d          # Access token (1 day)
JWT_REFRESH_EXPIRES_IN=7d  # Refresh token (7 days)
```

## Best Practices

### 1. Security
- Never store sensitive data in localStorage
- Always validate tokens on the server
- Use HTTPS in production
- Implement proper CSRF protection

### 2. User Experience
- Show loading states during auth operations
- Provide clear error messages
- Auto-refresh tokens before expiration
- Remember user preferences

### 3. Development
- Use environment variables for configuration
- Implement proper error boundaries
- Add comprehensive logging
- Write unit tests for auth logic

### 4. GraphQL Usage
- Only initialize Apollo Client when needed
- Use DynamicApolloProvider for app-wide GraphQL
- Use manual initialization for component-specific GraphQL
- Always check authentication before GraphQL operations

## Troubleshooting

### Common Issues

1. **Token not refreshing**
   - Check localStorage for refresh token
   - Verify server refresh endpoint
   - Check network requests

2. **Session not persisting**
   - Verify localStorage permissions
   - Check token expiration
   - Validate session data

3. **GraphQL auth errors**
   - Ensure proper auth headers
   - Check token validity
   - Verify GraphQL endpoint

4. **Background requests still happening**
   - Ensure ApolloProvider is not wrapping your app
   - Check that DynamicApolloProvider is used instead
   - Verify no components are importing Apollo hooks

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'auth:*');
```

## Migration Notes

### From GraphQL Auth
- Remove Apollo auth links
- Update auth service calls
- Remove GraphQL auth mutations
- Update error handling

### From Mixed Auth
- Standardize on REST for auth
- Keep GraphQL for data only
- Update component imports
- Test all auth flows

### From Always-On Apollo
- Remove ApolloProvider from main.jsx
- Use DynamicApolloProvider when GraphQL is needed
- Verify no background requests are happening
- Test that GraphQL still works when explicitly used

## Current Status

- ✅ **Authentication**: Fully REST-based, working correctly
- ✅ **No Background Requests**: Apollo Client completely disabled until needed
- ✅ **Lazy Loading**: GraphQL only loads when explicitly used
- ✅ **Clean Architecture**: Clear separation between auth and data operations
- ✅ **Performance**: Zero overhead until GraphQL is needed

This architecture provides the best of both worlds: secure, fast authentication with zero background overhead, and powerful GraphQL capabilities when you need them.
