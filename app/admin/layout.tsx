import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/student");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed inset-0 clinical-grid pointer-events-none opacity-40 -z-10" />

      <Navbar user={user} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
