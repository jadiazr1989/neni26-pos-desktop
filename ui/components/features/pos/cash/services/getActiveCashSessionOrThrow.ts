// ui/components/features/pos/cash/services/getActiveCashSessionOrThrow.ts
import { ApiResult } from "@/lib/api/envelope";
import { apiFetchEnvelope } from "@/lib/api/fetch";
import type { ActiveCashResponseDTO } from "@/lib/cash.types";

export async function getActiveCashSessionOrThrow(input: {
  terminalId: string;
}): Promise<ActiveCashResponseDTO> {
  const result: ApiResult<ActiveCashResponseDTO> =
    await apiFetchEnvelope<ActiveCashResponseDTO>(
      "/api/v1/cash-sessions/active",
      {
        method: "GET",
        headers: { "x-terminal-id": input.terminalId },
      }
    );

  // ✅ aquí result.data ES ActiveCashResponseDTO
  return result.data;
}
