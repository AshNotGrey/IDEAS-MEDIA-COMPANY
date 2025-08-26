# Using GraphQL for Data Operations

## Overview

While authentication is handled entirely through REST APIs, GraphQL is available for data operations that require it. **GraphQL is now lazy-loaded and will not make any background requests until explicitly used.**

## When to Use GraphQL

- **Data Queries**: Complex data fetching, analytics, reporting
- **Data Mutations**: Creating, updating, deleting business data
- **Real-time Updates**: Subscriptions for live data
- **Complex Relationships**: Joining multiple data types

## When NOT to Use GraphQL

- **Authentication**: Login, logout, token refresh
- **Session Management**: Managing user sessions
- **User Management**: Admin account operations
- **Security Operations**: Access control, permissions

## Setup (When You Need GraphQL)

### Option 1: Dynamic Provider (Recommended)

```javascript
// In your main App.jsx or when you need GraphQL
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

## Basic Usage

### 1. Simple Query (No Auth Required)

```javascript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      name
      category
      price
    }
  }
`;

function ServicesList() {
  const { data, loading, error } = useQuery(GET_SERVICES);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.services.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  );
}
```

### 2. Authenticated Query

```javascript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAdminAuth } from '../hooks/useAdminAuth';

const GET_USER_DATA = gql`
  query GetUserData($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      bookings {
        id
        serviceType
        scheduledDate
      }
    }
  }
`;

function UserProfile({ userId }) {
  const { isAuthenticated } = useAdminAuth();
  
  const { data, loading, error } = useQuery(GET_USER_DATA, {
    variables: { userId },
    skip: !isAuthenticated, // Skip query if not authenticated
  });
  
  if (!isAuthenticated) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>{data.user.name}</h2>
      <p>{data.user.email}</p>
      {/* ... rest of component */}
    </div>
  );
}
```

### 3. Mutation with Auth Check

```javascript
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAdminAuth } from '../hooks/useAdminAuth';

const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: ServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      category
      price
    }
  }
`;

function EditService({ serviceId }) {
  const { isAuthenticated, admin } = useAdminAuth();
  const [updateService, { loading }] = useMutation(UPDATE_SERVICE);
  
  const handleSubmit = async (formData) => {
    if (!isAuthenticated) {
      alert('Please log in to perform this action');
      return;
    }
    
    try {
      const result = await updateService({
        variables: {
          id: serviceId,
          input: formData
        }
      });
      
      console.log('Service updated:', result.data.updateService);
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };
  
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Service'}
      </button>
    </form>
  );
}
```

## Error Handling

### Authentication Errors

```javascript
import { useQuery } from '@apollo/client';
import { useAdminAuth } from '../hooks/useAdminAuth';

function ProtectedComponent() {
  const { isAuthenticated, logout } = useAdminAuth();
  
  const { data, loading, error } = useQuery(GET_PROTECTED_DATA, {
    skip: !isAuthenticated,
    onError: (error) => {
      if (error.message.includes('Authentication required') ||
          error.message.includes('Invalid token')) {
        logout(); // Redirect to login
      }
    }
  });
  
  // ... rest of component
}
```

### Network Errors

```javascript
const { data, loading, error } = useQuery(GET_DATA, {
  onError: (error) => {
    if (error.networkError) {
      console.error('Network error:', error.networkError);
      // Handle network issues
    } else if (error.graphQLErrors) {
      error.graphQLErrors.forEach(err => {
        console.error('GraphQL error:', err.message);
      });
    }
  }
});
```

## Best Practices

### 1. Always Check Authentication

```javascript
// ✅ Good
const { data } = useQuery(GET_DATA, {
  skip: !isAuthenticated,
});

// ❌ Bad - Will fail if not authenticated
const { data } = useQuery(GET_DATA);
```

### 2. Use Skip Option

```javascript
// Skip queries when not authenticated
const { data } = useQuery(GET_DATA, {
  skip: !isAuthenticated || !userId,
  variables: { userId }
});
```

### 3. Handle Loading States

```javascript
if (!isAuthenticated) return <LoginPrompt />;
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 4. Use Error Boundaries

```javascript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Migration from Mixed Auth

If you're migrating from a mixed authentication system:

1. **Remove Auth from GraphQL**: Don't use GraphQL for login/logout
2. **Keep Data Operations**: Use GraphQL for business data
3. **Update Components**: Add authentication checks
4. **Test Thoroughly**: Ensure auth flows work correctly

## Troubleshooting

### Common Issues

1. **"Apollo Client not found"**
   - Ensure DynamicApolloProvider is wrapping your app
   - Check import statements

2. **Authentication errors in GraphQL**
   - Verify you're not using GraphQL for auth
   - Check authentication state before queries

3. **Network errors**
   - Verify GraphQL endpoint is correct
   - Check server is running

### Debug Mode

Enable Apollo Client debugging:

```javascript
// In your browser console
localStorage.setItem('apollo-devtools-global', 'true');
```

## Example: Complete Component

```javascript
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAdminAuth } from '../hooks/useAdminAuth';

const GET_USERS = gql`
  query GetUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      email
      role
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
    }
  }
`;

function UsersList() {
  const { isAuthenticated, admin } = useAdminAuth();
  
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: { limit: 10 },
    skip: !isAuthenticated,
  });
  
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      refetch(); // Refresh data after update
    },
  });
  
  if (!isAuthenticated) {
    return <div>Please log in to view users</div>;
  }
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser({
        variables: { id: userId, input: userData }
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };
  
  return (
    <div>
      <h2>Users ({data.users.length})</h2>
      {data.users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button 
            onClick={() => handleUpdateUser(user.id, { role: 'admin' })}
            disabled={updating}
          >
            Make Admin
          </button>
        </div>
      ))}
    </div>
  );
}

export default UsersList;
```

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

This approach keeps your authentication system clean and secure while allowing you to use GraphQL for complex data operations when needed, with zero background overhead.
