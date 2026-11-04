"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-auth";
import { normalizeRole } from "@/lib/stores/auth-store";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/rbac";
import type { UserRole } from "@/schema/auth-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Loader2,
  PenLine,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  postsCount: number;
  commentsCount: number;
}

interface UsersSummary {
  total: number;
  regularUsers: number;
  penulisUsers: number;
  adminUsers: number;
}

type RoleFilter = "all" | UserRole;

const ROLE_OPTIONS: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  {
    value: "user",
    label: "User Biasa",
    description: "Dapat masuk ke akun publik dan mengirim komentar pada artikel blog.",
  },
  {
    value: "penulis",
    label: "Penulis",
    description: "Dapat mengakses dashboard untuk membuat dan mengelola artikel serta proyek.",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Memiliki kendali penuh atas konten, moderasi, dan pengelolaan pengguna.",
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useUser();

  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [summary, setSummary] = useState<UsersSummary>({
    total: 0,
    regularUsers: 0,
    penulisUsers: 0,
    adminUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & search state
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editVerified, setEditVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation modal state
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentRole = currentUser ? normalizeRole(currentUser.role) : null;
  const isAdmin = currentRole === "admin";

  useEffect(() => {
    if (!isAuthLoading && currentUser && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, currentUser, isAdmin, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 220);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(
    async (silent = false) => {
      if (!isAdmin) return;
      try {
        if (silent) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const params = new URLSearchParams();
        if (roleFilter !== "all") {
          params.set("role", roleFilter);
        }
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const queryString = params.toString();
        const url = queryString ? `/api/users?${queryString}` : "/api/users";
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat data pengguna");
        }

        setUsersList(data.users || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data pengguna"
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAdmin, roleFilter, debouncedSearch]
  );

  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      fetchUsers();
    }
  }, [isAuthLoading, isAdmin, fetchUsers]);

  const openEditDialog = (target: ManagedUser) => {
    setEditingUser(target);
    setEditName(target.name);
    setEditNameError("");
    setEditRole(target.role);
    setEditVerified(target.emailVerified);
  };

  const closeEditDialog = (open: boolean) => {
    if (!open) {
      setEditingUser(null);
      setEditNameError("");
    }
  };

  const handleSaveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditNameError("Nama tampilan wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          role: editRole,
          emailVerified: editVerified,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui pengguna");
      }

      toast.success(`Data akun ${trimmedName} berhasil diperbarui`);
      if (editingUser.id === currentUser?.id) {
        window.dispatchEvent(new Event("auth-change"));
      }
      setEditingUser(null);
      fetchUsers(true);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui pengguna"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus pengguna");
      }

      toast.success(`Akun ${deletingUser.name} berhasil dihapus`);
      setDeletingUser(null);
      fetchUsers(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus pengguna"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-[12px] bg-[#e8eefc] animate-pulse" />
            <div className="h-4 w-72 max-w-full rounded-full bg-[#e8eefc]/70 animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-[24px] bg-[#e8eefc] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 rounded-[24px] bg-[#e8eefc]/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-8 text-center">
        <p className="text-sm font-medium text-[#38383c]">
          Halaman ini hanya tersedia untuk Administrator. Mengalihkan...
        </p>
      </div>
    );
  }

  const filterTabs: Array<{ value: RoleFilter; label: string; count: number }> = [
    { value: "all", label: "Semua Akun", count: summary.total },
    { value: "user", label: "User Biasa", count: summary.regularUsers },
    { value: "penulis", label: "Penulis", count: summary.penulisUsers },
    { value: "admin", label: "Administrator", count: summary.adminUsers },
  ];

  const tableLabelVars = {
    "--label-2": '"Peran"',
    "--label-3": '"Aktivitas"',
    "--label-4": '"Terdaftar"',
    "--label-5": '"Aksi"',
  } as React.CSSProperties;

  const isEditingSelf = Boolean(editingUser && editingUser.id === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
            Pengelola Pengguna
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#66666b]">
            Lihat akun terdaftar dari peran User Biasa maupun Penulis serta atur hak aksesnya.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing || isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60 disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 text-[#0540ad] ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>Muat Ulang</span>
        </button>
      </section>

      {/* Summary Pastel Cards */}
      <section
        aria-label="Ringkasan jumlah pengguna berdasarkan peran"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <button
          type="button"
          onClick={() => setRoleFilter("all")}
          className={`flex items-center justify-between rounded-[24px] border p-5 text-left transition ${
            roleFilter === "all"
              ? "border-[#9ec5fa] bg-[#d0e6fe]"
              : "border-[#d5e1fa] bg-[#e8eefc] hover:bg-[#dce6fb]"
          }`}
        >
          <div className="space-y-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Total Akun
            </span>
            <span className="block text-2xl font-bold tracking-[-0.02em] text-[#002253] gamma-tabular">
              {summary.total}
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#002253]">
            <Users aria-hidden="true" className="h-5 w-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter("user")}
          className={`flex items-center justify-between rounded-[24px] border p-5 text-left transition ${
            roleFilter === "user"
              ? "border-[#9ec5fa] bg-[#d0e6fe]"
              : "border-[#d5e1fa] bg-[#e8eefc] hover:bg-[#dce6fb]"
          }`}
        >
          <div className="space-y-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              User Biasa
            </span>
            <span className="block text-2xl font-bold tracking-[-0.02em] text-[#002253] gamma-tabular">
              {summary.regularUsers}
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#002253]">
            <User aria-hidden="true" className="h-5 w-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter("penulis")}
          className={`flex items-center justify-between rounded-[24px] border p-5 text-left transition ${
            roleFilter === "penulis"
              ? "border-[#9ec5fa] bg-[#d0e6fe]"
              : "border-[#d5e1fa] bg-[#e8eefc] hover:bg-[#dce6fb]"
          }`}
        >
          <div className="space-y-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Penulis Konten
            </span>
            <span className="block text-2xl font-bold tracking-[-0.02em] text-[#002253] gamma-tabular">
              {summary.penulisUsers}
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#002253]">
            <PenLine aria-hidden="true" className="h-5 w-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRoleFilter("admin")}
          className={`flex items-center justify-between rounded-[24px] border p-5 text-left transition ${
            roleFilter === "admin"
              ? "border-[#9ec5fa] bg-[#d0e6fe]"
              : "border-[#d5e1fa] bg-[#e8eefc] hover:bg-[#dce6fb]"
          }`}
        >
          <div className="space-y-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Administrator
            </span>
            <span className="block text-2xl font-bold tracking-[-0.02em] text-[#002253] gamma-tabular">
              {summary.adminUsers}
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#002253]">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
        </button>
      </section>

      {/* Filter Bar & Users Table */}
      <div className="overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white">
        <form
          role="search"
          action="/dashboard/users"
          method="GET"
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-4 border-b border-[#dfdfe0] bg-[#f8faff] p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between"
        >
          {/* Mutually Exclusive Visible Radio Filter Pills (< 6 choices) */}
          <fieldset className="min-w-0">
            <legend className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-[#66666b]">
              Filter Peran
            </legend>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => {
                const inputId = `role-filter-${tab.value}`;
                const selected = roleFilter === tab.value;
                return (
                  <div key={tab.value} className="relative">
                    <input
                      type="radio"
                      id={inputId}
                      name="role"
                      value={tab.value}
                      checked={selected}
                      onChange={() => setRoleFilter(tab.value)}
                      className="gamma-visually-hidden peer"
                    />
                    <label
                      htmlFor={inputId}
                      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-[24px] border px-4 text-sm transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0540ad] ${
                        selected
                          ? "border-[#002253] bg-[#002253] font-bold text-white"
                          : "border-[#dfdfe0] bg-white font-medium text-[#38383c] hover:bg-[#e8eefc]/70 hover:text-[#002253]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold gamma-tabular ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-[#e8eefc] text-[#002253]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* Search Input with Identifier Hints */}
          <div className="w-full lg:w-80">
            <label
              htmlFor="user-search-input"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-[#66666b]"
            >
              Cari Nama atau Email
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66666b]"
              />
              <input
                id="user-search-input"
                name="search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ketik nama atau email..."
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
                className="h-11 w-full rounded-[24px] border border-[#dfdfe0] bg-white pl-10 pr-9 text-base font-medium text-[#002253] placeholder:text-[#66666b] focus:border-[#0540ad] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#66666b] hover:bg-[#e8eefc] hover:text-[#002253]"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Users Data Table */}
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="h-16 rounded-[12px] bg-[#e8eefc]/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="users-table-caption"
            className="gamma-table-wrapper"
          >
            <table className="gamma-table-responsive" style={tableLabelVars}>
              <caption id="users-table-caption" className="sr-only">
                Daftar pengguna terdaftar beserta peran, ringkasan aktivitas, dan tanggal pendaftaran
              </caption>
              <thead className="bg-[#f6f9ff]">
                <tr>
                  <th
                    scope="col"
                    className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                  >
                    Pengguna
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                  >
                    Peran
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                  >
                    Aktivitas
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                  >
                    Terdaftar
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#dfdfe0] px-6 py-3.5 text-right text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {usersList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      data-empty-row=""
                      className="px-6 py-12 text-center text-sm font-medium text-[#66666b]"
                    >
                      Tidak ada pengguna yang cocok dengan filter atau kata kunci pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  usersList.map((item) => {
                    const isSelf = item.id === currentUser?.id;
                    return (
                      <tr key={item.id} className="hover:bg-[#f6f9ff] transition-colors">
                        <th
                          scope="row"
                          className="border-b border-[#eef2f8] px-6 py-4 text-left font-normal"
                        >
                          <div className="flex items-center gap-3.5">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 flex-shrink-0 rounded-full border border-[#dfdfe0] object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#d0e6fe] bg-[#e8eefc] text-sm font-bold text-[#002253]">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-[15px] font-bold text-[#002253]">
                                  {item.name}
                                </span>
                                {isSelf && (
                                  <span className="rounded-full border border-[#dfdfe0] bg-[#f8faff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-[#0540ad]">
                                    Anda
                                  </span>
                                )}
                                {item.emailVerified && (
                                  <BadgeCheck
                                    aria-label="Email terverifikasi"
                                    className="h-4 w-4 flex-shrink-0 text-[#0540ad]"
                                  />
                                )}
                              </div>
                              <span className="mt-0.5 block truncate text-xs font-medium text-[#66666b]">
                                {item.email}
                              </span>
                            </div>
                          </div>
                        </th>

                        <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${getRoleBadgeColor(
                              item.role
                            )}`}
                          >
                            {getRoleDisplayName(item.role)}
                          </span>
                        </td>

                        <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#38383c] gamma-tabular">
                            {item.postsCount} artikel · {item.commentsCount} komentar
                          </span>
                        </td>

                        <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#66666b] gamma-tabular">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditDialog(item)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#dfdfe0] bg-white px-3 text-xs font-bold text-[#002253] transition hover:bg-[#e8eefc]"
                            >
                              <UserCog aria-hidden="true" className="h-3.5 w-3.5 text-[#0540ad]" />
                              <span>Kelola</span>
                            </button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf}
                              aria-label={
                                isSelf
                                  ? "Akun Anda sendiri tidak dapat dihapus"
                                  : `Hapus akun ${item.name}`
                              }
                              title={
                                isSelf
                                  ? "Akun yang sedang digunakan tidak dapat dihapus"
                                  : `Hapus ${item.name}`
                              }
                              onClick={() => setDeletingUser(item)}
                              className="h-8 w-8 rounded-full p-0 text-[#b53800] hover:bg-[#fff1ea] hover:text-[#b53800] disabled:opacity-30"
                            >
                              <Trash2 aria-hidden="true" className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User & Role Dialog */}
      <Dialog open={Boolean(editingUser)} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-lg rounded-[24px] border-[#dfdfe0]">
          <DialogHeader>
            <DialogTitle className="text-[#002253]">
              Kelola Akun Pengguna
            </DialogTitle>
            <DialogDescription className="text-[#66666b]">
              {editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form
              method="POST"
              action={`/api/users/${editingUser.id}`}
              onSubmit={handleSaveUser}
              className="space-y-5 pt-1"
            >
              <div>
                <label
                  htmlFor="edit-user-name"
                  className="mb-1.5 block text-sm font-bold text-[#002253]"
                >
                  Nama Tampilan *
                </label>
                <input
                  id="edit-user-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  value={editName}
                  aria-invalid={Boolean(editNameError)}
                  aria-describedby={editNameError ? "edit-user-name-error" : undefined}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    if (editNameError) setEditNameError("");
                  }}
                  onBlur={() => {
                    if (!editName.trim()) {
                      setEditNameError("Nama tampilan wajib diisi.");
                    }
                  }}
                  className="h-11 w-full rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-base font-medium text-[#002253] focus:border-[#0540ad] focus:outline-none"
                />
                {editNameError && (
                  <p
                    id="edit-user-name-error"
                    aria-live="polite"
                    className="mt-1.5 text-xs font-medium text-[#b53800]"
                  >
                    {editNameError}
                  </p>
                )}
              </div>

              <fieldset
                aria-describedby={isEditingSelf ? "self-role-lock-note" : undefined}
                className="space-y-2.5"
              >
                <legend className="text-sm font-bold text-[#002253]">
                  Peran Pengguna
                </legend>
                {isEditingSelf && (
                  <p id="self-role-lock-note" className="text-xs font-medium text-[#66666b]">
                    Peran akun Administrator Anda sendiri yang sedang aktif dikunci agar tidak terkunci keluar.
                  </p>
                )}
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((option) => {
                    const optionId = `edit-role-${option.value}`;
                    const checked = editRole === option.value;
                    const disabled = isEditingSelf && option.value !== "admin";
                    return (
                      <label
                        key={option.value}
                        htmlFor={optionId}
                        className={`flex items-start gap-3 rounded-[12px] border p-3.5 transition ${
                          disabled
                            ? "cursor-not-allowed border-[#dfdfe0] bg-[#f8faff] opacity-60"
                            : checked
                            ? "cursor-pointer border-[#0540ad] bg-[#e8eefc]"
                            : "cursor-pointer border-[#dfdfe0] bg-white hover:bg-[#f8faff]"
                        }`}
                      >
                        <input
                          type="radio"
                          id={optionId}
                          name="role"
                          value={option.value}
                          checked={checked}
                          disabled={disabled}
                          onChange={() => setEditRole(option.value)}
                          className="mt-1 h-4 w-4 flex-shrink-0 accent-[#0540ad]"
                        />
                        <div className="min-w-0">
                          <span className="block text-sm font-bold text-[#002253]">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium leading-relaxed text-[#38383c]">
                            {option.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="edit-email-verified"
                  name="emailVerified"
                  checked={editVerified}
                  onChange={(event) => setEditVerified(event.target.checked)}
                  className="h-4 w-4 rounded accent-[#0540ad]"
                />
                <label
                  htmlFor="edit-email-verified"
                  className="cursor-pointer text-sm font-medium text-[#38383c]"
                >
                  Tandai alamat email sebagai terverifikasi
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-[#dfdfe0] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-sm font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
                >
                  {isSaving && (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingUser(null);
        }}
      >
        <DialogContent className="max-w-md rounded-[24px] border-[#dfdfe0]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#002253]">
              <AlertTriangle aria-hidden="true" className="h-5 w-5 text-[#b53800]" />
              <span>Hapus Akun Pengguna</span>
            </DialogTitle>
            <DialogDescription className="text-[#38383c] pt-1">
              Apakah Anda yakin ingin menghapus akun{" "}
              <strong className="text-[#002253]">{deletingUser?.name}</strong> (
              {deletingUser?.email})? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {deletingUser && deletingUser.postsCount > 0 && (
            <div className="rounded-[12px] border border-[#ffd8c4] bg-[#fff1ea] p-3.5 text-xs font-medium leading-relaxed text-[#b53800]">
              Perhatian: Akun ini memiliki{" "}
              <strong className="gamma-tabular">{deletingUser.postsCount} artikel</strong>{" "}
              yang terhubung dan akan ikut terhapus secara permanen jika akun dihapus.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              disabled={isDeleting}
              className="inline-flex h-10 items-center rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#b53800] px-6 text-sm font-medium text-white transition hover:bg-[#992f00] disabled:opacity-50"
            >
              {isDeleting && (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              )}
              <span>Hapus Permanen</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

