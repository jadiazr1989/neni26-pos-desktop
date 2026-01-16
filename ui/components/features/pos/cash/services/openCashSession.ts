// components/features/pos/cash/services/openCashSession.ts\
import { ApiEnvelope, isApiOk } from "@/lib/api.guards";
import { apiFetchEnvelope } from "@/lib/api/fetch";
import type { OpenCashRequestDTO, OpenCashResponseDTO } from "@/lib/cash.types";

export async function openCashSession(input: { terminalId: string; payload: OpenCashRequestDTO }): Promise<OpenCashResponseDTO> {
  const res = await apiFetchEnvelope<ApiEnvelope<OpenCashResponseDTO>>(
    "/api/v1/cash-sessions/open",
    { method: "POST", headers: { "x-terminal-id": input.terminalId }, body: JSON.stringify(input.payload) }
  );

  const env = res.data;
  if (!isApiOk(env)) throw new Error(env.error.message);
  return env.data;
}
