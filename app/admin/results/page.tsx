"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Download,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface ResultItem {
  id: string;
  percentage: number;
  is_passed: boolean;
  completed_at: number;
  total_score: number;
  max_score: number;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  duration_seconds: number | null;
  student_name: string;
  student_email: string;
  student_id: string;
  group_tag: string;
  exam_title: string;
  pass_percentage: number;
}

interface QuestionDetail {
  id: string;
  question_text: string;
  points: number;
  explanation: string;
  selected_choice_id: string | null;
  student_is_correct: boolean | null;
  points_awarded: number;
  choices: Array<{
    id: string;
    choice_text: string;
    is_correct: boolean;
  }>;
}

interface DetailedResult {
  id: string;
  student_name: string;
  student_id: string;
  group_tag: string;
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
  questions: QuestionDetail[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Detailed Modal
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedResult | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [search, selectedStatus]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/results?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (resultId: string) => {
    setSelectedResultId(resultId);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/results/${resultId}`);
      const data = await res.json();
      if (data.success) {
        setDetailedResult(data.result);
      }
    } catch (err) {
      console.error("Failed to fetch result detail:", err);
    } finally {
      setDetailLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              سجل النتائج وتقارير الأداء
            </h1>
            <Badge variant="primary">{results.length} نتيجة</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            متابعة نتائج تصحيح اختبارات التخدير، التدقيق في إجابات المقيمين، ومراجعة نسب النجاح
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم الطبيب، الرقم الأكاديمي، أو عنوان الاختبار..."
            className="w-full pl-4 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden w-full md:w-auto"
        >
          <option value="">جميع الحالات (ناجح وراسب)</option>
          <option value="passed">ناجح فقط</option>
          <option value="failed">راسب فقط</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">جاري تحميل النتائج...</div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">لا توجد نتائج مسجلة حتى الآن</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3.5">الطبيب المقيم</th>
                  <th className="px-4 py-3.5">الاختبار</th>
                  <th className="px-4 py-3.5 text-center">الدرجة</th>
                  <th className="px-4 py-3.5 text-center">الإجابات الصحيحة</th>
                  <th className="px-4 py-3.5 text-center">الوقت المستغرق</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5">تاريخ التسليم</th>
                  <th className="px-6 py-3.5 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{res.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {res.student_id} • {res.group_tag}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-800">
                      {res.exam_title}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="font-black text-slate-900 text-sm">{res.percentage}%</span>
                      <div className="text-[10px] text-slate-400">
                        {res.total_score} من {res.max_score}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center font-bold text-slate-700">
                      {res.correct_answers} / {res.total_questions}
                    </td>

                    <td className="px-4 py-4 text-center text-slate-600">
                      {formatDuration(res.duration_seconds)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {res.is_passed ? (
                        <Badge variant="success">ناجح</Badge>
                      ) : (
                        <Badge variant="danger">راسب</Badge>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(res.completed_at)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(res.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold transition-colors cursor-pointer text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض الإجابات</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed Result Breakdown Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="تقرير تفصيلي لنتيجة الاختبار"
        description="مراجعة شاملة لأسئلة الامتحان واختيارات الطبيب والإجابات المعتمدة"
        maxWidth="3xl"
      >
        {detailLoading || !detailedResult ? (
          <div className="py-16 text-center text-xs text-slate-400">
            جاري استرجاع تفاصيل التقرير والأسئلة...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">النتيجة النهائية</span>
                <span className="text-xl font-black text-slate-900">
                  {detailedResult.percentage}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">الحالة الأكاديمية</span>
                <div className="mt-1">
                  {detailedResult.is_passed ? (
                    <Badge variant="success">اجتياز</Badge>
                  ) : (
                    <Badge variant="danger">لم يجتز</Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">الإجابات الصحيحة</span>
                <span className="text-sm font-black text-slate-800">
                  {detailedResult.correct_answers} من {detailedResult.total_questions}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">الوقت المستغرق</span>
                <span className="text-sm font-bold text-slate-800">
                  {formatDuration(detailedResult.duration_seconds)}
                </span>
              </div>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700">
                تدقيق إجابات الأسئلة ({detailedResult.questions.length})
              </h4>

              {detailedResult.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs ${
                    q.student_is_correct
                      ? "bg-emerald-50/20 border-emerald-200"
                      : "bg-rose-50/20 border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-900 leading-relaxed">
                      {qIdx + 1}. {q.question_text}
                    </span>
                    <Badge variant={q.student_is_correct ? "success" : "danger"}>
                      {q.student_is_correct ? `+${q.points_awarded} درجة` : "0 درجة"}
                    </Badge>
                  </div>

                  {/* Choices */}
                  <div className="space-y-1.5 mt-3">
                    {q.choices.map((c, cIdx) => {
                      const isStudentSelection = c.id === q.selected_choice_id;
                      const isCorrect = c.is_correct;

                      let choiceClass = "bg-white border-slate-200 text-slate-700";
                      if (isCorrect) {
                        choiceClass = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                      }
                      if (isStudentSelection && !isCorrect) {
                        choiceClass = "bg-rose-50 border-rose-300 text-rose-900 font-bold line-through";
                      }

                      return (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs ${choiceClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200/60 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + cIdx)}
                            </span>
                            <span>{c.choice_text}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isStudentSelection && (
                              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700 font-bold">
                                اختيار الطبيب
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-600 text-white font-bold">
                                الإجابة المعتمدة
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Medical explanation */}
                  {q.explanation && (
                    <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 text-blue-950 text-[11px] leading-relaxed">
                      <span className="font-bold text-blue-800 block mb-0.5">الشرح الطبي المعتمد:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
