"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Play,
  Award,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/Badge";

export default function StudentExamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const data = await res.json();
      if (data.success) {
        setAvailable(data.availableExams || []);
        setUpcoming(data.upcomingExams || []);
        setCompleted(data.completedExams || []);
      }
    } catch (err) {
      console.error("Failed to load exams:", err);
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
        setErrorMsg(resData.error || "تعذر بدء الاختبار");
        setStartingExamId(null);
        return;
      }

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
        جاري تحميل جدول الاختبارات...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          جدول الاختبارات المخصصة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          قائمة بجميع اختبارات علوم التخدير المتاحة والقادمة والمنتهية
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Available Now */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-base font-extrabold text-slate-900">
            الاختبارات المتاحة للتقديم الآن ({available.length})
          </h2>
        </div>

        {available.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-xs text-slate-400">
            لا توجد اختبارات متاحة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((ex) => (
              <div
                key={ex.exam_id}
                className="bg-white rounded-2xl border-2 border-sky-500/50 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={ex.in_progress ? "warning" : "success"}>
                      {ex.in_progress ? "محاولة جارية" : "متاح الآن"}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {ex.duration_minutes} دقيقة
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ex.exam_title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ex.exam_description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">
                    {ex.total_questions} أسئلة MCQ
                  </span>
                  <button
                    onClick={() => handleStartExam(ex.exam_id)}
                    disabled={startingExamId === ex.exam_id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{ex.in_progress ? "استئناف" : "بدء الاختبار"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Upcoming */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            الاختبارات القادمة ({upcoming.length})
          </h2>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-xs text-slate-400">
            لا توجد اختبارات قادمة مجدولة
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((up) => (
              <div
                key={up.exam_id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{up.exam_title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                    المدة: {up.duration_minutes} دقيقة • {up.schedule_title}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-bold">موعد البدء</span>
                  <span className="text-xs font-bold text-sky-700">
                    {formatDateTime(up.assigned_start_time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Completed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-extrabold text-slate-900">
            الاختبارات المنتهية والسابقة ({completed.length})
          </h2>
        </div>

        {completed.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-xs text-slate-400">
            لا توجد اختبارات مكتملة سابقة
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((comp) => (
              <div
                key={comp.assignment_id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{comp.exam_title}</h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {comp.schedule_title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {comp.result_id ? (
                    <>
                      <div className="text-left">
                        <span className="text-sm font-black text-slate-900 block leading-tight">
                          {comp.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({comp.total_score} من {comp.max_score})
                        </span>
                      </div>
                      <Link
                        href={`/student/results/${comp.result_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                      >
                        <span>النتيجة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <Badge variant="neutral">لم يُقدّم</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
