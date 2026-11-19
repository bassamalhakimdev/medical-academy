"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Shield, GraduationCap, Activity, Sparkles } from "lucide-react";
import { Badge } from "./Badge";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: "admin" | "student";
    studentId?: string | null;
  } | null;
  onToggleMobileMenu?: () => void;
}

export function Navbar({ user, onToggleMobileMenu }: NavbarProps) {
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
    <header className="sticky top-0 z-40 w-full bg-[#050811]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={user?.role === "admin" ? "/admin" : "/student"}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,245,160,0.35)] transition-all overflow-hidden shrink-0">
              <Image
                src="/logo.webp"
                alt="شعار الكلية - MED ZONE"
                width={40}
                height={40}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  MED ZONE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                  المنظومة السريرية
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                أكاديمية التخدير والعناية الحرجة • Clinical Examination Portal
              </p>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                {user.role === "admin" ? (
                  <Shield className="w-4 h-4 text-cyan-400" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-[#00f5a0]" />
                )}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-tight">
                  {user.studentId ? user.studentId : user.email}
                </div>
              </div>
              <Badge variant={user.role === "admin" ? "info" : "cyber"} dot>
                {user.role === "admin" ? "الإدارة الأكاديمية" : "طبيب مقيم"}
              </Badge>
            </div>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج الآمن"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] hover:brightness-110 rounded-xl shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all"
            >
              بوابة تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
