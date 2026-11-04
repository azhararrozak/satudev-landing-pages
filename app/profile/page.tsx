"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUser } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authClient } from "@/lib/auth-client";
import { UserRoleBadge } from "@/components/auth/UserRoleBadge";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getRoleDisplayName } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";

const COPY = {
  id: {
    breadcrumbHome: "Beranda",
    breadcrumbProfile: "Profil Akun",
    badge: "Akun SatuDev",
    heroSubtitle:
      "Kelola identitas profil, foto tampilan, dan keamanan kata sandi akun Anda di ekosistem SatuDev.",
    openDashboard: "Buka Dashboard",
    logout: "Keluar",
    verified: "Terverifikasi",
    activeAccount: "Akun Aktif",
    joinedPrefix: "Bergabung",
    uploadAvatarLabel: "Unggah foto profil baru",
    uploadAvatarSuccess:
      "Foto profil berhasil diunggah. Klik Simpan Perubahan untuk menerapkan.",
    uploadAvatarError: "Gagal mengunggah foto profil.",
    summaryTitle: "Ringkasan Akun",
    roleLabel: "Peran Akses",
    statusLabel: "Status Email",
    memberSinceLabel: "Terdaftar Sejak",
    userIdLabel: "ID Pengguna",
    copyIdTitle: "Salin ID Pengguna",
    copiedToast: "ID Pengguna disalin ke papan klip",
    roleDescAdmin:
      "Akses penuh ke seluruh artikel, portofolio proyek, moderasi komentar, dan manajemen pengguna.",
    roleDescPenulis:
      "Akses penulisan dan pengelolaan artikel blog serta diskusi pembaca melalui panel dashboard.",
    roleDescUser:
      "Akses penuh untuk berdiskusi pada artikel blog dengan identitas terverifikasi dan pengelolaan profil pribadi.",
    exploreTitle: "Jelajahi SatuDev",
    exploreBlogTitle: "Blog & Artikel",
    exploreBlogDesc: "Baca wawasan teknologi dan ikuti diskusi.",
    exploreProjectsTitle: "Portofolio Proyek",
    exploreProjectsDesc: "Lihat karya website dan aplikasi SatuDev.",
    exploreContactTitle: "Diskusikan Proyek",
    exploreContactDesc: "Hubungi tim SatuDev untuk kebutuhan digital Anda.",
    exploreDashboardTitle: "Workspace Dashboard",
    exploreDashboardDesc: "Kelola publikasi konten dan operasional.",
    tabGeneral: "Informasi Profil",
    tabSecurity: "Keamanan & Sandi",
    generalTitle: "Informasi Profil Publik",
    generalDesc:
      "Nama dan foto profil Anda akan ditampilkan pada menu navigasi serta saat berinteraksi di kolom komentar artikel.",
    nameLabel: "Nama Lengkap",
    namePlaceholder: "Masukkan nama tampilan Anda",
    nameRequiredError: "Nama lengkap wajib diisi.",
    emailLabel: "Alamat Email",
    emailHint:
      "Alamat email dikunci karena digunakan sebagai kredensial masuk utama akun Anda.",
    avatarUrlLabel: "URL Foto Profil (Opsional)",
    avatarUrlPlaceholder: "https://contoh.com/foto-profil.jpg",
    avatarUrlHint:
      "Unggah langsung melalui tombol kamera pada foto di atas (maks. 5 MB: JPG, PNG, WEBP, GIF) atau tempel tautan gambar eksternal.",
    resetAvatar: "Hapus Foto",
    saveProfile: "Simpan Perubahan",
    savingProfile: "Menyimpan...",
    profileSavedToast: "Profil berhasil diperbarui.",
    profileErrorToast: "Gagal memperbarui profil.",
    securityTitle: "Perbarui Kata Sandi",
    securityDesc:
      "Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda di seluruh perangkat.",
    showPasswordLabel: "Tampilkan kata sandi",
    hidePasswordLabel: "Sembunyikan kata sandi",
    passwordScreenWarning:
      "Peringatan: mengaktifkan tombol ini akan menampilkan kata sandi Anda di layar.",
    currentPasswordLabel: "Kata Sandi Saat Ini",
    currentPasswordPlaceholder: "Masukkan kata sandi saat ini",
    newPasswordLabel: "Kata Sandi Baru",
    newPasswordPlaceholder: "Minimal 6 karakter",
    newPasswordHint: "Gunakan minimal 6 karakter kombinasi huruf dan angka.",
    confirmPasswordLabel: "Konfirmasi Kata Sandi Baru",
    confirmPasswordPlaceholder: "Ulangi kata sandi baru",
    revokeSessionsLabel:
      "Keluarkan sesi masuk pada perangkat lain setelah kata sandi diperbarui",
    passwordIncompleteError: "Mohon lengkapi seluruh kolom kata sandi.",
    passwordMinError: "Kata sandi baru minimal 6 karakter.",
    passwordMismatchError: "Kata sandi baru dan konfirmasi belum cocok.",
    savePassword: "Perbarui Kata Sandi",
    savingPassword: "Memperbarui...",
    passwordSavedToast: "Kata sandi berhasil diperbarui.",
    passwordErrorToast: "Gagal memperbarui kata sandi.",
    sessionMissingTitle: "Sesi Masuk Berakhir",
    sessionMissingDesc:
      "Silakan masuk kembali untuk mengakses dan mengelola profil akun Anda.",
    signInAgain: "Masuk ke Akun",
  },
  en: {
    breadcrumbHome: "Home",
    breadcrumbProfile: "Account Profile",
    badge: "SatuDev Account",
    heroSubtitle:
      "Manage your display identity, profile photo, and account password security across SatuDev.",
    openDashboard: "Open Dashboard",
    logout: "Sign Out",
    verified: "Verified",
    activeAccount: "Active Account",
    joinedPrefix: "Joined",
    uploadAvatarLabel: "Upload a new profile photo",
    uploadAvatarSuccess:
      "Profile photo uploaded. Click Save Changes to apply it.",
    uploadAvatarError: "Failed to upload profile photo.",
    summaryTitle: "Account Summary",
    roleLabel: "Access Role",
    statusLabel: "Email Status",
    memberSinceLabel: "Member Since",
    userIdLabel: "User ID",
    copyIdTitle: "Copy User ID",
    copiedToast: "User ID copied to clipboard",
    roleDescAdmin:
      "Full administrative access to articles, project portfolio, comment moderation, and user management.",
    roleDescPenulis:
      "Author access to write and manage blog articles and reader discussions from the dashboard.",
    roleDescUser:
      "Member access to participate in blog discussions with your verified identity and manage personal settings.",
    exploreTitle: "Explore SatuDev",
    exploreBlogTitle: "Blog & Articles",
    exploreBlogDesc: "Read engineering insights and join discussions.",
    exploreProjectsTitle: "Project Portfolio",
    exploreProjectsDesc: "Browse web and mobile apps built by SatuDev.",
    exploreContactTitle: "Discuss a Project",
    exploreContactDesc: "Reach out to our team for custom software solutions.",
    exploreDashboardTitle: "Dashboard Workspace",
    exploreDashboardDesc: "Manage content publications and operations.",
    tabGeneral: "Profile Details",
    tabSecurity: "Password & Security",
    generalTitle: "Public Profile Information",
    generalDesc:
      "Your display name and photo appear in the navigation bar and when commenting on blog articles.",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your display name",
    nameRequiredError: "Full name is required.",
    emailLabel: "Email Address",
    emailHint:
      "Your email address is locked because it serves as your primary sign-in identifier.",
    avatarUrlLabel: "Profile Photo URL (Optional)",
    avatarUrlPlaceholder: "https://example.com/avatar.jpg",
    avatarUrlHint:
      "Upload directly using the camera button on your avatar above (max 5 MB: JPG, PNG, WEBP, GIF) or paste an image URL.",
    resetAvatar: "Remove Photo",
    saveProfile: "Save Changes",
    savingProfile: "Saving...",
    profileSavedToast: "Profile updated successfully.",
    profileErrorToast: "Failed to update profile.",
    securityTitle: "Change Password",
    securityDesc:
      "Use a strong password to keep your SatuDev account protected across devices.",
    showPasswordLabel: "Show passwords",
    hidePasswordLabel: "Hide passwords",
    passwordScreenWarning:
      "Warning: activating this toggle will display your password on the screen.",
    currentPasswordLabel: "Current Password",
    currentPasswordPlaceholder: "Enter your current password",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "At least 6 characters",
    newPasswordHint: "Use at least 6 characters combining letters and numbers.",
    confirmPasswordLabel: "Confirm New Password",
    confirmPasswordPlaceholder: "Re-enter your new password",
    revokeSessionsLabel:
      "Sign out active sessions on other devices after changing password",
    passwordIncompleteError: "Please fill in all password fields.",
    passwordMinError: "New password must be at least 6 characters.",
    passwordMismatchError: "New password and confirmation do not match.",
    savePassword: "Update Password",
    savingPassword: "Updating...",
    passwordSavedToast: "Password updated successfully.",
    passwordErrorToast: "Failed to update password.",
    sessionMissingTitle: "Session Expired",
    sessionMissingDesc:
      "Please sign in again to access and manage your account profile.",
    signInAgain: "Sign In",
  },
} as const;

function ProfileLoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 overflow-hidden shadow-lg">
        <div className="h-28 bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="px-6 sm:px-8 pb-7">
          <div className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="space-y-2.5 flex-1 pt-2">
              <div className="h-7 w-52 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-4 w-72 max-w-full rounded-md bg-slate-200/80 dark:bg-slate-700/70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 animate-pulse" />
          <div className="h-52 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 animate-pulse" />
        </div>
        <div className="lg:col-span-8">
          <div className="h-[440px] rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useUser();
  const updateStoreUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Profile form state
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [nameError, setNameError] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Metadata copy state
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "security" || tab === "general") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleTabSelect = (tab: "general" | "security") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "general") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `/profile?${query}` : "/profile", { scroll: false });
  };

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
      if (!res.ok) {
        throw new Error(result.error || copy.uploadAvatarError);
      }

      setImage(result.url);
      if (activeTab !== "general") {
        setActiveTab("general");
      }
      toast.success(copy.uploadAvatarSuccess);
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(
        error instanceof Error ? error.message : copy.uploadAvatarError
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    if (!trimmedName) {
      setNameError(copy.nameRequiredError);
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await authClient.updateUser({
        name: trimmedName,
        image: trimmedImage || undefined,
      });

      if (res.error) {
        throw new Error(res.error.message || copy.profileErrorToast);
      }

      updateStoreUser({
        name: trimmedName,
        image: trimmedImage || undefined,
      });
      window.dispatchEvent(new Event("auth-sync"));
      toast.success(copy.profileSavedToast);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(
        error instanceof Error ? error.message : copy.profileErrorToast
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const validateNewPasswordBlur = () => {
    if (newPassword && newPassword.length < 6) {
      setPasswordError(copy.passwordMinError);
    }
  };

  const validateConfirmPasswordBlur = () => {
    if (confirmPassword && newPassword && confirmPassword !== newPassword) {
      setPasswordError(copy.passwordMismatchError);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(copy.passwordIncompleteError);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(copy.passwordMinError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(copy.passwordMismatchError);
      return;
    }

    setPasswordError("");
    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });

      if (res.error) {
        throw new Error(res.error.message || copy.passwordErrorToast);
      }

      toast.success(copy.passwordSavedToast);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(
        error instanceof Error ? error.message : copy.passwordErrorToast
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCopyUserId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      toast.success(copy.copiedToast);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Clipboard API fallback ignored if restricted
    }
  };

  if (isAuthLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-300">
            <Lock aria-hidden="true" className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {copy.sessionMissingTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {copy.sessionMissingDesc}
          </p>
          <div className="pt-2">
            <Link href="/auth/signin?callbackUrl=/profile">
              <Button className="min-h-11 px-6 bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500">
                {copy.signInAgain}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canAccessDashboard = user.role === "admin" || user.role === "penulis";
  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        language === "id" ? "id-ID" : "en-US",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "-";

  const roleDescription =
    user.role === "admin"
      ? copy.roleDescAdmin
      : user.role === "penulis"
        ? copy.roleDescPenulis
        : copy.roleDescUser;

  return (
    <>
      {/* Top Hero Wash matching Landing Page HeroTemplate */}
      <section className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-primary/10 via-purple-600/5 to-transparent dark:from-purple-950/35 dark:via-slate-900/60 dark:to-transparent">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-10 md:pt-12 md:pb-12">
          {/* Breadcrumb & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              <Link
                href="/"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {copy.breadcrumbHome}
              </Link>
              <ChevronRight aria-hidden="true" className="h-4 w-4 opacity-60" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {copy.breadcrumbProfile}
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2.5">
              {canAccessDashboard && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 min-h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>{copy.openDashboard}</span>
                </Link>
              )}

              <LogoutButton className="inline-flex items-center gap-2 min-h-10 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-white/90 dark:bg-slate-800/90 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-xs hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50 cursor-pointer">
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span>{copy.logout}</span>
              </LogoutButton>
            </div>
          </div>

          {/* Section Title */}
          <div className="space-y-2.5 mb-8">
            <div className="inline-block rounded-lg bg-purple-600 text-white dark:bg-blue-300 dark:text-slate-950 px-3 py-1 text-xs font-bold tracking-wide">
              {copy.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-purple-300 bg-clip-text text-transparent">
              {copy.breadcrumbProfile}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {copy.heroSubtitle}
            </p>
          </div>

          {/* Identity Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-800/95 shadow-lg overflow-hidden"
          >
            {/* Brand Gradient Cover */}
            <div
              aria-hidden="true"
              className="h-24 sm:h-28 w-full bg-gradient-to-r from-primary via-indigo-900 to-purple-600 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-700 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-7">
              <div className="-mt-12 sm:-mt-14 flex flex-col sm:flex-row items-center sm:items-end gap-5">
                {/* Avatar + Accessible Upload Trigger */}
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-white dark:ring-slate-800 overflow-hidden bg-gradient-to-r from-primary to-purple-600 dark:from-purple-600 dark:to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <input
                    type="file"
                    id="profile-avatar-upload"
                    name="avatarFile"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingImage}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="profile-avatar-upload"
                    title={copy.uploadAvatarLabel}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800 peer-focus-visible:ring-2 peer-focus-visible:ring-purple-600 peer-focus-visible:ring-offset-2"
                  >
                    {isUploadingImage ? (
                      <Loader2
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400"
                      />
                    ) : (
                      <Camera aria-hidden="true" className="h-4 w-4" />
                    )}
                    <span className="sr-only">{copy.uploadAvatarLabel}</span>
                  </label>
                </div>

                {/* User Primary Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-full">
                      {user.name}
                    </h2>
                    <UserRoleBadge />
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <Mail
                        aria-hidden="true"
                        className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400"
                      />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Calendar
                        aria-hidden="true"
                        className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400"
                      />
                      <span>
                        {copy.joinedPrefix} {formattedJoinDate}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <BadgeCheck aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {user.emailVerified ? copy.verified : copy.activeAccount}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Two-Column Settings & Summary Grid */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Summary & Explore Links */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Account Metadata Summary Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 dark:bg-purple-400/15 text-purple-600 dark:text-purple-300">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {copy.summaryTitle}
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {roleDescription}
              </p>

              <dl className="divide-y divide-slate-200/80 dark:divide-slate-700/70 text-sm">
                <div className="py-3 flex items-center justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {copy.roleLabel}
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {getRoleDisplayName(user.role)}
                  </dd>
                </div>

                <div className="py-3 flex items-center justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {copy.statusLabel}
                  </dt>
                  <dd className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {user.emailVerified ? copy.verified : copy.activeAccount}
                  </dd>
                </div>

                <div className="py-3 flex items-center justify-between gap-3">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {copy.memberSinceLabel}
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formattedJoinDate}
                  </dd>
                </div>

                <div className="pt-3 flex flex-col gap-1.5">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {copy.userIdLabel}
                  </dt>
                  <dd className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                    <code className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                      {user.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyUserId(user.id)}
                      title={copy.copyIdTitle}
                      aria-label={copy.copyIdTitle}
                      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId ? (
                        <Check aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy aria-hidden="true" className="h-4 w-4" />
                      )}
                    </button>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Navigation Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {copy.exploreTitle}
              </h2>

              <div className="space-y-2.5">
                {canAccessDashboard && (
                  <Link
                    href="/dashboard"
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/25 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <LayoutDashboard
                        aria-hidden="true"
                        className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {copy.exploreDashboardTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {copy.exploreDashboardDesc}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0"
                    />
                  </Link>
                )}

                <Link
                  href="/blog"
                  className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/25 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen
                      aria-hidden="true"
                      className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {copy.exploreBlogTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {copy.exploreBlogDesc}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0"
                  />
                </Link>

                <Link
                  href="/projects"
                  className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/25 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FolderKanban
                      aria-hidden="true"
                      className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {copy.exploreProjectsTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {copy.exploreProjectsDesc}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0"
                  />
                </Link>

                <Link
                  href="/#contact"
                  className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/25 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare
                      aria-hidden="true"
                      className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {copy.exploreContactTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {copy.exploreContactDesc}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0"
                  />
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Right Column: Edit Profile & Security Forms */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Accessible Tab Bar */}
            <div
              role="tablist"
              aria-label={copy.breadcrumbProfile}
              className="inline-flex w-full sm:w-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-1.5 shadow-xs gap-1.5"
            >
              <button
                type="button"
                role="tab"
                id="tab-general"
                aria-selected={activeTab === "general"}
                aria-controls="panel-general"
                onClick={() => handleTabSelect("general")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white dark:from-purple-600 dark:to-indigo-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserIcon aria-hidden="true" className="h-4 w-4" />
                <span>{copy.tabGeneral}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-security"
                aria-selected={activeTab === "security"}
                aria-controls="panel-security"
                onClick={() => handleTabSelect("security")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white dark:from-purple-600 dark:to-indigo-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <KeyRound aria-hidden="true" className="h-4 w-4" />
                <span>{copy.tabSecurity}</span>
              </button>
            </div>

            {/* Panel 1: Edit Profile */}
            {activeTab === "general" && (
              <div
                role="tabpanel"
                id="panel-general"
                aria-labelledby="tab-general"
                className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-6 sm:p-8 shadow-sm"
              >
                <div className="border-b border-slate-200/80 dark:border-slate-700/70 pb-5 mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {copy.generalTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {copy.generalDesc}
                  </p>
                </div>

                <form
                  method="post"
                  onSubmit={handleUpdateProfile}
                  className="space-y-6"
                  noValidate
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="profile-full-name"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {copy.nameLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="profile-full-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      onBlur={() => {
                        if (!name.trim()) setNameError(copy.nameRequiredError);
                      }}
                      aria-invalid={Boolean(nameError)}
                      aria-describedby={nameError ? "profile-name-error" : undefined}
                      placeholder={copy.namePlaceholder}
                      className="min-h-12 text-base rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
                    />
                    {nameError && (
                      <p
                        id="profile-name-error"
                        aria-live="polite"
                        className="text-xs font-medium text-red-600 dark:text-red-400 pt-0.5"
                      >
                        {nameError}
                      </p>
                    )}
                  </div>

                  {/* Locked Email */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="profile-email"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {copy.emailLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="profile-email"
                        name="email"
                        type="email"
                        value={user.email}
                        readOnly
                        disabled
                        aria-describedby="profile-email-hint"
                        className="min-h-12 text-base rounded-xl border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 pr-10 cursor-not-allowed opacity-100"
                      />
                      <Lock
                        aria-hidden="true"
                        className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2"
                      />
                    </div>
                    <p
                      id="profile-email-hint"
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {copy.emailHint}
                    </p>
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="profile-avatar-url"
                        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                      >
                        {copy.avatarUrlLabel}
                      </Label>
                      {image && (
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                          <span>{copy.resetAvatar}</span>
                        </button>
                      )}
                    </div>
                    <Input
                      id="profile-avatar-url"
                      name="image"
                      type="url"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder={copy.avatarUrlPlaceholder}
                      aria-describedby="profile-avatar-hint"
                      className="min-h-12 text-base rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
                    />
                    <p
                      id="profile-avatar-hint"
                      className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed"
                    >
                      {copy.avatarUrlHint}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="min-h-12 px-7 rounded-xl font-semibold text-base bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 cursor-pointer"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2
                            aria-hidden="true"
                            className="h-4 w-4 mr-2 animate-spin"
                          />
                          {copy.savingProfile}
                        </>
                      ) : (
                        copy.saveProfile
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Panel 2: Security & Password */}
            {activeTab === "security" && (
              <div
                role="tabpanel"
                id="panel-security"
                aria-labelledby="tab-security"
                className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-6 sm:p-8 shadow-sm"
              >
                <div className="border-b border-slate-200/80 dark:border-slate-700/70 pb-5 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {copy.securityTitle}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {copy.securityDesc}
                    </p>
                  </div>

                  {/* Accessible Unmask Password Toggle */}
                  <div>
                    <button
                      type="button"
                      aria-pressed={showPasswords}
                      aria-label={
                        showPasswords
                          ? copy.hidePasswordLabel
                          : copy.showPasswordLabel
                      }
                      aria-describedby="password-toggle-warning"
                      onClick={() => setShowPasswords((prev) => !prev)}
                      className="inline-flex items-center gap-2 min-h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {showPasswords ? (
                        <EyeOff aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <Eye aria-hidden="true" className="h-4 w-4" />
                      )}
                      <span>
                        {showPasswords
                          ? copy.hidePasswordLabel
                          : copy.showPasswordLabel}
                      </span>
                    </button>
                    <span id="password-toggle-warning" className="sr-only">
                      {copy.passwordScreenWarning}
                    </span>
                  </div>
                </div>

                <form
                  method="post"
                  onSubmit={handleChangePassword}
                  className="space-y-6"
                  noValidate
                >
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="current-password"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {copy.currentPasswordLabel}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="current-password"
                      name="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder={copy.currentPasswordPlaceholder}
                      className="min-h-12 text-base rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* New & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="new-password"
                        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                      >
                        {copy.newPasswordLabel}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        type={showPasswords ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        onBlur={validateNewPasswordBlur}
                        aria-describedby="new-password-constraints"
                        placeholder={copy.newPasswordPlaceholder}
                        className="min-h-12 text-base rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
                      />
                      <p
                        id="new-password-constraints"
                        className="text-xs text-slate-500 dark:text-slate-400"
                      >
                        {copy.newPasswordHint}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                      >
                        {copy.confirmPasswordLabel}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPasswords ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        onBlur={validateConfirmPasswordBlur}
                        placeholder={copy.confirmPasswordPlaceholder}
                        className="min-h-12 text-base rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Revoke Other Sessions */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-900/50 p-4">
                    <label
                      htmlFor="revoke-other-sessions"
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input
                        id="revoke-other-sessions"
                        name="revokeOtherSessions"
                        type="checkbox"
                        checked={revokeOtherSessions}
                        onChange={(e) =>
                          setRevokeOtherSessions(e.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 rounded accent-purple-600 dark:accent-purple-400 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-200 leading-snug">
                        {copy.revokeSessionsLabel}
                      </span>
                    </label>
                  </div>

                  {/* Dynamic Error Announcement */}
                  {passwordError && (
                    <p
                      role="alert"
                      aria-live="polite"
                      className="rounded-xl border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                    >
                      {passwordError}
                    </p>
                  )}

                  <div className="pt-1 flex flex-col sm:flex-row sm:justify-end">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="min-h-12 px-7 rounded-xl font-semibold text-base bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 cursor-pointer"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2
                            aria-hidden="true"
                            className="h-4 w-4 mr-2 animate-spin"
                          />
                          {copy.savingPassword}
                        </>
                      ) : (
                        copy.savePassword
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<ProfileLoadingSkeleton />}>
          <ProfilePageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

