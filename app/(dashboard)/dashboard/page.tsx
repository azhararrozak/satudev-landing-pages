'use client';

import { useUser, useRoles } from '@/lib/hooks/use-auth';
import { UserRoleBadge } from '@/components/auth/UserRoleBadge';
import {
  canCreateContent,
  canDeleteContent,
  canManageUsers,
  getRoleDisplayName,
} from '@/lib/rbac';
import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  FolderKanban,
  FolderTree,
  KeyRound,
  MessageSquare,
  Minus,
  Plus,
  Tags,
  UserCheck,
  Users,
} from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalProjects: number;
  featuredProjects: number;
  totalComments: number;
  totalCategories: number;
  totalTags: number;
  totalUsers?: number;
  regularUsers?: number;
  penulisUsers?: number;
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

interface WorkspaceTile {
  href: string;
  title: string;
  description: string;
  metric: string;
  submetric: string;
  highlight?: boolean;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
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
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-8 space-y-4">
          <div className="h-6 w-36 rounded-full bg-[#e8eefc] animate-pulse" />
          <div className="h-10 w-72 rounded-[12px] bg-[#e8eefc]/70 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-full bg-[#e8eefc]/60 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-40 rounded-[24px] border border-[#dfdfe0] bg-[#e8eefc]/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const totalPosts = stats?.totalPosts ?? 0;
  const publishedPosts = stats?.publishedPosts ?? 0;
  const draftPosts = stats?.draftPosts ?? 0;
  const totalProjects = stats?.totalProjects ?? 0;
  const featuredProjects = stats?.featuredProjects ?? 0;
  const totalComments = stats?.totalComments ?? 0;
  const totalCategories = stats?.totalCategories ?? 0;
  const totalTags = stats?.totalTags ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const regularUsers = stats?.regularUsers ?? 0;
  const penulisUsers = stats?.penulisUsers ?? 0;
  const userPosts = stats?.userPosts ?? 0;

  const publishedRatio =
    totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0;

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Admin';
  const roleLabel = user ? getRoleDisplayName(user.role) : 'Pengguna';

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const sixthWorkspaceTile: WorkspaceTile = isAdmin()
    ? {
        href: '/dashboard/users',
        title: 'Pengelola Pengguna',
        description:
          'Lihat pengguna terdaftar dari peran User Biasa maupun Penulis dan atur izin akses.',
        metric: statsLoading ? '...' : String(totalUsers),
        submetric: statsLoading
          ? 'Memuat data'
          : `${regularUsers} user · ${penulisUsers} penulis`,
        icon: Users,
      }
    : {
        href: '/dashboard/profile',
        title: 'Profil & Keamanan',
        description:
          'Perbarui informasi penulis, foto profil, dan kredensial kata sandi.',
        metric: String(userPosts),
        submetric: 'Artikel milik Anda',
        icon: UserCheck,
      };

  const workspaceTiles: WorkspaceTile[] = [
    {
      href: '/dashboard/posts',
      title: 'Artikel Blog',
      description: 'Tulis, sunting, dan publikasikan artikel teknis ke halaman blog.',
      metric: statsLoading ? '...' : String(totalPosts),
      submetric: statsLoading
        ? 'Memuat data'
        : `${publishedPosts} tayang · ${draftPosts} draf`,
      highlight: true,
      icon: FileText,
    },
    {
      href: '/dashboard/projects',
      title: 'Portofolio Proyek',
      description: 'Kelola daftar proyek, teknologi, dan sorotan karya di beranda.',
      metric: statsLoading ? '...' : String(totalProjects),
      submetric: statsLoading
        ? 'Memuat data'
        : `${featuredProjects} proyek unggulan`,
      icon: FolderKanban,
    },
    {
      href: '/dashboard/comments',
      title: 'Diskusi Pembaca',
      description: 'Tinjau komentar masuk pada artikel dan kirim balasan langsung.',
      metric: statsLoading ? '...' : String(totalComments),
      submetric: 'Moderasi percakapan',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/categories',
      title: 'Kategori Konten',
      description: 'Atur struktur topik utama agar arsip artikel mudah dijelajahi.',
      metric: statsLoading ? '...' : String(totalCategories),
      submetric: 'Pengelompokan topik',
      icon: FolderTree,
    },
    {
      href: '/dashboard/tags',
      title: 'Label & Tag',
      description: 'Hubungkan artikel yang saling berkaitan dengan kata kunci spesifik.',
      metric: statsLoading ? '...' : String(totalTags),
      submetric: 'Indeks kata kunci',
      icon: Tags,
    },
    sixthWorkspaceTile,
  ];

