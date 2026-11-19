"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarClock,
  PlusCircle,
  Users,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface ScheduleItem {
  id: string;
  exam_id: string;
  schedule_type: "group" | "individual";
  title: string;
  target_group: string | null;
  target_user_id: string | null;
  start_time: number;
  end_time: number;
  duration_minutes: number;
  is_active: boolean;
  exam_title: string;
  target_user_name: string | null;
  target_student_id: string | null;
  assigned_count: number;
  completed_count: number;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "group" | "individual">("all");

  // Options for modal
  const [examsList, setExamsList] = useState<Array<{ id: string; title: string; duration_minutes: number }>>([]);
  const [studentsList, setStudentsList] = useState<Array<{ id: string; name: string; student_id: string; group_tag: string }>>([]);
  const [groupsList, setGroupsList] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<"group" | "individual">("group");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [title, setTitle] = useState("");
  const [targetGroup, setTargetGroup] = useState("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchOptions();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/schedules");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [examsRes, studentsRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/admin/students"),
      ]);

      const examsData = await examsRes.json();
      const studentsData = await studentsRes.json();

      if (examsData.success) {
        // Only published exams can be scheduled
        const published = examsData.exams.filter((e: any) => e.status === "published");
        setExamsList(published);
        if (published.length > 0) setSelectedExamId(published[0].id);
      }

      if (studentsData.success) {
        setStudentsList(studentsData.students);
        setGroupsList(studentsData.groups || []);
        if (studentsData.students.length > 0) setTargetUserId(studentsData.students[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  };

  const handleOpenModal = () => {
    // Default start now + 1 hour, end 24 hours later
    const now = new Date();
    const startStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const endStr = new Date(now.getTime() + 24 * 60 * 60000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    setTitle(scheduleType === "group" ? "جدولة عامة - تقييم منتصف التدريب" : "جدولة فردية خاصة");
    setStartDate(startStr);
    setEndDate(endStr);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedExamId) {
      setFormError("يرجى اختيار اختبار منشور من القائمة");
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setFormError("تاريخ ووقت البداية أو النهاية غير صالح");
      return;
    }

    if (endMs <= startMs) {
      setFormError("وقت النهاية يجب أن يكون بعد وقت البداية");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        examId: selectedExamId,
        scheduleType,
        title: title.trim(),
        targetGroup: scheduleType === "group" ? targetGroup : null,
        targetUserId: scheduleType === "individual" ? targetUserId : null,
        startTime: startMs,
        endTime: endMs,
        durationMinutes,
      };

      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "فشل جدولة الاختبار");
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      setFormError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (sc: ScheduleItem) => {
    try {
      await fetch(`/api/admin/schedules/${sc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sc.is_active }),
      });
      fetchSchedules();
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleDeleteSchedule = async (id: string, scTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف جدولة "${scTitle}"؟`)) return;

    try {
      await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
      fetchSchedules();
    } catch (err) {
      console.error("Delete schedule error:", err);
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

  const filteredSchedules = schedules.filter((s) => {
    if (filterType === "all") return true;
    return s.schedule_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              جدولة الاختبارات (الجماعية والفردية)
            </h1>
            <Badge variant="primary">{schedules.length} جدولة</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تخصيص الاختبارات لمجموعات الأطباء أو لطلاب محددين مع فترات زمنية ومدد مستقلة
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>جدولة اختبار جديد</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-xl w-fit text-xs font-bold">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          جميع الجداول ({schedules.length})
        </button>
        <button
          onClick={() => setFilterType("group")}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterType === "group" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          الجداول الجماعية ({schedules.filter((s) => s.schedule_type === "group").length})
        </button>
        <button
          onClick={() => setFilterType("individual")}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterType === "individual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          الجداول الفردية ({schedules.filter((s) => s.schedule_type === "individual").length})
        </button>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">جاري تحميل الجداول...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">لا توجد جداول مطابقة</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3.5">عنوان الجدولة والاختبار</th>
                  <th className="px-4 py-3.5">النوع والمستهدف</th>
                  <th className="px-4 py-3.5">النافذة الزمنية</th>
                  <th className="px-4 py-3.5 text-center">المدة</th>
                  <th className="px-4 py-3.5 text-center">الإنجاز</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-6 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((sc) => {
                  const now = Date.now();
                  const isCurrent = now >= sc.start_time && now <= sc.end_time;
                  const isUpcoming = now < sc.start_time;
                  const isPast = now > sc.end_time;

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{sc.title}</div>
                        <div className="text-[11px] text-sky-600 font-medium mt-0.5">
                          {sc.exam_title}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {sc.schedule_type === "group" ? (
                          <div>
                            <Badge variant="primary" className="mb-1 text-[10px]">
                              <Users className="w-3 h-3" />
                              جدولة جماعية
                            </Badge>
                            <div className="text-[11px] text-slate-600 font-semibold">
                              {sc.target_group === "all" ? "جميع المقيمين" : sc.target_group}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="info" className="mb-1 text-[10px]">
                              <User className="w-3 h-3" />
                              جدولة فردية
                            </Badge>
                            <div className="text-[11px] text-slate-900 font-bold">
                              {sc.target_user_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {sc.target_student_id}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="font-bold text-slate-800">من:</span>
                          <span>{formatDateTime(sc.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5">
                          <span className="font-bold text-slate-800">إلى:</span>
                          <span>{formatDateTime(sc.end_time)}</span>
                        </div>
                        {isCurrent && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[9px] font-bold mt-1">
                            متاح حالياً للتقديم
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-800 text-[9px] font-bold mt-1">
                            يبدأ قريباً
                          </span>
                        )}
                        {isPast && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[9px] font-bold mt-1">
                            انتهى الوقت
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-800">
                        {sc.duration_minutes} دقيقة
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="font-bold text-slate-900">
                          {sc.completed_count} / {sc.assigned_count}
                        </div>
                        <span className="text-[10px] text-slate-400">طبيب أكمل</span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {sc.is_active ? (
                          <Badge variant="success">نشط</Badge>
                        ) : (
                          <Badge variant="danger">معطل</Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleActive(sc)}
                            title={sc.is_active ? "تعطيل الجدولة" : "تفعيل الجدولة"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              sc.is_active
                                ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {sc.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteSchedule(sc.id, sc.title)}
                            title="حذف الجدولة"
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="جدولة اختبار تخدير"
        description="تحديد نظام الجدولة (جماعية أو فردية)، التوقيت ومدة الاختبار"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Schedule Type Selection */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setScheduleType("group");
                setTitle("جدولة عامة - تقييم منتصف التدريب");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scheduleType === "group"
                  ? "bg-white text-sky-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>جدولة جماعية</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScheduleType("individual");
                setTitle("جدولة فردية خاصة لطبيب محدد");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scheduleType === "individual"
                  ? "bg-white text-sky-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>جدولة فردية</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الاختبار المنشور المراد جدولته
            </label>
            <select
              required
              value={selectedExamId}
              onChange={(e) => {
                const exId = e.target.value;
                setSelectedExamId(exId);
                const found = examsList.find((x) => x.id === exId);
                if (found) setDurationMinutes(found.duration_minutes);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold"
            >
              {examsList.length === 0 ? (
                <option value="">لا توجد اختبارات منشورة! انشر اختباراً أولاً.</option>
              ) : (
                examsList.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (مدته الافتراضية: {ex.duration_minutes} دقيقة)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الجدولة</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الاختبار الفصلي لمقيمي التخدير (R1)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Group vs Individual target selector */}
          {scheduleType === "group" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة المستهدفة</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold"
              >
                <option value="all">جميع المقيمين والطلاب النشطين</option>
                {groupsList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الطبيب المقيم المستهدف</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold"
              >
                {studentsList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.student_id}) - {st.group_tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ ووقت البداية</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ ووقت النهاية</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              مدة الاختبار بالدقائق للطالب عند البدء
            </label>
            <input
              type="number"
              min={1}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              يبدأ عداد هذا الوقت للطالب عند النقر على &quot;بدء الاختبار&quot; داخل النافذة الزمنية المحددة.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {submitting ? "جاري الحفظ..." : "حفظ وجدولة الاختبار"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
