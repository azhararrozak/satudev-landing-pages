'use client';

import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // Sign out from Better Auth
      await authClient.signOut();
      
      // Clear Zustand store
      logout();
      
      // Redirect to home or signin page
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { handleLogout, isLoggingOut };
}
