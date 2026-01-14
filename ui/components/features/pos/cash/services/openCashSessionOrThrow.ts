// ui/components/features/pos/cash/services/openCashSessionOrThrow.ts
import { apiFetchEnvelope } from "@/lib/api";
import type { ApiResult, OpenCashRequestDTO, OpenCashResponseDTO } from "@/lib/api.types";

export async function openCashSessionOrThrow(input: {
  terminalId: string;
  payload: OpenCashRequestDTO;
}): Promise<OpenCashResponseDTO> {
  const result: ApiResult<OpenCashResponseDTO> =
    await apiFetchEnvelope<OpenCashResponseDTO>(
      "/api/v1/cash-sessions/open",
      {
        method: "POST",
        headers: { "x-terminal-id": input.terminalId },
        body: JSON.stringify(input.payload),
      }
    );

  return result.data;
}
