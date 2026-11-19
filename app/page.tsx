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
  Activity,
  Cpu,
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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Cyber-Surgical Ambient Lights */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/12 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[#00f5a0]/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute inset-0 clinical-grid pointer-events-none opacity-30 -z-10" />

      {/* Top Header */}
      <header className="w-full bg-[#050811]/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Image
                src="/logo.webp"
                alt="شعار الكلية - MED ZONE"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-black text-white text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                MED ZONE
              </span>
              <span className="text-[10px] text-[#00f5a0] block font-bold">
                المنظومة السريرية المعتمدة
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] hover:brightness-110 shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all"
          >
            <span>بوابة تسجيل الدخول</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center relative">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Official Holographic Logo Container */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1329] to-[#040814] border-2 border-cyan-500/40 p-3.5 shadow-[0_0_40px_rgba(6,182,212,0.35)] mx-auto mb-4 flex items-center justify-center group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] rounded-3xl blur-sm opacity-35 group-hover:opacity-70 transition duration-500" />
            <Image
              src="/logo.webp"
              alt="شعار الموقع الامتحاني للكلية - MED ZONE"
              width={120}
              height={120}
              className="w-full h-full object-contain relative z-10"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-bold border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
            <span>الصرح الأكاديمي والامتحاني المعتمد للكلية • MED ZONE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            المنصة السريرية والامتحانية الموحدة <br />
            <span className="bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-sky-400 bg-clip-text text-transparent">
              MED ZONE Clinical Examination Portal
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            منظومة سريرية متقدمة لتعليم واختبارات علوم التخدير والرعاية الحرجة، مصممة وفق أرفع معايير البورد الأكاديمي والتحقق الزمني الذري الآمن.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#00f5a0] via-cyan-400 to-[#00e5ff] hover:brightness-110 shadow-[0_0_25px_rgba(0,245,160,0.35)] active:scale-98 transition-all"
            >
              <span>دخول بوابة الامتحانات السريرية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-right">
          <div className="p-6 rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-lg hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm mb-1.5">محتوى سريري فائق التخصص</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              أسئلة متعددة الاختيارات في تدبير المجرى الهوائي الصعب، التخدير الناحي، وأدوية التحريض التخديري مع الشروحات السريرية المرجعية.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-lg hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-[#00f5a0] flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm mb-1.5">محرك اختبارات ذري فائق الأمان</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تحقق دقيق من الوقت المتبقي عبر ساعة الخادم، حفظ تلقائي فوري للإجابات السريرية، ومنع الازدواجية أو التلاعب.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a1122]/90 border border-white/10 shadow-lg hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm mb-1.5">جدولة فردية وجماعية مرنة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تخصيص نوافذ ومدد الاختبارات لدفعات المقيمين أو لاختبارات تعويضية مخصصة لطبيب معين بنقرة واحدة عبر قمرة الإدارة.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#050811]/90 border-t border-white/10 py-6 text-center text-xs text-slate-500 font-mono">
        جميع الحقوق محفوظة © {new Date().getFullYear()} MED ZONE • المنظومة الامتحانية المعتمدة للكلية
      </footer>
    </div>
  );
}
