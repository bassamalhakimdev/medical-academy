"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileQuestion,
  Award,
  TrendingUp,
  CalendarCheck,
  PlusCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/Badge";

interface StatsData {
  totalStudents: number;
  activeStudents: number;
  totalExams: number;
  publishedExams: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  activeSchedules: number;
}

interface RecentSubmission {
  id: string;
  percentage: number;
  is_passed: boolean;
  completed_at: number;
  total_score: number;
  max_score: number;
  student_name: string;
  student_email: string;
  student_id: string;
  exam_title: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recent, setRecent] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecent(data.recentSubmissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ============================================================== */}
      {/* 🚀 Hero Command Header                                        */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#091224] via-[#0b162c] to-[#071020] border border-cyan-500/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
        {/* Subtle grid and decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
              <span>قمرة المراقبة السريرية والأكاديمية المباشرة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              مركز القيادة والتقييم السريري
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              إدارة شاملة لدفعة أطباء التخدير، رصد الإنجاز اللحظي، تدقيق بنوك الأسئلة، واعتماد نتائج التقييمات التخصصية.
            </p>
          </div>

          {/* Quick Action Pods */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/exams"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] hover:brightness-110 rounded-xl shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>إنشاء اختبار جديد</span>
            </Link>
            <Link
              href="/admin/schedules"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-pointer active:scale-95"
            >
              <CalendarCheck className="w-4 h-4 text-cyan-400" />
              <span>جدولة اختبار</span>
            </Link>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>إدارة الأطباء</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📊 High-Precision Telemetry Metrics (4 Cards)                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Residents */}
        <div className="relative group overflow-hidden rounded-2xl p-5 bg-[#0a1122]/90 border border-white/10 hover:border-cyan-500/40 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">أطباء التخدير والطلاب</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-metric tracking-tight">
              {loading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="cyber" dot className="text-[10px]">
                {stats?.activeStudents ?? 0} طبيب نشط
              </Badge>
              <span className="text-[10px] text-slate-400 font-medium">دفعة R1 السريرية</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Question & Exam Bank */}
        <div className="relative group overflow-hidden rounded-2xl p-5 bg-[#0a1122]/90 border border-white/10 hover:border-cyan-500/40 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">بنك الاختبارات المعتمدة</span>
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(14,165,233,0.2)]">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-metric tracking-tight">
              {loading ? "..." : stats?.publishedExams ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info" className="text-[10px]">
                من إجمالي {stats?.totalExams ?? 0} اختبار
              </Badge>
              <span className="text-[10px] text-slate-400">جاهز للجدولة</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Exam Submissions */}
        <div className="relative group overflow-hidden rounded-2xl p-5 bg-[#0a1122]/90 border border-white/10 hover:border-emerald-500/40 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">المحاولات السريرية المكتملة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-[#00f5a0] flex items-center justify-center shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-metric tracking-tight">
              {loading ? "..." : stats?.totalAttempts ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success" dot className="text-[10px]">
                {stats?.activeSchedules ?? 0} جداول نشطة
              </Badge>
              <span className="text-[10px] text-slate-400">تسليمات فورية</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Average Score & Pass Rate */}
        <div className="relative group overflow-hidden rounded-2xl p-5 bg-[#0a1122]/90 border border-white/10 hover:border-cyan-500/40 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">معدل الاجتياز والكفاءة</span>
            <div className="w-9 h-9 rounded-xl bg-teal-950/80 border border-[#00f5a0]/30 text-[#00f5a0] flex items-center justify-center shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#00f5a0] font-metric tracking-tight">
              {loading ? "..." : `${stats?.averageScore ?? 0}%`}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="cyber" className="text-[10px]">
                نسبة النجاح: {stats?.passRate ?? 0}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ⚡ Main Content: Recent Submissions & System Watch HUD         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Recent Submissions */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#00f5a0] animate-pulse" />
              <h2 className="text-sm font-extrabold text-white">
                أحدث التسليمات والتقييمات المباشرة
              </h2>
            </div>
            <Link
              href="/admin/results"
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors"
            >
              عرض السجل الكامل
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">
                جاري سحب أحدث السجلات السريرية...
              </div>
            ) : recent.length === 0 ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">لا توجد تسليمات مسجلة حتى الآن</p>
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-[#070d1a] border-b border-white/10 text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-3.5">الطبيب المقيم</th>
                    <th className="px-4 py-3.5">الاختبار السريري</th>
                    <th className="px-4 py-3.5 text-center">الدرجة</th>
                    <th className="px-4 py-3.5 text-center">حالة التقييم</th>
                    <th className="px-6 py-3.5">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recent.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-cyan-950/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-xs">{sub.student_name}</div>
                        <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                          {sub.student_id}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-200 line-clamp-1">
                          {sub.exam_title}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-sm text-white font-metric">
                          {sub.percentage}%
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sub.total_score} / {sub.max_score}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {sub.is_passed ? (
                          <Badge variant="cyber" dot>
                            اجتياز سريري
                          </Badge>
                        ) : (
                          <Badge variant="danger" dot>
                            دون النصاب
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {formatDate(sub.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* System Health & Quick Access Matrix */}
        <div className="space-y-4">
          {/* Security & Atomic Integrity Card */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0c1833] via-[#091224] to-[#070e1c] border border-cyan-500/30 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck className="w-4 h-4 text-[#00f5a0]" />
              </div>
              <h3 className="text-sm font-bold">معايير النزاهة السريرية</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تعتمد المنصة التوثيق الزمني الذري (Atomic Transactions)، حيث يتم احتساب أوقات الإجابة والمحاولات مباشرة عبر ساعة الخادم دون الاعتماد على متصفح العميل لمنع أي تلاعب.
            </p>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">حالة المزامنة:</span>
                <span className="text-[#00f5a0] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                  مزامنة لحظية نشطة
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">محرك قواعد البيانات:</span>
                <span className="text-cyan-300">Neon / Serverless DB</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-3xl p-6 bg-[#0a1122]/90 border border-white/10 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              الوصول السريع للأنظمة
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/students"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all text-xs font-bold group"
              >
                <span>إدارة حسابات الأطباء والتفعيل الأكاديمي</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                href="/admin/exams"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all text-xs font-bold group"
              >
                <span>محرر أسئلة التخدير والمحاكاة السريرية (MCQ)</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                href="/admin/schedules"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all text-xs font-bold group"
              >
                <span>جدولة فترات التقديم (الجماعية والتعويضية)</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                href="/admin/results"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all text-xs font-bold group"
              >
                <span>سجل الدرجات ومصفوفة التحليل الإحصائي</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