  const permissionItems = [
    {
      label: 'Membuat & menerbitkan artikel',
      allowed: canCreateContent(user),
    },
    {
      label: 'Menyunting konten publikasi',
      allowed: isPenulis() || isAdmin(),
    },
    {
      label: 'Mengelola portofolio proyek',
      allowed: isPenulis() || isAdmin(),
    },
    {
      label: 'Menghapus konten & moderasi penuh',
      allowed: canDeleteContent(user),
    },
    {
      label: 'Mengelola akun pengguna terdaftar',
      allowed: canManageUsers(user),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Band 1: Gamma Hero Card */}
      <section className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <UserRoleBadge />
              <span className="text-xs font-medium text-[#66666b] gamma-tabular">
                {todayFormatted}
              </span>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-[-0.02em] leading-[1.08] text-[#002253]">
                Selamat datang kembali, {firstName}
              </h1>
              <p className="max-w-xl text-[15px] sm:text-[17px] font-medium leading-[1.6] text-[#38383c]">
                Pusat kendali publikasi artikel, portofolio proyek, dan interaksi pembaca untuk{' '}
                <span className="font-bold text-[#002253]">satudev.web.id</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/dashboard/posts/new"
                className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591]"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                <span>Tulis Artikel Baru</span>
              </Link>
              <Link
                href="/dashboard/projects"
                className="inline-flex h-10 items-center gap-2 rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-[15px] font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
              >
                <span>Kelola Portofolio</span>
              </Link>
            </div>
          </div>

          {/* Right Preview Card (12px secondary card tier) */}
          <div className="rounded-[12px] border border-[#dfdfe0] bg-[#f8faff] p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#66666b]">
                  Rasio Publikasi
                </p>
                <p className="mt-1 text-sm font-medium text-[#38383c]">
                  Proporsi artikel berstatus tayang
                </p>
              </div>
              <span className="text-[40px] sm:text-[46px] font-light leading-none tracking-[-0.03em] text-[#002253] gamma-tabular">
                {statsLoading ? '--' : `${publishedRatio}%`}
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Persentase artikel tayang"
              aria-valuenow={publishedRatio}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-[#e8eefc]"
            >
              <div
                className="h-full rounded-full bg-[#0540ad] transition-all duration-300"
                style={{ width: `${statsLoading ? 0 : publishedRatio}%` }}
              />
            </div>

            <dl className="grid grid-cols-3 gap-3 border-t border-[#dfdfe0] pt-4">
              <div>
                <dt className="text-xs font-medium text-[#66666b]">Tayang</dt>
                <dd className="mt-0.5 text-lg font-bold text-[#002253] gamma-tabular">
                  {statsLoading ? '-' : publishedPosts}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#66666b]">Draf</dt>
                <dd className="mt-0.5 text-lg font-bold text-[#002253] gamma-tabular">
                  {statsLoading ? '-' : draftPosts}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#66666b]">Unggulan</dt>
                <dd className="mt-0.5 text-lg font-bold text-[#002253] gamma-tabular">
                  {statsLoading ? '-' : featuredProjects}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Band 2: Signature 3x2 Gamma Product-Tile Grid on Periwinkle Cloud Band */}
      <section
        aria-labelledby="workspace-modules-heading"
        className="gamma-cloud-band rounded-[24px] border border-[#dfdfe0] p-5 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="workspace-modules-heading"
              className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.5px] leading-tight text-[#002253]"
            >
              Modul Ruang Kerja
            </h2>
            <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#243f6b]">
              Akses cepat ke enam modul operasional situs dan manajemen konten.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-[#dfdfe0] bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253] gamma-tabular">
            6 Modul
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {workspaceTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group flex flex-col justify-between rounded-[24px] border p-6 transition duration-150 ${
                  tile.highlight
                    ? 'border-[#b9d5fc] bg-[#d0e6fe] hover:bg-[#c3defd]'
                    : 'border-[#d5e1fa] bg-[#e8eefc] hover:bg-[#dce6fb]'
                } shadow-[0_2px_8px_rgba(0,34,83,0.03)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#002253] shadow-[0_1px_3px_rgba(0,34,83,0.08)]">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold leading-none tracking-[-0.02em] text-[#002253] gamma-tabular">
                      {tile.metric}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-[#243f6b] gamma-tabular">
                      {tile.submetric}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[19px] font-bold tracking-[-0.4px] leading-snug text-[#002253]">
                      {tile.title}
                    </h3>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 flex-shrink-0 text-[#243f6b] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0540ad]"
                    />
                  </div>
                  <p className="text-sm font-medium leading-[1.5] text-[#243f6b]">
                    {tile.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Band 3: Recent Articles & Role Capabilities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent Articles Feature Card */}
        <section
          aria-labelledby="recent-posts-heading"
          className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2
                  id="recent-posts-heading"
                  className="text-[20px] font-bold tracking-[-0.4px] text-[#002253]"
                >
                  Artikel Terbaru
                </h2>
                <p className="mt-0.5 text-sm font-medium text-[#66666b]">
                  Lima pembaruan konten terakhir di ruang redaksi
                </p>
              </div>
              <Link
                href="/dashboard/posts"
                className="inline-flex h-9 items-center gap-1.5 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
              >
                <span>Lihat Semua</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>

            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[12px] border border-[#dfdfe0] p-4"
                  >
                    <div className="space-y-2 flex-1 pr-4">
                      <div className="h-4 w-2/3 rounded-full bg-[#e8eefc] animate-pulse" />
                      <div className="h-3 w-1/3 rounded-full bg-[#e8eefc]/70 animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-[#e8eefc] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#dfdfe0] bg-[#f8faff] px-6 py-10 text-center">
                <p className="text-sm font-medium text-[#38383c]">
                  Belum ada artikel yang tersimpan di database.
                </p>
                <Link
                  href="/dashboard/posts/new"
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#0540ad] transition hover:bg-[#e8eefc]"
                >
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Buat artikel pertama</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentPosts.map((post) => {
                  const isPublished = post.status === 'published';
                  return (
                    <Link
                      key={post.id}
                      href={`/dashboard/posts/${post.id}`}
                      className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-[12px] border border-[#dfdfe0] bg-white px-4 py-3.5 transition hover:border-[#b8d0fa] hover:bg-[#f8faff]"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-bold text-[#002253] group-hover:text-[#0540ad] transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-[#66666b] gamma-tabular">
                          <span>{post.categoryName || 'Tanpa Kategori'}</span>
                          <span aria-hidden="true" className="mx-1.5">
                            ·
                          </span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${
                          isPublished
                            ? 'bg-[#e8eefc] text-[#002253] border border-[#d0e6fe]'
                            : 'bg-[#fff1ea] text-[#b53800] border border-[#ffd8c4]'
                        }`}
                      >
                        {isPublished ? 'Tayang' : 'Draf'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Role & Security Quick Card */}
        <section
          aria-labelledby="access-scope-heading"
          className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-5">
            <div>
              <h2
                id="access-scope-heading"
                className="text-[20px] font-bold tracking-[-0.4px] text-[#002253]"
              >
                Cakupan Hak Akses
              </h2>
              <p className="mt-0.5 text-sm font-medium text-[#66666b]">
                Izin aktif untuk akun <span className="font-bold text-[#002253]">{roleLabel}</span>
              </p>
            </div>

            <ul className="space-y-3">
              {permissionItems.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      item.allowed
                        ? 'bg-[#e8eefc] text-[#0540ad]'
                        : 'bg-[#f4f5f7] text-[#66666b]'
                    }`}
                  >
                    {item.allowed ? (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <Minus aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      item.allowed ? 'text-[#38383c]' : 'text-[#66666b]'
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 border-t border-[#dfdfe0] pt-5">
            {isAdmin() && (
              <Link
                href="/dashboard/users"
                className="flex h-10 w-full items-center justify-between rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
              >
                <span className="flex items-center gap-2">
                  <Users aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                  <span>Kelola Pengguna Terdaftar</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#66666b]" />
              </Link>
            )}
            <Link
              href="/dashboard/profile?tab=security"
              className="flex h-10 w-full items-center justify-between rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
            >
              <span className="flex items-center gap-2">
                <KeyRound aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                <span>Pengaturan Kata Sandi</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#66666b]" />
            </Link>
            <Link
              href="/dashboard/comments"
              className="flex h-10 w-full items-center justify-between rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
            >
              <span className="flex items-center gap-2">
                <MessageSquare aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                <span>Moderasi Komentar</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#66666b]" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
