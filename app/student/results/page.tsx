"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Clock, ChevronLeft, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Badge } from "@/components/Badge";

interface ResultSummary {
  id: string;
  percentage: number;
  is_passed: boolean;
  completed_at: number;
  total_score: number;
  max_score: number;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  exam_title: string;
  pass_percentage: number;
  duration_seconds: number | null;
}

export default function StudentResultsListPage() {
  const [results, setResults] = useState<ResultSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/results");
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Failed to load results:", err);
    } finally {
      setLoading(false);
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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} د و ${secs} ث`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            سجل النتائج ومراجعة الأداء
          </h1>
          <Badge variant="primary">{results.length} نتائج</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          متابعة درجاتك في اختبارات علوم التخدير ومراجعة الأسئلة والشروحات السريرية
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">جاري تحميل النتائج...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">لم تقدم أي اختبارات بعد</h3>
          <p className="text-xs text-slate-400 mt-1">
            عند تقديم الاختبارات المجدولة، ستظهر نتائجك وتقارير التصحيح التفصيلية هنا.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={res.is_passed ? "success" : "danger"}>
                    {res.is_passed ? "اجتياز" : "لم يتم الاجتياز"}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(res.completed_at)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{res.exam_title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>الوقت المستغرق: {formatDuration(res.duration_seconds)}</span>
                  <span>•</span>
                  <span>الإجابات الصحيحة: {res.correct_answers} من {res.total_questions}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-center sm:text-left">
                  <span className="text-2xl font-black text-slate-900 block leading-tight">
                    {res.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({res.total_score} من {res.max_score} درجة)
                  </span>
                </div>

                <Link
                  href={`/student/results/${res.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>عرض المراجعة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
