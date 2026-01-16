// components/features/pos/cash/services/getActiveCashSession.ts
import { isApiOk } from "@/lib/api.guards";
import { ApiEnvelope } from "@/lib/api/envelope";
import { apiFetchEnvelope } from "@/lib/api/fetch";
import type { ActiveCashResponseDTO } from "@/lib/cash.types";

export async function getActiveCashSession(input: { terminalId: string }): Promise<ActiveCashResponseDTO> {
  const res = await apiFetchEnvelope<ApiEnvelope<ActiveCashResponseDTO>>(
    "/api/v1/cash-sessions/active",
    { method: "GET", headers: { "x-terminal-id": input.terminalId } }
  );

  const env = res.data;
  if (!isApiOk(env)) throw new Error(env.error.message);
  return env.data;
}
