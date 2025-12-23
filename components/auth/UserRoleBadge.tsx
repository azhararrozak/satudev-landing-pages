'use client';

import { useUser } from '@/lib/hooks/use-auth';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/rbac';
import Image from 'next/image';

/**
 * Component to display user role badge
 */
export function UserRoleBadge() {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleName = getRoleDisplayName(user.role);
  const roleColor = getRoleBadgeColor(user.role);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor}`}
    >
      {roleName}
    </span>
  );
}

/**
 * Component to display user info with role
 */
export function UserInfo() {
  const { user, isLoading, isAuthenticated } = useUser();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex items-center gap-3">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-medium text-sm">{user.name}</span>
        <UserRoleBadge />
      </div>
    </div>
  );
}
