'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useRoles } from '@/lib/hooks/use-auth';
import type { UserRole } from '@/schema/auth-schema';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallbackUrl?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Component to protect routes based on authentication and roles
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  fallbackUrl = '/auth/signin',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useUser();
  const { hasRole, hasAnyRole } = useRoles();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!isAuthenticated) {
        router.push(fallbackUrl);
        return;
      }

      // Check single role
      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/dashboard');
        return;
      }

      // Check multiple roles
      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requiredRoles, hasRole, hasAnyRole, router, fallbackUrl]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: UserRole;
    requiredRoles?: UserRole[];
    fallbackUrl?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredRole={options?.requiredRole}
        requiredRoles={options?.requiredRoles}
        fallbackUrl={options?.fallbackUrl}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
