'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthStore, normalizeRole } from '@/lib/stores/auth-store';
import type { User } from '@/lib/stores/auth-store';

let inflightAuthSync: Promise<void> | null = null;
const FRESH_SYNC_TTL_MS = 5_000;

/**
 * Hook to sync Better Auth session with Zustand store
 */
export function useAuthSync() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const syncAuth = async (force = false) => {
      const currentState = useAuthStore.getState();

      // Skip redundant network roundtrip if sign-in/sign-up just hydrated the store
      if (
        !force &&
        currentState.lastSyncedAt &&
        Date.now() - currentState.lastSyncedAt < FRESH_SYNC_TTL_MS
      ) {
        if (currentState.isLoading) {
          setLoading(false);
        }
        return;
      }

      if (inflightAuthSync) {
        return inflightAuthSync;
      }

      // Only block UI with loading spinner when no user is hydrated yet
      if (!currentState.user) {
        setLoading(true);
      }

      inflightAuthSync = (async () => {
        try {
          const response = await authClient.getSession(
            force ? { query: { disableCookieCache: true } } : undefined
          );

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
                createdAt: Date | string;
                updatedAt: Date | string;
              };
              session?: {
                id: string;
                expiresAt: Date | string;
                token: string;
                userId: string;
              };
            } | null;
            error?: unknown;
          };

          if (sessionData.data?.user && sessionData.data?.session) {
            const user: User = {
              id: sessionData.data.user.id,
              name: sessionData.data.user.name,
              email: sessionData.data.user.email,
              emailVerified: sessionData.data.user.emailVerified,
              image: sessionData.data.user.image || undefined,
              role: normalizeRole(sessionData.data.user.role),
              createdAt: new Date(sessionData.data.user.createdAt),
              updatedAt: new Date(sessionData.data.user.updatedAt),
            };

            setAuth(user, {
              id: sessionData.data.session.id,
              expiresAt: new Date(sessionData.data.session.expiresAt),
              token: sessionData.data.session.token,
              userId: sessionData.data.session.userId,
            });
          } else if (!sessionData.error) {
            setAuth(null, null);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Failed to sync auth:', error);
          if (!useAuthStore.getState().user) {
            setAuth(null, null);
          } else {
            setLoading(false);
          }
        } finally {
          inflightAuthSync = null;
        }
      })();

      return inflightAuthSync;
    };

    // Initial sync
    void syncAuth(false);

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage') {
        void syncAuth(true);
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      void syncAuth(false);
    };

    const handleAuthSync = () => {
      void syncAuth(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('auth-sync', handleAuthSync);

    // Periodic sync every 30 seconds to check session validity
    // const intervalId = setInterval(syncAuth, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('auth-sync', handleAuthSync);
      // clearInterval(intervalId);
    };
  }, [setAuth, setLoading]);
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
