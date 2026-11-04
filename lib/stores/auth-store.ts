import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/schema/auth-schema';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastSyncedAt: number | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // Role-based checks
  isAdmin: () => boolean;
  isPenulis: () => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export function normalizeRole(role?: string | null): UserRole {
  const cleaned = String(role || 'user').trim().toLowerCase();
  if (cleaned === 'admin' || cleaned === 'penulis') {
    return cleaned;
  }
  return 'user';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true, // Start with true to prevent premature redirects
      isAuthenticated: false,
      lastSyncedAt: null,

      setUser: (user) =>
        set({
          user: user ? { ...user, role: normalizeRole(user.role) } : null,
          isAuthenticated: !!user,
        }),

      setSession: (session) =>
        set({
          session,
        }),

      setAuth: (user, session) =>
        set({
          user: user ? { ...user, role: normalizeRole(user.role) } : null,
          session,
          isAuthenticated: !!user,
          isLoading: false,
          lastSyncedAt: Date.now(),
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          lastSyncedAt: Date.now(),
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...userData,
                role: userData.role
                  ? normalizeRole(userData.role)
                  : state.user.role,
              }
            : null,
        })),

      // Role-based checks
      isAdmin: () => normalizeRole(get().user?.role) === 'admin',
      
      isPenulis: () => normalizeRole(get().user?.role) === 'penulis',
      
      hasRole: (role) => normalizeRole(get().user?.role) === role,
      
      hasAnyRole: (roles) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        return roles.includes(normalizeRole(currentUser.role));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
