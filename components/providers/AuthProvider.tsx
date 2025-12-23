'use client';

import { useAuthSync } from '@/lib/hooks/use-auth';

/**
 * Provider component to sync authentication state
 * Should be placed in the root layout
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();

  return <>{children}</>;
}
