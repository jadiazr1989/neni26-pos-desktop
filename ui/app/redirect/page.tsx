import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import RedirectClient from "./redirect-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RedirectPage() {
  const user = await getServerSession();
  if (!user) redirect("/login");

  // Renderiza un client component que decide por terminal + rol
  return <RedirectClient role={user.role} />;
}
