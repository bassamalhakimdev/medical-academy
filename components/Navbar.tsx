"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Shield, GraduationCap } from "lucide-react";
import { Badge } from "./Badge";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: "admin" | "student";
    studentId?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={user?.role === "admin" ? "/admin" : "/student"} className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs group-hover:shadow-md group-hover:border-teal-500/40 transition-all overflow-hidden shrink-0">
            <Image
              src="/logo.webp"
              alt="شعار الكلية - MED ZONE"
              width={44}
              height={44}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                MED ZONE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                الموقع الامتحاني
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              المنصة الامتحانية للكلية • Examination Platform
            </p>
          </div>
        </Link>

        {/* User Info & Actions */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                {user.role === "admin" ? (
                  <Shield className="w-4 h-4 text-blue-600" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {user.studentId ? `الرقم: ${user.studentId}` : user.email}
                </div>
              </div>
              <Badge variant={user.role === "admin" ? "primary" : "success"} className="text-[10px]">
                {user.role === "admin" ? "إدارة الأكاديمية" : "طبيب مقيم"}
              </Badge>
            </div>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
