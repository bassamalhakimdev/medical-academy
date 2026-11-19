import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";

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
    <AppShell variant="admin" user={{ name: user.name, email: user.email }}>
      {children}
    </AppShell>
  );
}
