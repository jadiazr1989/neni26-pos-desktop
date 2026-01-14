// components/features/pos/cash/services/getActiveCashSession.ts
import { apiFetchEnvelope } from "@/lib/api";
import type { ActiveCashResponseDTO, ApiEnvelope } from "@/lib/api.types";
import { isApiOk } from "@/lib/api.guards";

export async function getActiveCashSession(input: { terminalId: string }): Promise<ActiveCashResponseDTO> {
  const res = await apiFetchEnvelope<ApiEnvelope<ActiveCashResponseDTO>>(
    "/api/v1/cash-sessions/active",
    { method: "GET", headers: { "x-terminal-id": input.terminalId } }
  );

  const env = res.data;
  if (!isApiOk(env)) throw new Error(env.error.message);
  return env.data;
}
