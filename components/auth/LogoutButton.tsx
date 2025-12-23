'use client';

import { useLogout } from '@/lib/hooks/use-logout';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
}

export function LogoutButton({ 
  children, 
  className = '',
  onLogoutStart,
  onLogoutComplete 
}: LogoutButtonProps) {
  const { handleLogout, isLoggingOut } = useLogout();

  const onClick = async () => {
    onLogoutStart?.();
    await handleLogout();
    onLogoutComplete?.();
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Logging out...
        </span>
      ) : (
        children || 'Logout'
      )}
    </button>
  );
}
