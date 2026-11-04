'use client';

import { useUser } from '@/lib/hooks/use-auth';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/rbac';
import Image from 'next/image';

/**
 * Component to display user role badge
 */
export function UserRoleBadge({ className = '' }: { className?: string }) {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleName = getRoleDisplayName(user.role);
  const roleColor = getRoleBadgeColor(user.role);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] leading-none ${roleColor} ${className}`}
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
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#e8eefc] animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 rounded-full bg-[#e8eefc] animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-[#e8eefc] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover border border-[#dfdfe0]"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8eefc] text-sm font-bold text-[#002253] border border-[#d0e6fe]">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-bold text-[#002253] leading-tight">{user.name}</span>
        <UserRoleBadge />
      </div>
    </div>
  );
}
