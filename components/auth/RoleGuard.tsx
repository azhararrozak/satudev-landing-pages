'use client';

import { useUser, useRoles } from '@/lib/hooks/use-auth';
import type { UserRole } from '@/schema/auth-schema';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user role
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
}: RoleGuardProps) {
  const { user, isAuthenticated } = useUser();
  const { hasRole, hasAnyRole } = useRoles();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show content only to admins
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Show content only to penulis (writers)
 */
export function PenulisOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="penulis" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Show content to content creators (admin and penulis)
 */
export function ContentCreatorOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRoles={['admin', 'penulis']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
