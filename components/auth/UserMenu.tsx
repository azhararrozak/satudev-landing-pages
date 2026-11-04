'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/hooks/use-auth';
import { UserRoleBadge } from './UserRoleBadge';
import { LogoutButton } from './LogoutButton';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Globe, KeyRound, LogOut, UserCircle } from 'lucide-react';

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu akun pengguna"
        className="flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1.5 pr-2.5 text-left transition hover:border-[#dfdfe0] hover:bg-[#e8eefc]/60"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover border border-[#dfdfe0]"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eefc] text-xs font-bold text-[#002253] border border-[#d0e6fe]">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden sm:block leading-tight">
          <p className="max-w-[132px] truncate text-sm font-bold text-[#002253]">
            {user.name}
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-[#66666b] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#002253]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 rounded-[24px] border border-[#dfdfe0] bg-white p-2 shadow-[0_12px_32px_rgba(0,34,83,0.08)] z-50">
          <div className="border-b border-[#dfdfe0] px-3.5 py-3">
            <p className="truncate text-sm font-bold text-[#002253]">{user.name}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-[#66666b]">{user.email}</p>
            <div className="mt-2.5">
              <UserRoleBadge />
            </div>
          </div>

          <div className="py-1.5 space-y-0.5">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium text-[#38383c] transition hover:bg-[#e8eefc] hover:text-[#002253]"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle aria-hidden="true" className="h-4 w-4 text-[#002253]" />
              <span>Profil Akun</span>
            </Link>
            <Link
              href="/dashboard/profile?tab=security"
              className="flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium text-[#38383c] transition hover:bg-[#e8eefc] hover:text-[#002253]"
              onClick={() => setIsOpen(false)}
            >
              <KeyRound aria-hidden="true" className="h-4 w-4 text-[#002253]" />
              <span>Keamanan & Sandi</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium text-[#38383c] transition hover:bg-[#e8eefc] hover:text-[#002253]"
              onClick={() => setIsOpen(false)}
            >
              <Globe aria-hidden="true" className="h-4 w-4 text-[#002253]" />
              <span>Lihat Situs Publik</span>
            </Link>
          </div>

          <div className="border-t border-[#dfdfe0] pt-1.5">
            <LogoutButton
              className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-left text-sm font-medium text-[#b53800] transition hover:bg-[#fff1ea] disabled:opacity-50"
              onLogoutComplete={() => setIsOpen(false)}
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span>Keluar Sesi</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
}
