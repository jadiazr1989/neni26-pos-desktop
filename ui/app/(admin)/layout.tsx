import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";

import { AppShell } from "@/components/features/shell/AppShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/pos");
  }

  return (
    <AppShell area="admin" initialUser={user}>
      {children}
    </AppShell>
  );
}
