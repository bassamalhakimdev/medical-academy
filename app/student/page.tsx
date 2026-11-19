"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
  Stethoscope,
  ChevronLeft,
  Flame,
  ShieldCheck,
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
        setErrorMsg(resData.error || "تعذر بدء الاختبار حالياً. يرجى مراجعة إدارة الكلية.");
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
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-[#00f5a0] rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-slate-400 font-mono">
          جاري مزامنة الملف الأكاديمي وجداول الاختبارات...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ============================================================== */}
      {/* 💳 Holographic Resident Medical ID Card                        */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0a1428] via-[#0d1d3a] to-[#071022] border-2 border-cyan-500/30 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.85)]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00f5a0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 p-2 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Image
                src="/logo.webp"
                alt="شعار الكلية"
                width={70}
                height={70}
                className="w-full h-full object-contain"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00f5a0] border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <Stethoscope className="w-3.5 h-3.5 text-[#00f5a0]" />
                <span>طبيب مقيم معتمد • كلية علوم التخدير</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                د. {data?.student?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="bg-slate-950/70 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-cyan-300">
                  ID: {data?.student?.studentId}
                </span>
                <span>•</span>
                <span className="text-slate-400 font-medium">{data?.student?.groupTag}</span>
                <span>•</span>
                <span className="text-[#00f5a0] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                  حساب نشط ومؤهل للاختبارات
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/results"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-cyan-200 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400"
            >
              <Award className="w-4 h-4 text-[#00f5a0]" />
              <span>سجل كفاءتي السريرية</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🔴 Available Live Exam Pods (Ready to start now)                */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#00f5a0] animate-pulse shadow-[0_0_12px_#00f5a0]" />
            <h2 className="text-base sm:text-lg font-black text-white">
              الاختبارات الجاهزة للتقديم الآن ({data?.availableExams.length ?? 0})
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
            نافذة التقييم مفتوحة
          </span>
        </div>

        {data?.availableExams.length === 0 ? (
          <div className="rounded-3xl p-10 text-center bg-[#0a1122]/80 border border-white/10 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-[#00f5a0] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">
              لا توجد اختبارات تنتظر التقديم في هذه اللحظة
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              لقد أكملت جميع الاختبارات المقررة بنجاح، أو لم يحن موعد فتح الجلسات القادمة بعد. يمكنك مراجعة سجلك السريري أدناه.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data?.availableExams.map((ex) => (
              <div
                key={ex.exam_id}
                className="relative group rounded-3xl p-6 bg-gradient-to-br from-[#0c1833] via-[#0a1329] to-[#070e1c] border-2 border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:border-[#00f5a0] hover:shadow-[0_0_30px_rgba(0,245,160,0.2)] flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={ex.in_progress ? "warning" : "cyber"} dot>
                      {ex.in_progress ? "محاولة جارية الآن" : "متاح للبدء الفوري"}
                    </Badge>
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {ex.duration_minutes} دقيقة
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white leading-snug">
                    {ex.exam_title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {ex.exam_description ||
                      "اختبار سريري متخصص في علوم التخدير والرعاية المركزة وتدبير المجرى الهوائي."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-medium">الأسئلة</span>
                      <span className="font-black text-white font-metric text-xs">
                        {ex.total_questions} MCQ
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-medium">النجاح</span>
                      <span className="font-black text-[#00f5a0] font-metric text-xs">
                        {ex.pass_percentage}%
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-medium">الجدولة</span>
                      <span className="font-bold text-cyan-300 text-[11px] truncate block">
                        {ex.schedule_title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleStartExam(ex.exam_id)}
                    disabled={startingExamId === ex.exam_id}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] hover:brightness-110 shadow-[0_0_20px_rgba(0,245,160,0.3)] active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {startingExamId === ex.exam_id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        جاري تهيئة قمرة الاختبار...
                      </span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {ex.in_progress ? "استئناف الاختبار السريري" : "دخول قمرة الاختبار الآن"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 📅 Two Columns: Upcoming Schedules & Recent Results           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white">الاختبارات القادمة المجدولة</h3>
            </div>
            <Badge variant="neutral">{data?.upcomingExams.length ?? 0}</Badge>
          </div>

          {data?.upcomingExams.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              لا توجد اختبارات قادمة مجدولة في الوقت الحالي
            </div>
          ) : (
            <div className="space-y-3">
              {data?.upcomingExams.map((up) => (
                <div
                  key={up.exam_id}
                  className="p-4 rounded-2xl bg-[#070d1a] border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{up.exam_title}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {up.schedule_title} • المدة: {up.duration_minutes} دقيقة
                    </span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-slate-500 block">يبدأ في</span>
                    <span className="text-xs font-bold text-cyan-300">
                      {formatDateTime(up.assigned_start_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00f5a0]" />
              <h3 className="text-sm font-extrabold text-white">سجل النتائج الأخير</h3>
            </div>
            <Link
              href="/student/results"
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200"
            >
              عرض السجل الكامل
            </Link>
          </div>

          {data?.recentResults.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              لم تسجل أي نتائج اختبارات حتى الآن
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentResults.map((res) => (
                <Link
                  key={res.id}
                  href={`/student/results/${res.id}`}
                  className="p-4 rounded-2xl bg-[#070d1a] border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {res.exam_title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {formatDateTime(res.completed_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-sm font-black text-white font-metric block leading-tight">
                        {res.percentage}%
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {res.total_score}/{res.max_score}
                      </span>
                    </div>
                    {res.is_passed ? (
                      <Badge variant="cyber" dot>
                        اجتياز
                      </Badge>
                    ) : (
                      <Badge variant="danger" dot>
                        إعادة
                      </Badge>
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
