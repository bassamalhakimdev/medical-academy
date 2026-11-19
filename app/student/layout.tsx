import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { BookOpen, Award, User, Home } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} />

      {/* Student Sub-nav */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-12 text-xs font-bold overflow-x-auto">
            <Link
              href="/student"
              className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors py-3 border-b-2 border-transparent hover:border-sky-600 shrink-0"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>
            <Link
              href="/student/exams"
              className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors py-3 border-b-2 border-transparent hover:border-sky-600 shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>اختباراتي والجدولة</span>
            </Link>
            <Link
              href="/student/results"
              className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors py-3 border-b-2 border-transparent hover:border-sky-600 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>النتائج ومراجعة الأداء</span>
            </Link>
            <Link
              href="/student/profile"
              className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors py-3 border-b-2 border-transparent hover:border-sky-600 shrink-0"
            >
              <User className="w-4 h-4" />
              <span>الملف الأكاديمي</span>
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
