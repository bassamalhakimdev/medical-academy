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
  CheckCircle2,
} from "lucide-react";

interface NavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  exact: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
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
      title: "لوحة التحكم",
      subtitle: "المؤشرات والأداء العام",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "إدارة الأطباء والطلاب",
      subtitle: "الحسابات والتفعيل الأكاديمي",
      href: "/admin/students",
      icon: Users,
      exact: false,
    },
    {
      title: "بنك وإدارة الاختبارات",
      subtitle: "الأسئلة والسيناريوهات (MCQ)",
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
      subtitle: "سجل الدرجات ونسب النجاح",
      href: "/admin/results",
      icon: Award,
      exact: false,
    },
  ];

  const currentItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  ) || navItems[0];

  const CurrentIcon = currentItem.icon;

  return (
    <>
      {/* ============================================================== */}
      {/* 📱 Mobile Top Bar & Drawer Trigger                             */}
      {/* ============================================================== */}
      <div className="md:hidden sticky top-16 z-30 w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {currentItem.title}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {currentItem.subtitle}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-4 h-4" />
          <span>القائمة</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 📱 Mobile Slide-Over Drawer                                    */}
      {/* ============================================================== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col p-5 z-10 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                  <Image
                    src="/logo.webp"
                    alt="MED ZONE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    MED ZONE
                  </span>
                  <span className="text-[10px] text-teal-700 font-bold block">
                    إدارة الامتحانات والطلاب
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.title}</span>
                    </div>
                    <ChevronLeft
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-white/80 translate-x-0.5" : "text-slate-300"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="pt-4 mt-6 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">
                MED ZONE Platform v1.0
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                النظام نشط ومستقر
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🖥️ Desktop Sidebar                                             */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 bg-white border-l border-slate-200 shrink-0 flex-col md:min-h-[calc(100vh-4rem)] p-4">
        {/* Brand Banner */}
        <div className="mb-4 px-3 py-2.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
            <Image
              src="/logo.webp"
              alt="شعار الكلية"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-xs font-bold block text-white">إدارة الامتحانات</span>
            <span className="text-[10px] text-teal-300 block font-medium">MED ZONE • الكلية</span>
          </div>
        </div>

        {/* Navigation Items */}
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.title}</span>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? "text-white/80 translate-x-0.5" : "text-slate-300"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="pt-4 mt-auto border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 block font-mono">
            Medical Platform v1.0
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            النظام السحابي متصل
          </span>
        </div>
      </aside>
    </>
  );
}
