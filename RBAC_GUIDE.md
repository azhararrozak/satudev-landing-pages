# Role-Based Access Control (RBAC) Documentation

## Overview

This project implements a Role-Based Access Control (RBAC) system with three roles:

1. **Admin** - Full access to all features
2. **Penulis** (Writer) - Can create and edit own content
3. **User** - Basic user access

## Tech Stack

- **State Management**: Zustand
- **Authentication**: Better Auth
- **Database**: Drizzle ORM + Neon PostgreSQL

## Roles & Permissions

### Admin
- Full access to all routes
- Can manage users
- Can create, edit, and delete all content
- Access to `/dashboard/admin/*` routes

### Penulis (Writer)
- Can create new content
- Can edit own content
- Access to `/dashboard/posts/new` and `/dashboard/posts/edit`
- Cannot access admin routes

### User
- Basic dashboard access
- Cannot create or edit content
- Read-only access

## Usage Examples

### 1. Protecting Routes with Middleware

The middleware automatically protects routes based on authentication and roles:

```typescript
// middleware.ts is already configured
// Admin-only routes: /dashboard/admin/*
// Content creator routes: /dashboard/posts/new, /dashboard/posts/edit
```

### 2. Logout Functionality

#### Using the Logout Hook

```tsx
'use client';

import { useLogout } from '@/lib/hooks/use-logout';

export function MyComponent() {
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

#### Using the LogoutButton Component

```tsx
import { LogoutButton } from '@/components/auth/LogoutButton';

export function MyComponent() {
  return (
    <LogoutButton className="bg-red-600 text-white px-4 py-2 rounded">
      Logout
    </LogoutButton>
  );
}
```

#### Using the UserMenu Component

```tsx
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  return (
    <header>
      <UserMenu /> {/* Includes logout functionality */}
    </header>
  );
}
```

### 3. Using ProtectedRoute Component

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <h1>Admin Dashboard</h1>
      {/* Admin-only content */}
    </ProtectedRoute>
  );
}
```

### 3. Using RoleGuard for Conditional Rendering

```tsx
import { AdminOnly, ContentCreatorOnly, RoleGuard } from '@/components/auth/RoleGuard';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show only to admins */}
      <AdminOnly>
        <button>Manage Users</button>
      </AdminOnly>
      
      {/* Show to content creators (admin and penulis) */}
      <ContentCreatorOnly>
        <button>Create Post</button>
      </ContentCreatorOnly>
      
      {/* Custom role check */}
      <RoleGuard requiredRoles={['admin', 'penulis']}>
        <button>Edit Content</button>
      </RoleGuard>
    </div>
  );
}
```

### 4. Using Auth Hooks

```tsx
'use client';

import { useUser, useRoles } from '@/lib/hooks/use-auth';
import { canCreateContent, canEditContent } from '@/lib/rbac';

export default function MyComponent() {
  const { user, isLoading, isAuthenticated } = useUser();
  const { isAdmin, isPenulis, hasRole, hasAnyRole } = useRoles();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <h2>Welcome, {user?.name}!</h2>
      <p>Your role: {user?.role}</p>
      
      {isAdmin() && <p>You are an admin!</p>}
      {isPenulis() && <p>You are a writer!</p>}
      
      {canCreateContent(user) && (
        <button>Create New Post</button>
      )}
    </div>
  );
}
```

### 5. Using RBAC Utility Functions

```tsx
import { 
  hasRole, 
  hasAnyRole, 
  canCreateContent, 
  canEditContent,
  canDeleteContent,
  getRoleDisplayName,
  getRoleBadgeColor 
} from '@/lib/rbac';

// Check if user has specific role
if (hasRole(user, 'admin')) {
  // Admin-specific logic
}

// Check if user has any of multiple roles
if (hasAnyRole(user, ['admin', 'penulis'])) {
  // Content creator logic
}

// Check permissions
if (canCreateContent(user)) {
  // Show create button
}

if (canEditContent(user, postAuthorId)) {
  // Show edit button
}

// Get role display information
const roleName = getRoleDisplayName(user.role);
const roleColor = getRoleBadgeColor(user.role);
```

### 6. Using Higher-Order Component (HOC)

```tsx
import { withAuth } from '@/components/auth/ProtectedRoute';

function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}

// Wrap with authentication
export default withAuth(AdminDashboard, {
  requiredRole: 'admin',
  fallbackUrl: '/dashboard'
});
```

### 7. Using Zustand Store Directly

```tsx
'use client';

import { useAuthStore } from '@/lib/stores/auth-store';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const handleUpdateProfile = () => {
    updateUser({ name: 'New Name' });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Role: {user?.role}</p>
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Setting User Roles

### During Development

You can manually update user roles in the database:

```sql
-- Make user an admin
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Make user a penulis
UPDATE users SET role = 'penulis' WHERE email = 'writer@example.com';

-- Make user a regular user
UPDATE users SET role = 'user' WHERE email = 'user@example.com';
```

### Via Drizzle Studio

```bash
npm run db:studio
```

Then edit the `role` field in the users table.

## Route Protection Summary

| Route | Public | User | Penulis | Admin |
|-------|--------|------|---------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/auth/signin` | ✅ | ✅ | ✅ | ✅ |
| `/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ❌ | ✅ | ✅ | ✅ |
| `/dashboard/posts/new` | ❌ | ❌ | ✅ | ✅ |
| `/dashboard/posts/edit` | ❌ | ❌ | ✅ | ✅ |
| `/dashboard/admin/*` | ❌ | ❌ | ❌ | ✅ |

## Files Created

- `lib/stores/auth-store.ts` - Zustand store for auth state
- `lib/hooks/use-auth.ts` - Auth hooks
- `lib/rbac.ts` - RBAC utility functions
- `components/auth/ProtectedRoute.tsx` - Route protection component
- `components/auth/RoleGuard.tsx` - Role-based rendering component
- `components/providers/AuthProvider.tsx` - Auth provider component
- `middleware.ts` - Route protection middleware
- `schema/auth-schema.ts` - Updated with role field

## Migration Applied

```sql
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
```

All existing users will have the default role of "user".
