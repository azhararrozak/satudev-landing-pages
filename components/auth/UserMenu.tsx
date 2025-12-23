'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/hooks/use-auth';
import { UserRoleBadge } from './UserRoleBadge';
import { LogoutButton } from './LogoutButton';
import Link from 'next/link';
import Image from 'next/image';

export function UserMenu() {
  const { user, isAuthenticated } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 transition"
      >
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white shadow-lg z-50">
          <div className="p-4 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-slate-500 mb-2">{user.email}</p>
            <UserRoleBadge />
          </div>

          <div className="p-2">
            <Link
              href="/dashboard/profile"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 transition"
              onClick={() => setIsOpen(false)}
            >
              👤 Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 transition"
              onClick={() => setIsOpen(false)}
            >
              ⚙️ Settings
            </Link>
          </div>

          <div className="p-2 border-t">
            <LogoutButton 
              className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
              onLogoutComplete={() => setIsOpen(false)}
            >
              🚪 Logout
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
}
