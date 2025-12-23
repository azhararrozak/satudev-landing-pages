'use client';

import { useUser, useRoles } from '@/lib/hooks/use-auth';
import { AdminOnly, ContentCreatorOnly } from '@/components/auth/RoleGuard';
import { UserInfo } from '@/components/auth/UserRoleBadge';
import { canCreateContent, canDeleteContent } from '@/lib/rbac';

export default function DashboardHomePage() {
  const { user, isLoading } = useUser();
  const { isAdmin, isPenulis } = useRoles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with User Info */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Selamat datang kembali, {user?.name}!
            </p>
          </div>
          <UserInfo />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Post", value: 12 },
          { label: "Total Komen", value: 48 },
          { label: "Category", value: 6 },
          { label: "Status", value: "Active" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border bg-slate-50 p-4"
          >
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - Role Based */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Content Creator Actions */}
        <ContentCreatorOnly>
          <div className="rounded-2xl border bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ✍️ Content Creator Tools
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Anda dapat membuat dan mengelola konten
            </p>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                📝 Buat Post Baru
              </button>
              <button className="w-full bg-blue-100 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                📋 Lihat Post Saya
              </button>
            </div>
          </div>
        </ContentCreatorOnly>

        {/* Admin Only Actions */}
        <AdminOnly>
          <div className="rounded-2xl border bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              ⚙️ Admin Panel
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Anda memiliki akses penuh administrasi
            </p>
            <div className="space-y-2">
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                👥 Kelola Users
              </button>
              <button className="w-full bg-red-100 text-red-900 px-4 py-2 rounded-lg hover:bg-red-200 transition">
                🗑️ Hapus Konten
              </button>
            </div>
          </div>
        </AdminOnly>
      </div>

      {/* Your Permissions */}
      <div className="rounded-2xl border bg-slate-50 p-6">
        <h3 className="text-lg font-semibold mb-4">🔐 Izin Akses Anda</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className={canCreateContent(user) ? 'text-green-600' : 'text-gray-400'}>
              {canCreateContent(user) ? '✓' : '✗'}
            </span>
            <span className="text-sm">Buat Konten</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isPenulis() || isAdmin() ? 'text-green-600' : 'text-gray-400'}>
              {isPenulis() || isAdmin() ? '✓' : '✗'}
            </span>
            <span className="text-sm">Edit Konten Sendiri</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={canDeleteContent(user) ? 'text-green-600' : 'text-gray-400'}>
              {canDeleteContent(user) ? '✓' : '✗'}
            </span>
            <span className="text-sm">Hapus Konten</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isAdmin() ? 'text-green-600' : 'text-gray-400'}>
              {isAdmin() ? '✓' : '✗'}
            </span>
            <span className="text-sm">Kelola Users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isAdmin() ? 'text-green-600' : 'text-gray-400'}>
              {isAdmin() ? '✓' : '✗'}
            </span>
            <span className="text-sm">Akses Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm">Lihat Dashboard</span>
          </div>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="rounded-2xl border bg-slate-50 p-6">
        <h3 className="text-lg font-semibold mb-2">📝 Quick Notes</h3>
        <p className="text-sm text-slate-600">
          Role Anda: <strong className="capitalize">{user?.role}</strong>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Kamu bisa isi konten dashboard di sini (grafik, recent activity, dll).
        </p>
      </div>
    </div>
  );
}

