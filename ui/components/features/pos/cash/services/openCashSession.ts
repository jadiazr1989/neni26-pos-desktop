// components/features/pos/cash/services/openCashSession.ts
import { apiFetchEnvelope } from "@/lib/api";
import type { ApiEnvelope, OpenCashRequestDTO, OpenCashResponseDTO } from "@/lib/api.types";
import { isApiOk } from "@/lib/api.guards";

export async function openCashSession(input: { terminalId: string; payload: OpenCashRequestDTO }): Promise<OpenCashResponseDTO> {
  const res = await apiFetchEnvelope<ApiEnvelope<OpenCashResponseDTO>>(
    "/api/v1/cash-sessions/open",
    { method: "POST", headers: { "x-terminal-id": input.terminalId }, body: JSON.stringify(input.payload) }
  );

  const env = res.data;
  if (!isApiOk(env)) throw new Error(env.error.message);
  return env.data;
}
