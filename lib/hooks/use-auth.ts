'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User } from '@/lib/stores/auth-store';

/**
 * Hook to sync Better Auth session with Zustand store
 */
export function useAuthSync() {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const syncAuth = async () => {
      setLoading(true);
      try {
        const response = await authClient.getSession();
        
        // Type assertion for Better Auth response
        const sessionData = response as unknown as {
          data?: {
            user?: {
              id: string;
              name: string;
              email: string;
              emailVerified: boolean;
              image?: string | null;
              role?: string;
              createdAt: Date;
              updatedAt: Date;
            };
            session?: {
              id: string;
              expiresAt: Date;
              token: string;
              userId: string;
            };
          } | null;
        };
        
        if (sessionData.data?.user && sessionData.data?.session) {
          const user: User = {
            id: sessionData.data.user.id,
            name: sessionData.data.user.name,
            email: sessionData.data.user.email,
            emailVerified: sessionData.data.user.emailVerified,
            image: sessionData.data.user.image || undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: (sessionData.data.user.role as any) || 'user',
            createdAt: new Date(sessionData.data.user.createdAt),
            updatedAt: new Date(sessionData.data.user.updatedAt),
          };
          
          setUser(user);
          setSession({
            id: sessionData.data.session.id,
            expiresAt: new Date(sessionData.data.session.expiresAt),
            token: sessionData.data.session.token,
            userId: sessionData.data.session.userId,
          });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Failed to sync auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial sync
    syncAuth();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage') {
        syncAuth();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      syncAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    // Periodic sync every 30 seconds to check session validity
    const intervalId = setInterval(syncAuth, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      clearInterval(intervalId);
    };
  }, [setUser, setSession, setLoading]);
}

/**
 * Hook to get current user from Zustand store
 */
export function useUser() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return { user, isLoading, isAuthenticated };
}

/**
 * Hook to get current session from Zustand store
 */
export function useSession() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { session, isLoading };
}

/**
 * Hook for role-based checks
 */
export function useRoles() {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isPenulis = useAuthStore((state) => state.isPenulis);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  return { isAdmin, isPenulis, hasRole, hasAnyRole };
}
