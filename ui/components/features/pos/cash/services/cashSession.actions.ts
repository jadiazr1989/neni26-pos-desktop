import type { CurrencyCode, CashCountReportDTO } from "@/lib/api.types";
import { apiFetchEnvelope } from "@/lib/api";

export type CashCounted = Partial<Record<CurrencyCode, number>>;

export type CashCountRequestDTO = { counted: CashCounted };
export type CashCountResponseDTO = { report: CashCountReportDTO };

export type CashCloseRequestDTO = { counted: CashCounted };
export type CashCloseResponseDTO = {
  cashSession: { id: string; closedAt: string | null };
};


export async function countCashSession(input: {
  terminalId: string;
  cashSessionId: string;
  counted: CashCounted;
}): Promise<CashCountResponseDTO> {
  const res = await apiFetchEnvelope<CashCountResponseDTO>(
    `/api/v1/cash-sessions/${input.cashSessionId}/count`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-terminal-id": input.terminalId,
      },
      body: JSON.stringify({ counted: input.counted } satisfies CashCountRequestDTO),
    }
  );

  return res.data;
}

export async function closeCashSession(input: {
  terminalId: string;
  cashSessionId: string;
  counted: CashCounted;
}): Promise<CashCloseResponseDTO> {
  const res = await apiFetchEnvelope<CashCloseResponseDTO>(
    `/api/v1/cash-sessions/${input.cashSessionId}/close`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-terminal-id": input.terminalId,
      },
      body: JSON.stringify({ counted: input.counted } satisfies CashCloseRequestDTO),
    }
  );

  return res.data;
}
