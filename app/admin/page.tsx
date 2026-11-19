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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              لوحة التحكم والإشراف الأكاديمي
            </h1>
            <Badge variant="info">مباشر</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            متابعة شاملة لأداء أطباء التخدير المقيمين، بنك الأسئلة، والامتحانات المجدولة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء اختبار</span>
          </Link>
          <Link
            href="/admin/schedules"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-slate-500" />
            <span>جدولة اختبار</span>
          </Link>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>إضافة طبيب</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (White, Blue, Green, Clean) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الأطباء والطلاب</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="success" className="text-[10px]">
                {stats?.activeStudents ?? 0} حساب نشط
              </Badge>
              <span className="text-[11px] text-slate-400">في برامج التخصص</span>
            </div>
          </div>
        </div>

        {/* Card 2: Exams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الاختبارات المنشورة</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.publishedExams ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-slate-500">
                من إجمالي {stats?.totalExams ?? 0} اختبار في البنك
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Attempts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المحاولات المكتملة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : stats?.totalAttempts ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info" className="text-[10px]">
                {stats?.activeSchedules ?? 0} جداول نشطة حالياً
              </Badge>
            </div>
          </div>
        </div>

        {/* Card 4: Average Score & Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط الدرجات والنجاح</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {loading ? "..." : `${stats?.averageScore ?? 0}%`}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-emerald-600 font-bold">
                نسبة الاجتياز: {stats?.passRate ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Recent Submissions & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Recent Exam Results */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">أحدث تسليمات الاختبارات</h2>
            </div>
            <Link
              href="/admin/results"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              عرض جميع النتائج
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">جاري تحميل البيانات...</div>
            ) : recent.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">لا توجد تسليمات حتى الآن</p>
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                  <tr>
                    <th className="px-6 py-3">الطبيب / المقيم</th>
                    <th className="px-4 py-3">الاختبار</th>
                    <th className="px-4 py-3 text-center">الدرجة</th>
                    <th className="px-4 py-3 text-center">الحالة</th>
                    <th className="px-6 py-3">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900">{sub.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{sub.student_id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-700 line-clamp-1">{sub.exam_title}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-extrabold text-sm text-slate-900">
                          {sub.percentage}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          ({sub.total_score} من {sub.max_score})
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {sub.is_passed ? (
                          <Badge variant="success">ناجح</Badge>
                        ) : (
                          <Badge variant="danger">راسب</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(sub.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Tips & System Status */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">حالة النظام وقاعدة البيانات</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              جميع محاولات الاختبارات وتصحيحاتها تُسجّل بصورة ذرية (Atomic Transactions) على الخادم لحماية سلامة النتائج ومنع تكرار المحاولات.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-300">
              <span>قاعدة البيانات السحابية</span>
              <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                متصل وجاهز
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">روابط الإدارة السريعة</h3>
            <div className="space-y-2">
              <Link
                href="/admin/students"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition-colors text-xs font-bold"
              >
                <span>إدارة حسابات الأطباء والتفعيل</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin/exams"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition-colors text-xs font-bold"
              >
                <span>إضافة وتعديل أسئلة التخدير (MCQ)</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin/schedules"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition-colors text-xs font-bold"
              >
                <span>جدولة جماعية أو فردية للطلاب</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admin/results"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition-colors text-xs font-bold"
              >
                <span>عرض تقارير ونتائج الاختبارات</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
