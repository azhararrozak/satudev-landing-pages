"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { UserRoleBadge } from "@/components/auth/UserRoleBadge";
import { getRoleDisplayName } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Key,
  Camera,
  Loader2,
  Copy,
  Check,
  Lock,
  BadgeCheck,
  UserCheck,
} from "lucide-react";

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-[#e8eefc] animate-pulse flex-shrink-0" />
        <div className="space-y-2.5 flex-1">
          <div className="h-7 w-48 rounded-[12px] bg-[#e8eefc] animate-pulse" />
          <div className="h-4 w-64 max-w-full rounded-full bg-[#e8eefc]/70 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 rounded-[24px] bg-[#e8eefc]/60 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, isLoading: isAuthLoading } = useUser();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"general" | "security" | "overview">("general");

  // Profile edit state
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Security edit state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "security" || tab === "overview" || tab === "general") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/featured-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to upload avatar");

      setImage(result.url);
      toast.success("Foto profil diunggah. Klik Simpan Perubahan untuk menerapkan.");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const res = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || undefined,
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to update profile");
      }

      toast.success("Profil berhasil diperbarui");
      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Mohon lengkapi seluruh kolom kata sandi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to change password");
      }

      toast.success("Kata sandi berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("ID Pengguna disalin ke papan klip");
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isAuthLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-8 text-center text-sm font-medium text-[#66666b]">
        Sesi pengguna tidak ditemukan.
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6">
      {/* Gamma Hero Profile Card */}
      <section className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-[#d0e6fe] overflow-hidden bg-[#e8eefc] flex items-center justify-center text-3xl font-bold text-[#002253]">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-[#002253] shadow-sm cursor-pointer transition hover:bg-[#e8eefc]"
              title="Ubah Foto Profil"
            >
              {isUploadingImage ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-[#0540ad]" />
              ) : (
                <Camera aria-hidden="true" className="h-4 w-4" />
              )}
              <span className="sr-only">Unggah foto profil baru</span>
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2.5 pt-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
                {user.name}
              </h1>
              <UserRoleBadge />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-sm font-medium text-[#66666b]">
              <span className="inline-flex items-center gap-1.5">
                <Mail aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                <span>{user.email}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                <span>{user.emailVerified ? "Email Terverifikasi" : "Akun Aktif"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 gamma-tabular">
                <Calendar aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                <span>Bergabung {joinDate}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Gamma Pastel Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] border border-[#b9d5fc] bg-[#d0e6fe] p-5 flex items-center gap-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#002253]">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Peran Akun
            </p>
            <p className="mt-0.5 text-[16px] font-bold text-[#002253]">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#d5e1fa] bg-[#e8eefc] p-5 flex items-center gap-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#002253]">
            <UserCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Status Sesi
            </p>
            <p className="mt-0.5 text-[16px] font-bold text-[#002253]">
              Aktif & Terotentikasi
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#d5e1fa] bg-[#e8eefc] p-5 flex items-center gap-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#002253]">
            <Key aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#243f6b]">
              Cakupan Hak Akses
            </p>
            <p className="mt-0.5 text-[16px] font-bold text-[#002253]">
              {user.role === "admin"
                ? "Kontrol Penuh"
                : user.role === "penulis"
                ? "Kreator Konten"
                : "Akses Standar"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Card */}
      <div className="overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white">
        <div
          role="tablist"
          aria-label="Pengaturan profil akun"
          className="flex gap-2 overflow-x-auto border-b border-[#dfdfe0] bg-[#f8faff] px-4 py-3 sm:px-6"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition ${
              activeTab === "general"
                ? "bg-[#e8eefc] font-bold text-[#002253]"
                : "font-medium text-[#66666b] hover:bg-white hover:text-[#002253]"
            }`}
          >
            <User aria-hidden="true" className="h-4 w-4" />
            <span>Profil Umum</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition ${
              activeTab === "security"
                ? "bg-[#e8eefc] font-bold text-[#002253]"
                : "font-medium text-[#66666b] hover:bg-white hover:text-[#002253]"
            }`}
          >
            <Key aria-hidden="true" className="h-4 w-4" />
            <span>Keamanan & Sandi</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition ${
              activeTab === "overview"
                ? "bg-[#e8eefc] font-bold text-[#002253]"
                : "font-medium text-[#66666b] hover:bg-white hover:text-[#002253]"
            }`}
          >
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            <span>Ringkasan Akun</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "general" && (
            <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#002253]">Nama Tampilan</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#002253]">Alamat Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-[#f8faff] text-[#66666b] cursor-not-allowed pr-10"
                  />
                  <Lock aria-hidden="true" className="h-4 w-4 absolute right-3.5 top-3 text-[#66666b]" />
                </div>
                <p className="text-xs text-[#66666b]">
                  Alamat email terhubung langsung dengan kredensial otentikasi akun Anda.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url" className="text-[#002253]">URL Foto Profil</Label>
                <Input
                  id="avatar-url"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://satudev.web.id/avatar.jpg"
                />
                <p className="text-xs text-[#66666b]">
                  Masukkan URL gambar atau gunakan tombol kamera pada foto profil di atas.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile || isUploadingImage}
                  className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
                >
                  {isUpdatingProfile && (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  )}
                  <span>{isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-[#002253]">Kata Sandi Saat Ini</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[#002253]">Kata Sandi Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#002253]">Konfirmasi Kata Sandi Baru</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
                >
                  {isChangingPassword && (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  )}
                  <span>{isChangingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "overview" && (
            <div className="space-y-5 max-w-2xl">
              <div className="rounded-[12px] border border-[#dfdfe0] bg-[#f8faff] p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#002253] flex items-center gap-2">
                  <User aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                  <span>Identitas Akun</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-[#66666b] block">ID Pengguna</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs font-mono bg-white border border-[#dfdfe0] px-2.5 py-1 rounded-[12px] text-[#002253] truncate max-w-[200px]">
                        {user.id}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(user.id)}
                        aria-label="Salin ID Pengguna"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-[#66666b] transition hover:bg-[#e8eefc] hover:text-[#002253]"
                      >
                        {copiedId ? (
                          <Check aria-hidden="true" className="h-3.5 w-3.5 text-[#0540ad]" />
                        ) : (
                          <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-[#66666b] block">Peran Terdaftar</span>
                    <div className="mt-1.5">
                      <UserRoleBadge />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#dfdfe0] bg-[#f8faff] p-5 space-y-3">
                <h3 className="text-sm font-bold text-[#002253] flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#0540ad]" />
                  <span>Kapabilitas Ruang Kerja</span>
                </h3>
                <ul className="space-y-2.5 text-sm font-medium text-[#38383c]">
                  <li className="flex items-start gap-2.5">
                    <Check aria-hidden="true" className="h-4 w-4 text-[#0540ad] mt-0.5 flex-shrink-0" />
                    <span>Mengakses ringkasan operasional dan statistik konten dashboard</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check aria-hidden="true" className="h-4 w-4 text-[#0540ad] mt-0.5 flex-shrink-0" />
                    <span>Mengelola portofolio proyek (buat, perbarui, dan sorot ke beranda)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check aria-hidden="true" className="h-4 w-4 text-[#0540ad] mt-0.5 flex-shrink-0" />
                    <span>Mengelola artikel blog, kategori, tag, serta moderasi komentar</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
