"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل تسجيل الدخول. يرجى التحقق من صحة البيانات المدخلة.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
      router.refresh();
    } catch (err: any) {
      setError("حدث خطأ في الاتصال بالخادم السحابي");
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Cyber-Surgical Ambient Lights */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#00f5a0]/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 clinical-grid pointer-events-none opacity-30 -z-10" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1329] to-[#040814] border-2 border-cyan-500/40 p-3 shadow-[0_0_35px_rgba(6,182,212,0.35)] mx-auto mb-5 flex items-center justify-center group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] rounded-3xl blur-sm opacity-30 group-hover:opacity-60 transition duration-500" />
          <Image
            src="/logo.webp"
            alt="شعار الكلية - MED ZONE"
            width={112}
            height={112}
            className="w-full h-full object-contain relative z-10"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
          <span>المنظومة الامتحانية السريرية المعتمدة</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
          MED ZONE
        </h2>
        <p className="mt-1 text-sm font-bold text-slate-300">
          أكاديمية علوم التخدير والرعاية الحرجة
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0a1122]/90 backdrop-blur-2xl py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                البريد الإلكتروني السريري أو الأكاديمي
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@anesthesia-academy.com"
                  dir="ltr"
                  className="block w-full px-4 py-3 pl-11 text-xs sm:text-sm bg-[#060a14]/90 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all text-left font-mono"
                />
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                كلمة المرور المشفرة
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="block w-full px-4 py-3 pl-11 text-xs sm:text-sm bg-[#060a14]/90 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all text-left font-mono"
                />
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#00f5a0] via-cyan-400 to-[#00e5ff] hover:brightness-115 active:scale-[0.98] shadow-[0_0_25px_rgba(0,245,160,0.35)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  جاري فك التشفير وتوثيق الجلسة...
                </span>
              ) : (
                <>
                  <span>الدخول إلى النظام السريري</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Keys */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
              مفاتيح الدخول التجريبي السريع (Demo Access)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  fillCredentials("admin@anesthesia-academy.com", "AdminPassword123!")
                }
                className="p-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-right transition-all cursor-pointer group shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:border-cyan-400"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>حساب الإدارة</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-bold group-hover:underline">تعبئة</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  admin@anesthesia...
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillCredentials("sara.mansoor@anesthesia-academy.com", "StudentPass123!")
                }
                className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 text-right transition-all cursor-pointer group shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:border-emerald-400"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                    <Stethoscope className="w-3.5 h-3.5 text-[#00f5a0]" />
                    <span>طبيب مقيم (R1)</span>
                  </div>
                  <span className="text-[10px] text-[#00f5a0] font-bold group-hover:underline">تعبئة</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  sara.mansoor@...
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-mono">
          معايير التشفير الأكاديمية • HttpOnly Secure Session Guard
        </div>
      </div>
    </div>
  );
}
