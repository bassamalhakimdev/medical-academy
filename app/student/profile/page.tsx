"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/Badge";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [dashRes, resultsRes] = await Promise.all([
        fetch("/api/student/dashboard"),
        fetch("/api/student/results"),
      ]);

      const dashData = await dashRes.json();
      const resultsData = await resultsRes.json();

      if (dashData.success) {
        setProfile(dashData.student);
      }
      if (resultsData.success) {
        setResults(resultsData.results || []);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        جاري تحميل الملف الأكاديمي...
      </div>
    );
  }

  const totalTaken = results.length;
  const passedCount = results.filter((r) => r.is_passed).length;
  const avgScore = totalTaken > 0
    ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalTaken) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-sky-600/20">
            {profile?.name ? profile.name.charAt(0) : "ط"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {profile?.name}
              </h1>
              <Badge variant="success">نشط</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-mono font-bold text-sky-700">{profile?.studentId}</span>
              <span>•</span>
              <span>طالب</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="px-3 py-1.5 text-xs">
            <GraduationCap className="w-4 h-4" />
            <span>{profile?.groupTag}</span>
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1">الاختبارات المنجزة</span>
          <span className="text-2xl font-black text-slate-900">{totalTaken}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1">نسبة الاجتياز</span>
          <span className="text-2xl font-black text-emerald-600">
            {totalTaken > 0 ? `${Math.round((passedCount / totalTaken) * 100)}%` : "0%"}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">({passedCount} اختبار ناجح)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1">متوسط الدرجات العام</span>
          <span className="text-2xl font-black text-sky-700">{avgScore}%</span>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>المعلومات الأكاديمية والتسجيل</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">الاسم الكامل</span>
            <span className="font-bold text-slate-800">{profile?.name}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">الرقم الأكاديمي</span>
            <span className="font-mono font-bold text-slate-800">{profile?.studentId}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">البريد الإلكتروني المعتمد</span>
            <span className="font-mono text-slate-800">{profile?.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">المجموعة التدريبية</span>
            <span className="font-bold text-slate-800">{profile?.groupTag}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          * يتم تحديث وتعديل البيانات وحالة الحساب حصراً عبر إدارة أكاديمية علوم التخدير.
        </div>
      </div>
    </div>
  );
}
