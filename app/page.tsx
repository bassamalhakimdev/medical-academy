import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, KeyRound, PenLine, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: KeyRound,
    title: "سجّل الدخول",
    text: "ادخل بحسابك الجامعي الذي زودتك به إدارة الكلية.",
  },
  {
    icon: PenLine,
    title: "أدِّ اختبارك",
    text: "تظهر اختباراتك المجدولة في موعدها، وتُحفظ إجاباتك تلقائياً.",
  },
  {
    icon: BarChart3,
    title: "اطّلع على نتيجتك",
    text: "راجع درجتك وإجاباتك فور اعتماد النتائج.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  // Signed-in users still see the landing page, but the call-to-action
  // takes them straight to their dashboard instead of the login form.
  const cta = user
    ? { href: user.role === "admin" ? "/admin" : "/student", label: "الدخول إلى لوحتي" }
    : { href: "/login", label: "تسجيل الدخول" };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-white/90 backdrop-blur-lg border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full ring-1 ring-slate-200 bg-white p-1 flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="MED ZONE"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </span>
            <span className="text-[15px] font-bold tracking-[0.18em] text-slate-900" dir="ltr">
              MED ZONE
            </span>
          </Link>

          <Link
            href={cta.href}
            className="inline-flex items-center px-5 h-10 rounded-full text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:ring-slate-900 transition-all"
          >
            {cta.label}
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <main className="flex-1 pt-16">
        <section className="min-h-[calc(100svh-4rem)] flex items-center border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <Image
              src="/logo.webp"
              alt="MED ZONE"
              width={96}
              height={96}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-10"
              priority
            />

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.25] text-slate-900">
              منصة الاختبارات الإلكترونية
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed">
              أدِّ اختباراتك، وتابع نتائجك، في مكان واحد.
            </p>

            <div className="mt-12">
              <Link
                href={cta.href}
                className="group inline-flex items-center gap-3 h-12 px-8 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <span>{cta.label}</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="bg-slate-50/60">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <h2 className="text-center text-sm font-semibold tracking-wide text-slate-400 mb-16">
              كيف تعمل المنصة
            </h2>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center mb-6">
                      <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                    </div>
                    <span className="block text-xs font-semibold text-slate-400 mb-2" dir="ltr">
                      0{i + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                      {step.text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-[0.15em]" dir="ltr">
              MED ZONE
            </span>
            <span>•</span>
            <span>منصة الاختبارات الإلكترونية المعتمدة</span>
          </div>
          <div>
            <span>جميع الحقوق محفوظة © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
