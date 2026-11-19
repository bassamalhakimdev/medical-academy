"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileQuestion,
  PlusCircle,
  Clock,
  Shuffle,
  Eye,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowUpRight,
  HelpCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface ExamItem {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  duration_minutes: number;
  pass_percentage: number;
  shuffle_questions: boolean;
  shuffle_choices: boolean;
  show_results_immediately: boolean;
  allow_review_answers: boolean;
  question_count: number;
  attempts_count: number;
  schedules_count: number;
}

export default function ExamsManagementPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    passPercentage: 60,
    shuffleQuestions: true,
    shuffleChoices: true,
    showResultsImmediately: true,
    allowReviewAnswers: true,
    status: "draft" as "draft" | "published",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "فشل إنشاء الاختبار");
        setSubmitting(false);
        return;
      }

      setIsCreateModalOpen(false);
      fetchExams();
    } catch (err) {
      setFormError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (exam: ExamItem) => {
    const newStatus = exam.status === "published" ? "draft" : "published";
    try {
      await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchExams();
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  const handleDeleteExam = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف اختبار "${title}" وجميع أسئلته ومحاولاته؟`)) return;

    try {
      await fetch(`/api/admin/exams/${id}`, { method: "DELETE" });
      fetchExams();
    } catch (err) {
      console.error("Delete exam error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              بنك الاختبارات والأسئلة
            </h1>
            <Badge variant="primary">{exams.length} اختبار</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تصميم وإعداد اختبارات علوم التخدير والرعاية المركزة، ضبط خيارات العشوائية والتصحيح
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              description: "",
              durationMinutes: 30,
              passPercentage: 60,
              shuffleQuestions: true,
              shuffleChoices: true,
              showResultsImmediately: true,
              allowReviewAnswers: true,
              status: "draft",
            });
            setFormError("");
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إنشاء اختبار جديد</span>
        </button>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">جاري تحميل الاختبارات...</div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">لا يوجد اختبارات في البنك حتى الآن</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ابدأ بإنشاء اختبار جديد وإضافة أسئلة MCQ مع الشروحات الطبية لتخدير المرضى.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={exam.status === "published" ? "success" : "neutral"}>
                    {exam.status === "published" ? "منشور" : "مسودة"}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.duration_minutes} دقيقة
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {exam.description || "لا يوجد وصف مدخل لهذا الاختبار."}
                </p>

                {/* Features & Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">عدد الأسئلة</span>
                    <span className="text-sm font-black text-slate-800">
                      {exam.question_count} سؤال
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">نسبة النجاح</span>
                    <span className="text-sm font-black text-emerald-600">
                      {exam.pass_percentage}%
                    </span>
                  </div>
                </div>

                {/* Badges for Shuffling */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {exam.shuffle_questions && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                      <Shuffle className="w-2.5 h-2.5" />
                      عشوائية الأسئلة
                    </span>
                  )}
                  {exam.shuffle_choices && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold">
                      <Shuffle className="w-2.5 h-2.5" />
                      عشوائية الاختيارات
                    </span>
                  )}
                  {exam.show_results_immediately && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                      <Eye className="w-2.5 h-2.5" />
                      نتيجة فورية
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/admin/exams/${exam.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 hover:text-white bg-sky-100 hover:bg-sky-600 rounded-xl transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>إدارة الأسئلة ({exam.question_count})</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(exam)}
                    title={exam.status === "published" ? "تحويل إلى مسودة" : "نشر الاختبار للجدولة"}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-semibold"
                  >
                    {exam.status === "published" ? "تعطيل النشر" : "نشر"}
                  </button>

                  <button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    title="حذف الاختبار"
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="إنشاء اختبار تخدير جديد"
        description="تحديد إعدادات الاختبار ودرجة النجاح ومدته الزمنية"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الاختبار</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: التخدير في جراحة الأوعية الدموية والقلب"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف الاختبار والأهداف التعليمية</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف تفصيلي لمحتوى الاختبار والمواضيع المستهدفة..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المدة القياسية بالدقائق</label>
              <input
                type="number"
                min={1}
                required
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نسبة النجاح المطلوبة (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={formData.passPercentage}
                onChange={(e) => setFormData({ ...formData, passPercentage: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700">ترتيب عشوائي للأسئلة لكل طالب</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleChoices}
                onChange={(e) => setFormData({ ...formData, shuffleChoices: e.target.checked })}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700">ترتيب عشوائي للاختيارات الأربعة داخل كل سؤال</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showResultsImmediately}
                onChange={(e) => setFormData({ ...formData, showResultsImmediately: e.target.checked })}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700">إظهار النتيجة والدرجة للطالب فور التسليم</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowReviewAnswers}
                onChange={(e) => setFormData({ ...formData, allowReviewAnswers: e.target.checked })}
                className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700">السماح للطالب بمراجعة الإجابات الصحيحة والشرح بعد إنهاء الاختبار</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {submitting ? "جاري الإنشاء..." : "إنشاء وبدء إضافة الأسئلة"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
