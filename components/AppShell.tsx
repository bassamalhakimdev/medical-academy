"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  CalendarDays,
  BarChart3,
  LogOut,
  UserRound,
  ChevronLeft,
  X,
} from "lucide-react";

interface AppShellProps {
  variant: "admin" | "student";
  user: {
    name: string;
    email: string;
    studentId?: string | null;
  };
  children: React.ReactNode;
}

const NAV = {
  admin: [
    { title: "لوحة التحكم", href: "/admin", icon: LayoutDashboard, exact: true },
    { title: "الطلاب", href: "/admin/students", icon: Users, exact: false },
    { title: "الاختبارات", href: "/admin/exams", icon: FileText, exact: false },
    { title: "الجدولة", href: "/admin/schedules", icon: CalendarDays, exact: false },
    { title: "النتائج", href: "/admin/results", icon: BarChart3, exact: false },
  ],
  student: [
    { title: "الرئيسية", href: "/student", icon: Home, exact: true },
    { title: "الاختبارات", href: "/student/exams", icon: FileText, exact: false },
    { title: "النتائج", href: "/student/results", icon: BarChart3, exact: false },
  ],
};

const PROFILE_HREF: Record<AppShellProps["variant"], string | null> = {
  admin: null,
  student: "/student/profile",
};

/** Matches Tailwind's `lg` breakpoint, where the sidebar is permanently visible. */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function AppShell({ variant, user, children }: AppShellProps) {
  const navItems = NAV[variant];
  const profileHref = PROFILE_HREF[variant];
  const homeHref = navItems[0].href;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + close on Escape while the drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // If the window grows to desktop size, the drawer is no longer needed
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

  // Logo: opens the drawer on mobile, goes home on desktop (sidebar is already visible)
  const onLogoClick = () => (isDesktop() ? router.push(homeHref) : setOpen(true));

  // Avatar: opens the drawer on mobile, opens the profile on desktop (if any)
  const onAvatarClick = () => {
    if (!isDesktop()) return setOpen(true);
    if (profileHref) router.push(profileHref);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const initials = user.name
    .replace(/^د\.\s*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  /** Profile → navigation → logout. Shared by the desktop sidebar and the mobile drawer. */
  const renderMenu = () => {
    const profileContent = (
      <>
        <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center shrink-0">
          {initials || <UserRound className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate" dir="ltr">
            {user.studentId || user.email}
          </p>
        </div>
      </>
    );

    return (
      <>
        {/* Profile */}
        <div className="px-3 py-4 border-b border-slate-100">
          {profileHref ? (
            <Link
              href={profileHref}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                pathname.startsWith(profileHref) ? "bg-slate-50" : "hover:bg-slate-50"
              }`}
            >
              {profileContent}
              <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5">{profileContent}</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-colors ${
                  active
                    ? "text-slate-900 font-bold bg-slate-50"
                    : "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {active && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-slate-900" />
                )}
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* ── Header (fixed) ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-white/90 backdrop-blur-lg border-b border-slate-200/70">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogoClick}
            aria-label="MED ZONE"
            aria-expanded={open}
            className="group flex items-center gap-3 cursor-pointer focus:outline-none"
          >
            <span className="relative w-10 h-10 rounded-full ring-1 ring-slate-200 bg-white p-1 flex items-center justify-center transition-all duration-300 group-hover:ring-slate-400 group-focus-visible:ring-2 group-focus-visible:ring-slate-900">
              <Image
                src="/logo.webp"
                alt="MED ZONE"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </span>
            <span className="text-[15px] font-bold tracking-[0.18em] text-slate-900" dir="ltr">
              MED ZONE
            </span>
          </button>

          <button
            type="button"
            onClick={onAvatarClick}
            title={user.name}
            aria-label={user.name}
            className="w-10 h-10 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center ring-4 ring-transparent hover:ring-slate-100 transition-all cursor-pointer"
          >
            {initials || <UserRound className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Desktop sidebar (always visible on wide screens) ──────── */}
      <aside className="hidden lg:flex fixed top-16 bottom-0 right-0 z-30 w-64 flex-col bg-white border-l border-slate-200/70">
        {renderMenu()}
      </aside>

      {/* ── Mobile drawer (opened from the logo) ──────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        />

        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Image src="/logo.webp" alt="MED ZONE" width={28} height={28} className="w-7 h-7 object-contain" />
              <span className="text-sm font-bold tracking-[0.18em] text-slate-900" dir="ltr">
                MED ZONE
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {renderMenu()}
        </aside>
      </div>

      {/* ── Content + footer (offset by the sidebar on desktop) ───── */}
      <div className="flex-1 flex flex-col pt-16 lg:pr-64">
        <main className="flex-1 w-full max-w-6xl mx-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>

        <footer className="border-t border-slate-200/70 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs text-slate-400">
            <span className="tracking-[0.18em] font-semibold text-slate-500" dir="ltr">
              MED ZONE
            </span>
            <span dir="ltr">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
