"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/Badge";

interface DashboardData {
  student: {
    name: string;
    email: string;
    studentId: string;
    groupTag: string;
  };
  availableExams: Array<{
    exam_id: string;
    exam_title: string;
    exam_description: string;
    total_questions: number;
    pass_percentage: number;
    duration_minutes: number;
    schedule_title: string;
    in_progress: boolean;
    attempt_id?: string;
    remaining_window_minutes: number;
  }>;
  upcomingExams: Array<{
    exam_id: string;
    exam_title: string;
    schedule_title: string;
    duration_minutes: number;
    assigned_start_time: number;
    starts_in_minutes: number;
  }>;
  recentResults: Array<{
    id: string;
    percentage: number;
    is_passed: boolean;
    total_score: number;
    max_score: number;
    completed_at: number;
    exam_title: string;
  }>;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: string) => {
    setErrorMsg("");
    setStartingExamId(examId);

    try {
      const res = await fetch(`/api/student/exams/${examId}/start`, {
        method: "POST",
      });
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setErrorMsg(resData.error || "تعذر بدء الاختبار حالياً");
        setStartingExamId(null);
        return;
      }

      // Navigate to the test engine
      router.push(`/student/attempt/${resData.attemptId}`);
    } catch (err) {
      setErrorMsg("حدث خطأ في الاتصال بالخادم");
      setStartingExamId(null);
    }
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        جاري تحميل جدول الاختبارات والملف الأكاديمي...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-400/20">
              <span>الموقع الامتحاني للكلية • MED ZONE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              أهلاً بك، {data?.student?.name}
            </h1>
            <p className="text-sm text-sky-200/80 mt-1 flex items-center gap-3">
              <span>الرقم الأكاديمي: <strong className="text-white font-mono">{data?.student?.studentId}</strong></span>
              <span>•</span>
              <span>{data?.student?.groupTag}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/results"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10"
            >
              <Award className="w-4 h-4 text-sky-300" />
              <span>سجل نتائجي</span>
            </Link>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Available Exams Section (Ready to take now) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              الاختبارات المتاحة للتقديم الآن ({data?.availableExams.length ?? 0})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">نافذة الاختبار مفتوحة</span>
        </div>

        {data?.availableExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">لا توجد اختبارات تنتظر التقديم حالياً</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              لقد أكملت جميع الاختبارات المجدولة حالياً، أو لم يحن موعد الاختبارات القادمة بعد.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data?.availableExams.map((ex) => (
              <div
                key={ex.exam_id}
                className="bg-white rounded-2xl border-2 border-sky-500/40 p-6 shadow-md shadow-sky-500/5 flex flex-col justify-between hover:border-sky-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={ex.in_progress ? "warning" : "success"}>
                      {ex.in_progress ? "محاولة قيد الإنجاز" : "متاح للبدء"}
                    </Badge>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {ex.duration_minutes} دقيقة
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {ex.exam_title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {ex.exam_description || "اختبار تخصصي في علوم التخدير والرعاية السريرية."}
                  </p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">الأسئلة</span>
                      <span className="font-extrabold text-slate-800 font-mono">{ex.total_questions} سؤال MCQ</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">نسبة النجاح</span>
                      <span className="font-extrabold text-emerald-600 font-mono">{ex.pass_percentage}%</span>
                    </div>
                    <div className="mr-auto text-left">
                      <span className="text-[10px] text-slate-400 block font-bold">الجدولة</span>
                      <span className="font-semibold text-slate-700">{ex.schedule_title}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleStartExam(ex.exam_id)}
                    disabled={startingExamId === ex.exam_id}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {startingExamId === ex.exam_id ? (
                      <span>جاري بدء محاولة الاختبار...</span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{ex.in_progress ? "استئناف الاختبار الجاري" : "بدء الاختبار الآن"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Two columns: Upcoming Exams & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">الاختبارات القادمة المجدولة</h3>
            </div>
            <Badge variant="neutral">{data?.upcomingExams.length ?? 0}</Badge>
          </div>

          {data?.upcomingExams.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              لا توجد اختبارات قادمة مجدولة في الوقت الحالي
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingExams.map((up) => (
                <div
                  key={up.exam_id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{up.exam_title}</h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                      {up.schedule_title} • المدة: {up.duration_minutes} دقيقة
                    </span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">يبدأ في</span>
                    <span className="text-xs font-bold text-sky-700">
                      {formatDateTime(up.assigned_start_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">آخر النتائج المسجلة</h3>
            </div>
            <Link
              href="/student/results"
              className="text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              عرض الكل
            </Link>
          </div>

          {data?.recentResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              لم تسجل أي نتائج حتى الآن
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentResults.map((res) => (
                <Link
                  key={res.id}
                  href={`/student/results/${res.id}`}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-sky-50/50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {res.exam_title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {formatDateTime(res.completed_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono">
                      <span className="text-sm font-black text-slate-900 block leading-tight">
                        {res.percentage}%
                      </span>
                      <span className="text-[9px] text-slate-400">
                        ({res.total_score}/{res.max_score})
                      </span>
                    </div>
                    {res.is_passed ? (
                      <Badge variant="success">ناجح</Badge>
                    ) : (
                      <Badge variant="danger">راسب</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
