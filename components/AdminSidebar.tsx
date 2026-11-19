"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  CalendarClock,
  Award,
  ChevronLeft,
  Menu,
  X,
  Activity,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { Badge } from "./Badge";

interface NavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  exact: boolean;
  badge?: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const navItems: NavItem[] = [
    {
      title: "لوحة التحكم العامة",
      subtitle: "المؤشرات والأداء اللحظي",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "إدارة الأطباء والطلاب",
      subtitle: "سجلات المقيمين والدفعات",
      href: "/admin/students",
      icon: Users,
      exact: false,
    },
    {
      title: "بنك وإدارة الاختبارات",
      subtitle: "الأسئلة والسيناريوهات السريرية",
      href: "/admin/exams",
      icon: FileQuestion,
      exact: false,
    },
    {
      title: "جدولة الاختبارات",
      subtitle: "الجماعية والفردية التعويضية",
      href: "/admin/schedules",
      icon: CalendarClock,
      exact: false,
    },
    {
      title: "النتائج والتقارير",
      subtitle: "مصفوفة الدرجات والتحليل",
      href: "/admin/results",
      icon: Award,
      exact: false,
    },
  ];

  // Identify current section for mobile top banner
  const currentItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  ) || navItems[0];

  const CurrentIcon = currentItem.icon;

  return (
    <>
      {/* ============================================================== */}
      {/* 📱 Mobile Top Bar & Drawer Trigger (Only visible on mobile)     */}
      {/* ============================================================== */}
      <div className="md:hidden sticky top-16 z-30 w-full bg-[#070b16]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {currentItem.title}
            </span>
            <span className="text-[10px] text-cyan-400 font-medium block">
              {currentItem.subtitle}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-4 h-4" />
          <span>القائمة</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 📱 Mobile Slide-Over Drawer (High-Tech Off-Canvas)             */}
      {/* ============================================================== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-84 max-w-[85vw] h-full bg-[#080d1a] border-l border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col p-5 z-10 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Image
                    src="/logo.webp"
                    alt="MED ZONE"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-white block">
                    MED ZONE
                  </span>
                  <span className="text-[10px] text-[#00f5a0] font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                    قمرة القيادة الأكاديمية
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              الوحدات والأنظمة السريرية
            </div>

            <nav className="space-y-1.5 flex-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/40 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-cyan-500/20 text-[#00f5a0] border border-[#00f5a0]/40"
                            : "bg-slate-900 text-slate-400 border border-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft
                      className={`w-4 h-4 ${
                        isActive ? "text-[#00f5a0] translate-x-0.5" : "text-slate-600"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Footer Telemetry in Mobile Drawer */}
            <div className="pt-4 mt-6 border-t border-white/10 space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/20 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-white mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#00f5a0] animate-pulse" />
                  <span>محرك الأمان السحابي نشط</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Engine v2.0 • Ultra Low Latency
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🖥️ Desktop Sidebar (Permanent, High-End Glassmorphic HUD)      */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-72 bg-[#080d1a]/85 border-l border-white/10 shrink-0 flex-col md:min-h-[calc(100vh-4rem)] p-5 backdrop-blur-2xl">
        {/* Unit Identity Badge */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/25 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/30 p-1 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Image
              src="/logo.webp"
              alt="شعار الكلية"
              width={38}
              height={38}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-xs font-black text-white block tracking-wide">
              قمرة القيادة الأكاديمية
            </span>
            <span className="text-[10px] text-[#00f5a0] font-bold block flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
              MED ZONE • كلية التخدير
            </span>
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2.5">
          الوحدات والأنظمة
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/40 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.18)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-cyan-500/20 text-[#00f5a0] border border-[#00f5a0]/40 shadow-[0_0_12px_rgba(0,245,160,0.2)]"
                        : "bg-slate-900/90 text-slate-400 border border-white/5 group-hover:text-cyan-300 group-hover:border-cyan-500/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronLeft
                  className={`w-4 h-4 transition-transform ${
                    isActive
                      ? "text-[#00f5a0] -translate-x-1"
                      : "text-slate-600 group-hover:text-slate-400 group-hover:-translate-x-0.5"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* System Telemetry Footer */}
        <div className="pt-4 mt-auto border-t border-white/10 text-center space-y-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>حالة النظام:</span>
              <span className="text-[#00f5a0] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                متصل 100%
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>استقرار المحرك:</span>
              <span className="text-cyan-300">Ultra-Secure</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">
            MED ZONE Architecture v2.0
          </span>
        </div>
      </aside>
    </>
  );
}
