'use client';

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useUser, useAuthSync } from "@/lib/hooks/use-auth";

const nav = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/posts", label: "Post" },
  { href: "/dashboard/comments", label: "Komen" },
  { href: "/dashboard/categories", label: "Category" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Sync auth state from Better Auth to Zustand
  useAuthSync();
  
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for initial auth sync to complete
    if (isLoading) {
      return;
    }

    // Redirect if not authenticated after loading is complete
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }

    // Redirect regular users to homepage (only admin and penulis can access dashboard)
    if (user && user.role === 'user') {
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show error if user role is regular user
  if (user.role === 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Dashboard</p>
              <p className="text-xs text-slate-500">Admin panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border bg-white p-3 md:sticky md:top-[72px]">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t pt-3">
            <LogoutButton className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
              Logout
            </LogoutButton>
          </div>
        </aside>

        {/* Main content */}
        <main className="rounded-2xl border bg-white p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
