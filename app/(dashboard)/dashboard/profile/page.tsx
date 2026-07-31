"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { UserRoleBadge } from "@/components/auth/UserRoleBadge";
import { getRoleDisplayName } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  Lock,
  BadgeCheck,
  UserCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useUser();

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
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  // Handle avatar upload via existing upload API
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
      toast.success("Avatar image uploaded! Click Save to apply changes.");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle profile update
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

      toast.success("Profile updated successfully!");
      // Trigger custom auth sync event so navbar & stores update immediately
      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
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

      toast.success("Password changed successfully!");
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
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-600">
        User not logged in.
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Top Banner & Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Overlay Upload Button */}
          <div className="relative group">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
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
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md cursor-pointer transition transform hover:scale-105"
              title="Change Profile Picture"
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* User Info Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{user.name}</h1>
              <UserRoleBadge />
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
                {user.emailVerified ? "Verified Email" : "Active Account"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-purple-400" />
                Joined {joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">User Role</p>
            <p className="text-base font-semibold text-slate-900">{getRoleDisplayName(user.role)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Status</p>
            <p className="text-base font-semibold text-emerald-600">Active & Verified</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Access Rights</p>
            <p className="text-base font-semibold text-slate-900">
              {user.role === "admin" ? "Full Control" : user.role === "penulis" ? "Content Creator" : "Standard Access"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Content */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Navigation Bar */}
        <div className="border-b bg-slate-50/50 px-6 pt-4 flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "general"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="h-4 w-4" />
            General Profile
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "security"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Key className="h-4 w-4" />
            Security & Password
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "overview"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Account Overview
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab 1: General Profile */}
          {activeTab === "general" && (
            <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-slate-50 text-slate-500 cursor-not-allowed pr-10"
                  />
                  <Lock className="h-4 w-4 absolute right-3 top-3 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Email address is linked to your authentication credentials.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url" className="text-slate-700">Profile Picture URL</Label>
                <Input
                  id="avatar-url"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-slate-500">
                  Provide an image URL or use the camera icon on your avatar banner above to upload a local file.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isUpdatingProfile || isUploadingImage}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: Security */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 3: Account Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-2xl">
              <div className="rounded-xl border bg-slate-50/50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  Account Identifiers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">User ID</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono bg-white border px-2 py-1 rounded text-slate-800 truncate max-w-[200px]">
                        {user.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.id)}
                        className="p-1 hover:bg-white rounded border text-slate-500 hover:text-slate-900 transition"
                        title="Copy User ID"
                      >
                        {copiedId ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Assigned Role</span>
                    <div className="mt-1">
                      <UserRoleBadge />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50/50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Role Capabilities & Permissions
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Access Admin Dashboard & Analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Manage Projects Portfolio (Create, Read, Update, Delete)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Manage Posts, Categories, Comments, and Tags</span>
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
