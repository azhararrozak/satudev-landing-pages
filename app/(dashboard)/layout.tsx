'use client';

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  FolderKanban,
  FolderTree,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Tags,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useUser } from "@/lib/hooks/use-auth";
import { normalizeRole } from "@/lib/stores/auth-store";

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutGrid },
  { href: "/dashboard/posts", label: "Artikel", icon: FileText },
  { href: "/dashboard/projects", label: "Proyek", icon: FolderKanban },
  { href: "/dashboard/comments", label: "Komentar", icon: MessageSquare },
];

const secondaryNav: NavItem[] = [
  { href: "/dashboard/categories", label: "Kategori", icon: FolderTree },
  { href: "/dashboard/tags", label: "Tag", icon: Tags },
  { href: "/dashboard/users", label: "Pengguna", icon: Users, adminOnly: true },
  { href: "/dashboard/profile", label: "Profil Akun", icon: UserCircle },
];

const allNavItems: NavItem[] = [...primaryNav, ...secondaryNav];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const rawDrawerId = useId();
  const drawerId = `gamma-drawer-${rawDrawerId.replace(/:/g, "")}`;

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const shellContentRef = useRef<HTMLDivElement>(null);
  const isDrawerOpenRef = useRef(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  const userRole = user ? normalizeRole(user.role) : null;
  const canAccessDashboard = userRole === "admin" || userRole === "penulis";
  const visibleSecondaryNav = secondaryNav.filter(
    (item) => !item.adminOnly || userRole === "admin"
  );

  const activeNav =
    allNavItems.find((item) => isNavItemActive(pathname, item.href)) ?? primaryNav[0];

  const openDrawer = useCallback(async () => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    if (!drawer || !scroller) return;

    try {
      if (!drawer.matches(":popover-open")) {
        drawer.showPopover();
      }
    } catch {
      return;
    }

    if (typeof CSS !== "undefined" && !CSS.supports("scroll-initial-target", "nearest")) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: "instant" });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    }

    scroller.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  const closeDrawer = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/auth/signin?callbackUrl=/dashboard");
      return;
    }

    if (!canAccessDashboard) {
      router.replace("/");
    }
  }, [isAuthenticated, user, canAccessDashboard, isLoading, router]);

  useEffect(() => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    const shellContent = shellContentRef.current;

    if (!drawer || !scroller || !sheet || !shellContent || typeof window === "undefined") {
      return;
    }

    const visibleThreshold = Math.min(0.05, Math.max(0.001, 1 / Math.max(window.innerWidth, 320)));

    const onOpened = () => {
      isDrawerOpenRef.current = true;
      shellContent.inert = true;
      setDrawerExpanded(true);
      sheet.focus();
    };

    const onClosed = () => {
      isDrawerOpenRef.current = false;
      shellContent.inert = false;
      setDrawerExpanded(false);
      try {
        if (drawer.matches(":popover-open")) {
          drawer.hidePopover();
        }
      } catch {
        // Ignore if already hidden
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold) {
          onClosed();
        } else if (entry.intersectionRatio >= 0.98) {
          onOpened();
        }
      },
      { root: drawer, threshold: [visibleThreshold, 0.98, 1] }
    );
    observer.observe(sheet);

    let removeScrollFallback: (() => void) | undefined;
    if (typeof CSS !== "undefined" && !CSS.supports("animation-timeline: scroll()")) {
      const handleScroll = () => {
        const width = Math.max(1, sheet.offsetWidth);
        const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / width));
        drawer.style.setProperty("--drawer-backdrop", String(ratio));
      };
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      removeScrollFallback = () => scroller.removeEventListener("scroll", handleScroll);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDrawerOpenRef.current) {
        closeDrawer();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && isDrawerOpenRef.current) {
        onClosed();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      removeScrollFallback?.();
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      shellContent.inert = false;
    };
  }, [closeDrawer, isLoading, isAuthenticated, canAccessDashboard]);

  useEffect(() => {
    if (isDrawerOpenRef.current) {
      closeDrawer();
    }
  }, [pathname, closeDrawer]);

  if (isLoading) {
    return (
      <div className="gamma-dashboard min-h-dvh px-4 py-6">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="h-14 rounded-full border border-[#dfdfe0] bg-white px-5 flex items-center justify-between">
            <div className="h-5 w-36 rounded-full bg-[#e8eefc] animate-pulse" />
            <div className="h-8 w-28 rounded-full bg-[#e8eefc] animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
            <div className="hidden lg:block h-[420px] rounded-[24px] border border-[#dfdfe0] bg-white p-4 space-y-3">
              <div className="h-4 w-20 rounded-full bg-[#e8eefc] animate-pulse" />
              <div className="h-10 rounded-[12px] bg-[#e8eefc]/70 animate-pulse" />
              <div className="h-10 rounded-[12px] bg-[#e8eefc]/40 animate-pulse" />
              <div className="h-10 rounded-[12px] bg-[#e8eefc]/40 animate-pulse" />
            </div>
            <div className="h-[460px] rounded-[24px] border border-[#dfdfe0] bg-white p-8 space-y-5">
              <div className="h-6 w-48 rounded-full bg-[#e8eefc] animate-pulse" />
              <div className="h-10 w-72 rounded-[12px] bg-[#e8eefc]/70 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="h-32 rounded-[24px] bg-[#e8eefc]/70 animate-pulse" />
                <div className="h-32 rounded-[24px] bg-[#e8eefc]/70 animate-pulse" />
                <div className="h-32 rounded-[24px] bg-[#e8eefc]/70 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="gamma-dashboard min-h-dvh flex items-center justify-center px-4">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white px-8 py-6 text-center">
          <p className="text-sm font-medium text-[#38383c]">Mengarahkan ke halaman masuk...</p>
        </div>
      </div>
    );
  }

  if (!canAccessDashboard) {
    return (
      <div className="gamma-dashboard min-h-dvh flex items-center justify-center px-4">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white px-8 py-6 text-center">
          <p className="text-sm font-medium text-[#38383c]">Akses terbatas. Mengalihkan halaman...</p>
        </div>
      </div>
    );
  }

  const renderNavSection = (title: string, items: NavItem[], onNavigate?: () => void) => (
    <div className="space-y-1.5">
      <p className="px-3 text-[11px] font-bold uppercase tracking-[0.5px] text-[#66666b]">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] transition-colors ${
                  active
                    ? "bg-[#e8eefc] font-bold text-[#002253]"
                    : "font-medium text-[#38383c] hover:bg-[#e8eefc]/55 hover:text-[#002253]"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-4 w-4 flex-shrink-0 transition-colors ${
                    active ? "text-[#0540ad]" : "text-[#66666b] group-hover:text-[#002253]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="gamma-dashboard min-h-dvh">
      {/* Mobile Swipeable Top-Layer Navigation Drawer */}
      <div
        ref={drawerRef}
        id={drawerId}
        popover="manual"
        className="gamma-drawer lg:hidden"
        onClick={(event) => {
          if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
            closeDrawer();
          }
        }}
      >
        <div ref={scrollerRef} className="gamma-drawer-scroller">
          <nav
            ref={sheetRef}
            tabIndex={-1}
            aria-label="Navigasi dashboard mobile"
            className="gamma-drawer-sheet p-4 focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-[#dfdfe0] pb-3.5">
              <Link
                href="/dashboard"
                onClick={closeDrawer}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002253] text-xs font-bold tracking-tight text-white">
                  S
                </span>
                <div className="leading-tight">
                  <span className="block text-[15px] font-bold tracking-[-0.02em] text-[#002253]">
                    Satudev
                  </span>
                  <span className="block text-[11px] font-medium text-[#66666b]">
                    satudev.web.id
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Tutup menu navigasi"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-[#002253] transition hover:bg-[#e8eefc]"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 py-5">
              {renderNavSection("Ruang Kerja", primaryNav, closeDrawer)}
              {renderNavSection("Taksonomi & Akun", visibleSecondaryNav, closeDrawer)}
            </div>

            <div className="space-y-2 border-t border-[#dfdfe0] pt-3.5">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                onClick={closeDrawer}
                className="flex h-10 w-full items-center justify-between rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
              >
                <span>Buka Situs Publik</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#66666b]" />
              </Link>
              <LogoutButton
                onLogoutComplete={closeDrawer}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#b53800] transition hover:bg-[#fff1ea] disabled:opacity-50"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span>Keluar Sesi</span>
              </LogoutButton>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Shell Content (Marked inert while mobile drawer is open) */}
      <div ref={shellContentRef}>
        {/* Sticky 56px Gamma Pill-Rail Topbar */}
        <header className="sticky top-0 z-20 px-3 pt-3 pb-2 sm:px-6">
          <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 rounded-full border border-[#dfdfe0] bg-white/95 px-3.5 sm:px-5 backdrop-blur-md shadow-[0_2px_10px_rgba(0,34,83,0.03)]">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={openDrawer}
                aria-label="Buka menu navigasi"
                aria-expanded={drawerExpanded}
                aria-controls={drawerId}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-[#002253] transition hover:bg-[#e8eefc] lg:hidden"
              >
                <Menu aria-hidden="true" className="h-4 w-4" />
              </button>

              <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002253] text-xs font-bold tracking-tight text-white">
                  S
                </span>
                <span className="text-[16px] font-bold tracking-[-0.02em] text-[#002253]">
                  Satudev
                </span>
              </Link>

              <span aria-hidden="true" className="text-[#dfdfe0] select-none">
                /
              </span>
              <span className="truncate text-sm font-medium text-[#66666b]">
                {activeNav.label}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
              >
                <span>satudev.web.id</span>
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-[#66666b]" />
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-3 pt-3 pb-12 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)]">
          {/* Desktop Sidebar Card */}
          <aside
            aria-label="Navigasi ruang kerja"
            className="hidden lg:flex lg:flex-col lg:justify-between h-fit sticky top-[80px] rounded-[24px] border border-[#dfdfe0] bg-white p-4 space-y-6"
          >
            <div className="space-y-6">
              {renderNavSection("Ruang Kerja", primaryNav)}
              {renderNavSection("Taksonomi & Akun", visibleSecondaryNav)}
            </div>

            <div className="border-t border-[#dfdfe0] pt-3.5">
              <LogoutButton className="flex h-10 w-full items-center justify-center gap-2 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#38383c] transition hover:border-[#f3c3af] hover:bg-[#fff1ea] hover:text-[#b53800] disabled:opacity-50 disabled:cursor-not-allowed">
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span>Keluar Sesi</span>
              </LogoutButton>
            </div>
          </aside>

          {/* Main Content Column */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
