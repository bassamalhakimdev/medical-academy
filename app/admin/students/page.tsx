"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Edit,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  phone: string | null;
  group_tag: string;
  is_active: boolean;
  exams_taken_count: number;
  avg_score: number | null;
}

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    phone: "",
    groupTag: "دفعة 2026",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedGroup, selectedStatus]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedGroup) params.set("group", selectedGroup);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        if (data.groups) setGroups(data.groups);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "فشل إنشاء حساب الطالب");
        setSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        studentId: "",
        phone: "",
        groupTag: "دفعة 2026",
      });
      fetchStudents();
    } catch (err) {
      setFormError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "فشل تحديث بيانات الطالب");
        setSubmitting(false);
        return;
      }

      setIsEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setFormError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (student: Student) => {
    try {
      await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !student.is_active }),
      });
      fetchStudents();
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب "${name}" بشكل نهائي؟`)) return;

    try {
      await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      fetchStudents();
    } catch (err) {
      console.error("Delete student error:", err);
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: "", // Empty means do not change password
      studentId: student.student_id,
      phone: student.phone || "",
      groupTag: student.group_tag,
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              إدارة الطلاب
            </h1>
            <Badge variant="primary">{students.length} طالب</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إنشاء الحسابات، ضبط المجموعات الأكاديمية، التعطيل والتفعيل وإعادة تعيين كلمات المرور
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              password: "",
              studentId: `ANES-2026-0${students.length + 1}`,
              phone: "",
              groupTag: "دفعة 2026",
            });
            setFormError("");
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، الرقم الأكاديمي، أو البريد الإلكتروني..."
            className="w-full pl-4 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">جميع الدفعات / المجموعات</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">معطل فقط</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">جاري تحميل بيانات الطلاب...</div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">لا يوجد طلاب مطابقون لمعايير البحث</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3.5">الطالب</th>
                  <th className="px-4 py-3.5">الرقم الأكاديمي</th>
                  <th className="px-4 py-3.5">المجموعة / الدفعة</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الاختبارات</th>
                  <th className="px-4 py-3.5 text-center">متوسط الأداء</th>
                  <th className="px-6 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span dir="ltr">{st.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-700">
                      {st.student_id}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <GraduationCap className="w-3 h-3 text-slate-500" />
                        {st.group_tag}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {st.is_active ? (
                        <Badge variant="success">نشط</Badge>
                      ) : (
                        <Badge variant="danger">معطل</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-800">
                      {st.exams_taken_count}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {st.avg_score !== null ? (
                        <span className="font-black text-slate-900 text-sm">
                          {st.avg_score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">لم يختبر</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(st)}
                          title={st.is_active ? "تعطيل الحساب" : "إعادة تفعيل الحساب"}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            st.is_active
                              ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                              : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {st.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => openEditModal(st)}
                          title="تعديل البيانات"
                          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          title="حذف الحساب"
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة طالب جديد"
        description="تسجيل حساب رسمي في الأكاديمية لاختبارات علوم التخدير"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل للطالب</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أسامة عبد الرحمن العريقي"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="osama@anesthesia-academy.com"
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الأكاديمي / الوظيفي</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="ANES-2026-005"
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+967771234567"
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة / الدفعة</label>
              <input
                type="text"
                required
                value={formData.groupTag}
                onChange={(e) => setFormData({ ...formData, groupTag: e.target.value })}
                placeholder="دفعة 2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">كلمة المرور الأولية</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                توليد كلمة مرور قوية
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="StudentPass123!"
              dir="ltr"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {submitting ? "جاري الإنشاء..." : "حفظ وإنشاء الحساب"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات الطالب"
        description="تحديث المعلومات الأكاديمية أو إعادة تعيين كلمة المرور"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الأكاديمي</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة</label>
              <input
                type="text"
                required
                value={formData.groupTag}
                onChange={(e) => setFormData({ ...formData, groupTag: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">إعادة تعيين كلمة المرور (اتركه فارغاً للإبقاء عليها)</label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                توليد كلمة سر
              </button>
            </div>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="اكتب كلمة سر جديدة إذا أردت تغييرها"
              dir="ltr"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-left font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {submitting ? "جاري التحديث..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
