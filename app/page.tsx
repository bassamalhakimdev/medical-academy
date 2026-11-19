import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/student");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs">
              <Image
                src="/logo.webp"
                alt="شعار الكلية - MED ZONE"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg">
                MED ZONE
              </span>
              <span className="text-[10px] text-teal-700 block font-bold">
                الموقع الامتحاني للكلية
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
          >
            <span>تسجيل الدخول</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Official Logo Banner */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 p-2.5 mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/logo.webp"
              alt="شعار الموقع الامتحاني للكلية - MED ZONE"
              width={112}
              height={112}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>الموقع الامتحاني المعتمد للكلية • MED ZONE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            المنصة الامتحانية الموحدة للكلية <br />
            <span className="bg-gradient-to-r from-teal-700 via-sky-700 to-blue-800 bg-clip-text text-transparent">
              MED ZONE Examination Portal
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            منظومة إلكترونية متكاملة لإجراء الاختبارات الطبية، متابعة الأداء الأكاديمي، وإدارة جداول وبنوك الأسئلة وفق أعلى معايير الجودة الأكاديمية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-sky-700 hover:from-teal-800 hover:to-sky-800 shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
            >
              <span>الدخول إلى منصة الامتحانات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-right">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">محتوى سريري متخصص</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              أسئلة متعددة الاختيارات في تدبير المجرى الهوائي الصعب، التخدير الناحي، وأدوية التحريض التخديري مع الشروحات السريرية.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">محرك اختبارات ذري وآمن</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تحقق دقيق من الوقت على الخادم، حفظ تلقائي مستمر للإجابات، منع التكرار، وتصحيح فوري فائق الدقة.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">جدولة فردية وجماعية</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              إمكانية تخصيص أوقات ومدد امتحانات خاصة لمجموعات الأطباء أو لطلاب محددين بمرونة كاملة عبر لوحة الإدارة.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        جميع الحقوق محفوظة © {new Date().getFullYear()} MED ZONE • الموقع الامتحاني المعتمد للكلية
      </footer>
    </div>
  );
}
