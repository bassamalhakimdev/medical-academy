import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { BookOpen, Award, User, Home, Sparkles } from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "student") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-[#00f5a0]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed inset-0 clinical-grid pointer-events-none opacity-35 -z-10" />

      <Navbar user={user} />

      {/* High-Tech Student Sub-Navigation Ribbon */}
      <div className="bg-[#080d1a]/90 backdrop-blur-xl border-b border-white/10 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8 h-12 text-xs font-bold overflow-x-auto no-scrollbar">
            <Link
              href="/student"
              className="flex items-center gap-2 text-slate-300 hover:text-[#00f5a0] transition-colors py-3 border-b-2 border-transparent hover:border-[#00f5a0] shrink-0"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>قمرة التقييم السريري</span>
            </Link>
            <Link
              href="/student/exams"
              className="flex items-center gap-2 text-slate-300 hover:text-[#00f5a0] transition-colors py-3 border-b-2 border-transparent hover:border-[#00f5a0] shrink-0"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>جدول الاختبارات المتاحة</span>
            </Link>
            <Link
              href="/student/results"
              className="flex items-center gap-2 text-slate-300 hover:text-[#00f5a0] transition-colors py-3 border-b-2 border-transparent hover:border-[#00f5a0] shrink-0"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>سجل الإنجاز والدرجات</span>
            </Link>
            <Link
              href="/student/profile"
              className="flex items-center gap-2 text-slate-300 hover:text-[#00f5a0] transition-colors py-3 border-b-2 border-transparent hover:border-[#00f5a0] shrink-0 mr-auto"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>بطاقة الطبيب المقيم</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
