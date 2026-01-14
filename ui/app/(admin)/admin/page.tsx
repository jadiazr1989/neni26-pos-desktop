import { redirect } from "next/navigation";

export default function AdminHome() {
  // Por ahora, si solo existe Setup, manda ahí.
  // Cuando tengas dashboard admin real, aquí lo renderizas.
  redirect("/admin/setup");
}
