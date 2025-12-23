import type { UserRole } from '@/schema/auth-schema';
import type { User } from '@/lib/stores/auth-store';

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  return user?.role ? roles.includes(user.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user is penulis (writer)
 */
export function isPenulis(user: User | null): boolean {
  return user?.role === 'penulis';
}

/**
 * Check if user can create content
 * Admin and Penulis can create content
 */
export function canCreateContent(user: User | null): boolean {
  return hasAnyRole(user, ['admin', 'penulis']);
}

/**
 * Check if user can edit content
 * Admin can edit all, Penulis can edit own
 */
export function canEditContent(user: User | null, contentAuthorId?: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'penulis' && contentAuthorId) {
    return user.id === contentAuthorId;
  }
  return false;
}

/**
 * Check if user can delete content
 * Only admin can delete
 */
export function canDeleteContent(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can manage users
 * Only admin can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    penulis: 'Penulis',
    user: 'User',
  };
  return roleNames[role];
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    penulis: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return colors[role];
}

/**
 * Get available roles for selection
 */
export function getAvailableRoles(): Array<{ value: UserRole; label: string }> {
  return [
    { value: 'user', label: 'User' },
    { value: 'penulis', label: 'Penulis' },
    { value: 'admin', label: 'Administrator' },
  ];
}
