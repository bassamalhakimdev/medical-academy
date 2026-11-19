"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/Badge";

interface QuestionReview {
  id: string;
  questionText: string;
  points: number;
  explanation: string;
  studentSelectedChoiceId: string | null;
  studentIsCorrect: boolean | null;
  pointsAwarded: number;
  choices: Array<{
    id: string;
    choiceText: string;
    isCorrect: boolean;
  }>;
}

interface ResultDetail {
  id: string;
  exam_title: string;
  percentage: number;
  is_passed: boolean;
  total_score: number;
  max_score: number;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  completed_at: number;
  duration_seconds: number | null;
  feedback: string;
  allow_review_answers: boolean;
  questions: QuestionReview[];
}

export default function StudentResultDetailPage() {
  const params = useParams();
  const resultId = params?.id as string;

  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) fetchResultDetail();
  }, [resultId]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/results/${resultId}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error("Failed to load result:", err);
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
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        جاري تحميل تقرير النتيجة والمراجعة...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">النتيجة غير موجودة</h3>
        <Link href="/student/results" className="text-xs text-sky-600 font-bold mt-2 inline-block">
          العودة لسجل النتائج
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/results"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <span className="text-xs text-slate-500 font-bold">العودة لسجل نتائجي</span>
      </div>

      {/* Score Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <Badge variant={result.is_passed ? "success" : "danger"} className="mb-2">
            {result.is_passed ? "تم الاجتياز بنجاح" : "لم يتم اجتياز الاختبار"}
          </Badge>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {result.exam_title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
            <span>تاريخ التسليم: {formatDateTime(result.completed_at)}</span>
            <span>•</span>
            <span>الوقت المستغرق: {formatDuration(result.duration_seconds)}</span>
          </p>
          {result.feedback && (
            <p className="text-xs font-semibold text-sky-800 bg-sky-50 p-2.5 rounded-xl border border-sky-100 mt-3 inline-block">
              {result.feedback}
            </p>
          )}
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center shrink-0 min-w-40">
          <div className="text-4xl font-black text-slate-900">{result.percentage}%</div>
          <span className="text-xs font-bold text-slate-500 block mt-1">
            {result.total_score} من {result.max_score} درجة
          </span>
          <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200">
            {result.correct_answers} إجابة صحيحة من {result.total_questions}
          </div>
        </div>
      </div>

      {/* Question-by-Question Review */}
      {result.allow_review_answers ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              المراجعة التفصيلية والشروحات الطبية ({result.questions.length} سؤال)
            </h2>
          </div>

          <div className="space-y-4">
            {result.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  q.studentIsCorrect ? "border-emerald-200" : "border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Badge variant={q.studentIsCorrect ? "success" : "danger"}>
                      {q.studentIsCorrect ? `صحيح (+${q.pointsAwarded})` : "غير صحيح (0)"}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed mb-4">
                  {q.questionText}
                </h3>

                {/* Choices */}
                <div className="space-y-2">
                  {q.choices.map((c, cIdx) => {
                    const isStudentChoice = c.id === q.studentSelectedChoiceId;
                    const isCorrect = c.isCorrect;

                    let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isCorrect) {
                      bgClass = "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold";
                    }
                    if (isStudentChoice && !isCorrect) {
                      bgClass = "bg-rose-50 border-rose-300 text-rose-950 font-bold";
                    }

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${bgClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {String.fromCharCode(65 + cIdx)}
                          </span>
                          <span>{c.choiceText}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isStudentChoice && (
                            <Badge variant={isCorrect ? "success" : "danger"} className="text-[10px]">
                              إجابتك
                            </Badge>
                          )}
                          {isCorrect && (
                            <Badge variant="success" className="text-[10px]">
                              الإجابة الصحيحة
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Medical Explanation */}
                {q.explanation && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                    <span className="font-bold text-blue-900 block mb-1">الشرح الطبي السريري:</span>
                    <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">مراجعة الأسئلة غير مفعلة</h3>
          <p className="text-xs text-slate-500 mt-1">
            سياسة إدارة الأكاديمية لا تسمح بمراجعة تفاصيل الأسئلة والإجابات لهذا الاختبار في الوقت الحالي.
          </p>
        </div>
      )}
    </div>
  );
}
