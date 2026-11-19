import type { Metadata } from "next";
import { Readex_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MED ZONE | المنصة الأكاديمية والامتحانية الموحدة",
  description: "المنظومة السريرية المتقدمة لتعليم واختبارات علوم التخدير والرعاية الحرجة - MED ZONE Vanguard",
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readex.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#060a12] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
