# RBAC Quick Reference

## Quick Import Guide

```tsx
// Auth Hooks
import { useUser, useSession, useRoles } from '@/lib/hooks/use-auth';
import { useLogout } from '@/lib/hooks/use-logout';

// Auth Components
import { LogoutButton } from '@/components/auth/LogoutButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { UserInfo, UserRoleBadge } from '@/components/auth/UserRoleBadge';

// Role Guards (Components)
import { AdminOnly, PenulisOnly, ContentCreatorOnly, RoleGuard } from '@/components/auth/RoleGuard';

// Route Protection
import { ProtectedRoute, withAuth } from '@/components/auth/ProtectedRoute';

// RBAC Utilities
import { 
  hasRole, 
  canCreateContent, 
  canEditContent, 
  canDeleteContent 
} from '@/lib/rbac';

// Zustand Store
import { useAuthStore } from '@/lib/stores/auth-store';
```

## Common Patterns

### 1. Logout

```tsx
// Using hook
const { handleLogout, isLoggingOut } = useLogout();

// Using component
<LogoutButton>Logout</LogoutButton>

// Using UserMenu (includes logout)
<UserMenu />
```

### 2. Check User Role in Component
```tsx
const { user } = useUser();
const { isAdmin, isPenulis } = useRoles();

if (isAdmin()) {
  // Admin logic
}
```

### 2. Show/Hide Elements by Role
```tsx
<AdminOnly>
  <button>Admin Button</button>
</AdminOnly>

<RoleGuard requiredRoles={['admin', 'penulis']}>
  <button>Create Post</button>
</RoleGuard>
```

### 3. Protect Entire Page
```tsx
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Content</div>
    </ProtectedRoute>
  );
}
```

### 4. Protect with HOC
```tsx
function MyPage() {
  return <div>Protected Content</div>;
}

export default withAuth(MyPage, { requiredRole: 'admin' });
```

### 5. Check Permissions
```tsx
import { canEditContent } from '@/lib/rbac';

if (canEditContent(user, postAuthorId)) {
  // Show edit button
}
```

## Available Roles

| Role | Value | Description |
|------|-------|-------------|
| Admin | `'admin'` | Full access |
| Penulis | `'penulis'` | Content creator |
| User | `'user'` | Basic access |

## Permission Matrix

| Permission | Admin | Penulis | User |
|------------|-------|---------|------|
| View Dashboard | ✅ | ✅ | ✅ |
| Create Content | ✅ | ✅ | ❌ |
| Edit Own Content | ✅ | ✅ | ❌ |
| Edit All Content | ✅ | ❌ | ❌ |
| Delete Content | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

## Setting Roles

### Via Database
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Via Drizzle Studio
```bash
npm run db:studio
```

## Middleware Routes

The middleware automatically protects these routes:

- `/dashboard/admin/*` → Admin only
- `/dashboard/posts/new` → Admin & Penulis
- `/dashboard/posts/edit` → Admin & Penulis
- All other `/dashboard/*` → Authenticated users
