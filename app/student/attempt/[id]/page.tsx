"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  HelpCircle,
  Award,
  RefreshCw,
  AlertCircle,
  FileText,
  Activity,
  Check,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface Choice {
  id: string;
  choiceText: string;
}

interface Question {
  id: string;
  questionText: string;
  points: number;
  choices: Choice[];
}

interface AttemptData {
  id: string;
  examId: string;
  examTitle: string;
  status: string;
  startTime: number;
  maxEndTime: number;
  remainingSeconds: number;
  serverTime: number;
  questions: Question[];
  savedAnswers: Record<string, string>;
}

export default function ExamEnginePage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<AttemptData | null>(null);

  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Submission
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Fetch Attempt on load
  useEffect(() => {
    if (attemptId) fetchAttempt();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/student/attempts/${attemptId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "فشل تحميل الاختبار");
        setLoading(false);
        return;
      }

      if (data.timedOut) {
        // Attempt already timed out on server
        handleAutoSubmit();
        return;
      }

      setAttempt(data.attempt);
      setAnswers(data.attempt.savedAnswers || {});
      setTimeLeft(data.attempt.remainingSeconds);

      // Start countdown timer synced with server remaining seconds
      startTimer(data.attempt.remainingSeconds);
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (initialSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let sec = initialSeconds;
    timerRef.current = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(0);
        handleAutoSubmit();
      } else {
        setTimeLeft(sec);
      }
    }, 1000);
  };

  // Autosave choice selection
  const handleSelectChoice = async (questionId: string, choiceId: string) => {
    // Optimistic UI update
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    setIsSaving(true);

    try {
      const res = await fetch(`/api/student/attempts/${attemptId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, choiceId }),
      });

      const data = await res.json();
      if (data.success) {
        const timeStr = new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSavedTime(timeStr);
      }
    } catch (err) {
      console.error("Autosave error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Attempt (Manual or Auto on timeout)
  const handleSubmitAttempt = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/student/attempts/${attemptId}/submit`, {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult(data.result);
      } else {
        setError(data.error || "فشل تسليم الاختبار");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم أثناء التسليم");
    } finally {
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    handleSubmitAttempt();
  }, [attemptId]);

  // Format Timer mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Activity className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-600">جاري تهيئة أسئلة الاختبار ومزامنة الوقت مع الخادم...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-rose-200 text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-extrabold text-slate-900 mb-2">تنبيه النظام</h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">{error}</p>
        <button
          onClick={() => router.push("/student")}
          className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
        >
          العودة للوحة الطالب
        </button>
      </div>
    );
  }

  // If already submitted and result available
  if (submissionResult) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <Badge variant={submissionResult.isPassed ? "success" : "danger"} className="mb-2">
            {submissionResult.isPassed ? "تم الاجتياز بنجاح" : "لم يتم اجتياز الاختبار"}
          </Badge>
          <h2 className="text-2xl font-black text-slate-900">
            تم تسليم وتصحيح الاختبار آلياً
          </h2>
          <p className="text-xs text-slate-500 mt-1">{submissionResult.examTitle}</p>
        </div>

        {/* Score Gauge */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="text-4xl font-black text-slate-900 mb-1">
            {submissionResult.percentage}%
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            حصلت على {submissionResult.totalScore} من {submissionResult.maxScore} درجة
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-slate-700">
            <span>الأسئلة الصحيحة: {submissionResult.correctAnswers}</span>
            <span>•</span>
            <span>الأسئلة المجاب عنها: {submissionResult.answeredQuestions} من {submissionResult.totalQuestions}</span>
            <span>•</span>
            <span>درجة النجاح: {submissionResult.passPercentage}%</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push(`/student/results/${submissionResult.id}`)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
          >
            عرض تقرير النتيجة والمراجعة
          </button>
          <button
            onClick={() => router.push("/student")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!attempt || attempt.questions.length === 0) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        لا توجد أسئلة مضافة في هذا الاختبار
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const totalQuestions = attempt.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const isLowTime = timeLeft <= 300; // < 5 minutes
  const isCriticalTime = timeLeft <= 60; // < 1 minute

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Sticky Exam Engine Header */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
              {attempt.examTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>سؤال {currentIndex + 1} من {totalQuestions}</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">تمت الإجابة على {answeredCount}</span>
            {lastSavedTime && (
              <>
                <span>•</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  حُفظ {lastSavedTime}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Clock (Server Synced) */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-sm tracking-wider ${
              isCriticalTime
                ? "bg-rose-50 text-rose-600 border-rose-300 animate-pulse"
                : isLowTime
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-slate-50 text-slate-800 border-slate-200"
            }`}
          >
            <Clock className={`w-4 h-4 ${isCriticalTime ? "text-rose-600" : "text-sky-600"}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>تسليم الاختبار</span>
          </button>
        </div>
      </div>

      {/* Question Stepper / Navigation Palette */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">شريط التقدم والتنقل بين الأسئلة</span>
          <span className="text-xs font-bold text-sky-700 font-mono">{progressPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Palette Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {attempt.questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-sky-600 text-white ring-2 ring-sky-600 ring-offset-2 scale-105 shadow-sm"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
                title={`الانتقال إلى سؤال ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <Badge variant="neutral">سؤال متعدد الاختيارات (MCQ)</Badge>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {currentQ.points} {currentQ.points === 1 ? "درجة" : "درجات"}
          </span>
        </div>

        {/* Clinical Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* 4 Choices Interactive Buttons */}
        <div className="space-y-3 pt-2">
          {currentQ.choices.map((choice, cIdx) => {
            const isSelected = answers[currentQ.id] === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectChoice(currentQ.id, choice.id)}
                className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? "bg-sky-50/80 border-sky-600 shadow-sm"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-sky-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(65 + cIdx)}
                  </span>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isSelected ? "font-bold text-slate-900" : "font-medium text-slate-700"
                    }`}
                  >
                    {choice.choiceText}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السؤال السابق</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>مراجعة وتسليم الاختبار</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Final Submit */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="تأكيد تسليم الاختبار النهائي"
        description="يرجى مراجعة حالة الإجابات قبل تأكيد التسليم النهائي"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">الأسئلة المجاب عنها</span>
              <span className="text-lg font-black text-emerald-600">
                {answeredCount} من {totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">الأسئلة المتبقية</span>
              <span
                className={`text-lg font-black ${
                  totalQuestions - answeredCount > 0 ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {totalQuestions - answeredCount}
              </span>
            </div>
          </div>

          {totalQuestions - answeredCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>تنبيه: يوجد {totalQuestions - answeredCount} سؤال لم تقم بالإجابة عليها بعد.</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            عند تأكيد التسليم، سيتم إرسال إجاباتك فوراً إلى خادم المنصة الامتحانية واحتساب درجتك النهائية ولن تتمكن من تعديل الإجابات بعد ذلك.
          </p>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              العودة للاختبار
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitAttempt}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? "جاري التصحيح والتسليم..." : "تأكيد التسليم الآن"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
