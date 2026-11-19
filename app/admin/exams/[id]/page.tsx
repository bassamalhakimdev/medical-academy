"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Edit,
  HelpCircle,
  Save,
  BookOpen,
  Sparkles,
  FileCheck,
  AlertCircle,
  Clock,
  Shuffle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface Choice {
  id?: string;
  choice_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  points: number;
  explanation: string;
  order_index: number;
  choices: Choice[];
}

interface ExamDetail {
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
  questions: Question[];
}

export default function ExamEditorPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [choices, setChoices] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [modalError, setModalError] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Exam Settings update
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (examId) fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/exams/${examId}`);
      const data = await res.json();
      if (data.success) {
        setExam(data.exam);
      }
    } catch (err) {
      console.error("Failed to fetch exam:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExamSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;
    setUpdatingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          durationMinutes: exam.duration_minutes,
          passPercentage: exam.pass_percentage,
          shuffleQuestions: exam.shuffle_questions,
          shuffleChoices: exam.shuffle_choices,
          showResultsImmediately: exam.show_results_immediately,
          allowReviewAnswers: exam.allow_review_answers,
          status: exam.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setPoints(1);
    setExplanation("");
    setChoices([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setModalError("");
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question_text);
    setPoints(q.points);
    setExplanation(q.explanation || "");
    setChoices(
      q.choices.map((c) => ({
        text: c.choice_text,
        isCorrect: c.is_correct,
      }))
    );
    setModalError("");
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    // Validate choices
    if (choices.some((c) => !c.text.trim())) {
      setModalError("يرجى ملء جميع نصوص الاختيارات الأربعة");
      return;
    }

    if (!choices.some((c) => c.isCorrect)) {
      setModalError("يرجى تحديد إجابة صحيحة واحدة على الأقل عبر النقر على زر الاختيار المقابل لها");
      return;
    }

    setSubmittingQuestion(true);

    try {
      const payload = {
        questionText: questionText.trim(),
        points,
        explanation: explanation.trim(),
        choices: choices.map((c) => ({
          choiceText: c.text.trim(),
          isCorrect: c.isCorrect,
        })),
      };

      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : `/api/admin/exams/${examId}/questions`;

      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error || "فشل حفظ السؤال");
        setSubmittingQuestion(false);
        return;
      }

      setIsQuestionModalOpen(false);
      fetchExam();
    } catch (err) {
      setModalError("حدث خطأ أثناء حفظ السؤال");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;

    try {
      await fetch(`/api/admin/questions/${questionId}`, { method: "DELETE" });
      fetchExam();
    } catch (err) {
      console.error("Delete question error:", err);
    }
  };

  const setCorrectChoiceIndex = (targetIndex: number) => {
    setChoices((prev) =>
      prev.map((c, idx) => ({
        ...c,
        isCorrect: idx === targetIndex,
      }))
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        جاري تحميل بيانات الاختبار والأسئلة...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">الاختبار غير موجود</p>
        <Link href="/admin/exams" className="text-xs text-sky-600 font-bold mt-2 inline-block">
          العودة لقائمة الاختبارات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/exams"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {exam.title}
              </h1>
              <Badge variant={exam.status === "published" ? "success" : "neutral"}>
                {exam.status === "published" ? "منشور" : "مسودة"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              محرر أسئلة التخدير المتعددة (MCQ) وضبط معايير الامتحان
            </p>
          </div>
        </div>

        <button
          onClick={openAddQuestionModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة سؤال MCQ</span>
        </button>
      </div>

      {/* Grid: Exam Settings on right, Questions List on left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Questions Bank */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                أسئلة الاختبار ({exam.questions.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              إجمالي الدرجات: {exam.questions.reduce((acc, q) => acc + q.points, 0)} درجة
            </span>
          </div>

          {exam.questions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-xs font-bold text-slate-700">لا توجد أسئلة مضافة بعد</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                انقر على زر &quot;إضافة سؤال MCQ&quot; لإضافة أسئلة ذات 4 اختيارات مع تحديد الإجابة الصحيحة.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exam.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <Badge variant="neutral" className="text-[10px]">
                        {q.points} {q.points === 1 ? "درجة" : "درجات"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditQuestionModal(q)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="تعديل السؤال"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-relaxed mb-4">
                    {q.question_text}
                  </h3>

                  {/* 4 Choices */}
                  <div className="space-y-2">
                    {q.choices.map((choice, cIdx) => (
                      <div
                        key={choice.id || cIdx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          choice.is_correct
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold"
                            : "bg-slate-50 border-slate-200/80 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              choice.is_correct
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + cIdx)}
                          </span>
                          <span>{choice.choice_text}</span>
                        </div>

                        {choice.is_correct && (
                          <Badge variant="success" className="text-[10px]">
                            الإجابة الصحيحة
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Medical Rationale / Explanation */}
                  {q.explanation && (
                    <div className="mt-3.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-950 text-xs">
                      <span className="font-bold block text-blue-800 mb-1">الشرح والتعليل السريري:</span>
                      <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 Col): Exam Settings Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-600" />
              إعدادات وقواعد الاختبار
            </h2>

            <form onSubmit={handleSaveExamSettings} className="space-y-4 text-xs">
              {settingsSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  تم حفظ الإعدادات بنجاح
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الاختبار</label>
                <input
                  type="text"
                  required
                  value={exam.title}
                  onChange={(e) => setExam({ ...exam, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف الاختبار</label>
                <textarea
                  rows={2}
                  value={exam.description || ""}
                  onChange={(e) => setExam({ ...exam, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدة (دقائق)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={exam.duration_minutes}
                    onChange={(e) =>
                      setExam({ ...exam, duration_minutes: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نسبة النجاح (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={exam.pass_percentage}
                    onChange={(e) =>
                      setExam({ ...exam, pass_percentage: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الاختبار</label>
                <select
                  value={exam.status}
                  onChange={(e) => setExam({ ...exam, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold"
                >
                  <option value="draft">مسودة (غير متاح للجدولة)</option>
                  <option value="published">منشور (جاهز للجدولة والتقديم)</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exam.shuffle_questions}
                    onChange={(e) => setExam({ ...exam, shuffle_questions: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600"
                  />
                  <span className="font-bold text-slate-700">ترتيب عشوائي للأسئلة</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exam.shuffle_choices}
                    onChange={(e) => setExam({ ...exam, shuffle_choices: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600"
                  />
                  <span className="font-bold text-slate-700">ترتيب عشوائي للاختيارات</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exam.show_results_immediately}
                    onChange={(e) => setExam({ ...exam, show_results_immediately: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600"
                  />
                  <span className="font-bold text-slate-700">إظهار النتيجة للطالب فور التسليم</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exam.allow_review_answers}
                    onChange={(e) => setExam({ ...exam, allow_review_answers: e.target.checked })}
                    className="rounded border-slate-300 text-sky-600"
                  />
                  <span className="font-bold text-slate-700">السماح بمراجعة الإجابات والشرح بعد الانتهاء</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={updatingSettings}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer mt-4"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updatingSettings ? "جاري الحفظ..." : "حفظ إعدادات الاختبار"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? "تعديل سؤال MCQ" : "إضافة سؤال MCQ جديد"}
        description="أدخل نص السؤال، وأربعة اختيارات وحدد الإجابة الصحيحة مع الشرح الطبي"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              نص السؤال الطبي (العلمي)
            </label>
            <textarea
              rows={3}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="مثال: أي من الأدوية التالية يعتبر الاختيار الأول لعلاج تشنج الحنجرة الحاد (Laryngospasm) بعد نزع الأنبوب؟"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">درجة السؤال</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              required
              value={points}
              onChange={(e) => setPoints(parseFloat(e.target.value) || 1)}
              className="w-32 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          {/* 4 Choices */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              الاختيارات الأربعة (اضغط على الدائرة لتحديد الإجابة الصحيحة):
            </label>

            {choices.map((choice, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                  choice.isCorrect ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCorrectChoiceIndex(index)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    choice.isCorrect
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                  title="تحديد كإجابة صحيحة"
                >
                  {choice.isCorrect && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <span className="font-bold text-slate-400 text-xs shrink-0 w-4 text-center">
                  {String.fromCharCode(65 + index)}
                </span>

                <input
                  type="text"
                  required
                  value={choice.text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setChoices((prev) =>
                      prev.map((c, i) => (i === index ? { ...c, text: val } : c))
                    );
                  }}
                  placeholder={`نص الاختيار (${String.fromCharCode(65 + index)})`}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />

                {choice.isCorrect && (
                  <span className="text-[10px] font-bold text-emerald-700 shrink-0 px-2">
                    الإجابة الصحيحة
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الشرح والتعليل السريري المرجعي (اختياري)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="شرح آلية العمل، المراجع الطبية، أو سبب صحة هذا الاختيار..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submittingQuestion}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {submittingQuestion ? "جاري الحفظ..." : "حفظ السؤال"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
