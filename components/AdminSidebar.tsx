"use client";

import React from "react";
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
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "لوحة التحكم",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "إدارة الأطباء والطلاب",
      href: "/admin/students",
      icon: Users,
      exact: false,
    },
    {
      title: "بنك وإدارة الاختبارات",
      href: "/admin/exams",
      icon: FileQuestion,
      exact: false,
    },
    {
      title: "جدولة الاختبارات",
      href: "/admin/schedules",
      icon: CalendarClock,
      exact: false,
    },
    {
      title: "النتائج والتقارير",
      href: "/admin/results",
      icon: Award,
      exact: false,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-l border-slate-200 shrink-0 flex flex-col md:min-h-[calc(100vh-4rem)] p-4">
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

      <div className="pt-4 mt-auto border-t border-slate-100 text-center">
        <span className="text-[10px] text-slate-400 block font-mono">
          Medical Academy Engine v1.0
        </span>
        <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
          ● Cloudflare D1 Active
        </span>
      </div>
    </aside>
  );
}
