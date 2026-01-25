import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { TerminalsScreen } from "@/components/features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const user = await getServerSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MANAGER") redirect("/pos");

  return <TerminalsScreen />;
}
