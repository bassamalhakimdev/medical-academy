import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";

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
    <AppShell
      variant="student"
      user={{ name: user.name, email: user.email, studentId: user.studentId }}
    >
      {children}
    </AppShell>
  );
}
