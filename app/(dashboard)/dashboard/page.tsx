'use client';

import { useUser, useRoles } from '@/lib/hooks/use-auth';
import { AdminOnly, ContentCreatorOnly } from '@/components/auth/RoleGuard';
import { UserInfo } from '@/components/auth/UserRoleBadge';
import { canCreateContent, canDeleteContent } from '@/lib/rbac';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  totalCategories: number;
  userPosts: number;
  role: string;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  categoryName: string | null;
}

export default function DashboardHomePage() {
  const { user, isLoading } = useUser();
  const { isAdmin, isPenulis } = useRoles();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      fetchStats();
      fetchRecentPosts();
    }
  }, [isLoading, user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch('/api/posts?limit=5&sort=desc');
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

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
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Total Post</p>
          <p className="mt-2 text-2xl font-semibold">
            {statsLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.totalPosts || 0
            )}
          </p>
        </div>
        
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Total Komen</p>
          <p className="mt-2 text-2xl font-semibold">
            {statsLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.totalComments || 0
            )}
          </p>
        </div>
        
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Category</p>
          <p className="mt-2 text-2xl font-semibold">
            {statsLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.totalCategories || 0
            )}
          </p>
        </div>
        
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            {isAdmin() ? 'Status' : 'Post Saya'}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {statsLoading ? (
              <span className="animate-pulse">...</span>
            ) : isAdmin() ? (
              'Active'
            ) : (
              stats?.userPosts || 0
            )}
          </p>
        </div>
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

      {/* Recent Posts */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📄 Post Terbaru</h3>
          <Link href="/dashboard/posts" className="text-sm text-blue-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        
        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Belum ada post. <Link href="/dashboard/posts/new" className="text-blue-600 hover:underline">Buat post pertama</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {post.categoryName || 'Uncategorized'} • {new Date(post.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
