import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { PosGate, PosShell } from "@/components/features/pos/shell";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  return (
    <PosShell initialUser={user}>
      <PosGate />
      {children}
    </PosShell>
  );
}
