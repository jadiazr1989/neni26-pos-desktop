// src/lib/modules/cash/cash.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { CashPort } from "./cash.port";
import type {
  ActiveCashResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  CashCountRequest,
  CashCountResponse,
  CashCloseRequest,
  CashCloseResponse,
  OpenCashRequest,
  OpenCashResponse,
} from "./cash.dto";

function toCsvQuery(qs?: { pretty?: boolean; money?: "decimal" }): string {
  if (!qs) return "";
  const s = new URLSearchParams();
  if (typeof qs.pretty === "boolean") s.set("pretty", String(qs.pretty));
  if (qs.money) s.set("money", qs.money);
  const out = s.toString();
  return out ? `?${out}` : "";
}

export class CashHttpAdapter implements CashPort {
  active(): Promise<ActiveCashResponse> {
    return apiClient.json(`/api/v1/cash-sessions/active`, { method: "GET" });
  }

  open(input: OpenCashRequest): Promise<OpenCashResponse> {
    return apiClient.json(`/api/v1/cash-sessions/open`, { method: "POST", body: input });
  }

  count(cashSessionId: string, input: CashCountRequest): Promise<CashCountResponse> {
    return apiClient.json(`/api/v1/cash-sessions/${cashSessionId}/count`, { method: "POST", body: input });
  }

  close(cashSessionId: string, input: CashCloseRequest): Promise<CashCloseResponse> {
    return apiClient.json(`/api/v1/cash-sessions/${cashSessionId}/close`, { method: "POST", body: input });
  }

  // opcional: si quieres unificar authorize en este módulo
  authorize(input: AuthorizeRequest): Promise<AuthorizeResponse> {
    return apiClient.json(`/api/v1/auth/authorize`, { method: "POST", body: input });
  }

  // exports opcionales
  zReportCsv(cashSessionId: string, qs?: { pretty?: boolean; money?: "decimal" }): Promise<string> {
    return apiClient.text(`/api/v1/cash-sessions/${cashSessionId}/z-report.csv${toCsvQuery(qs)}`, { method: "GET" });
  }

  zReportPdf(cashSessionId: string): Promise<Blob> {
    return apiClient.blob(`/api/v1/cash-sessions/${cashSessionId}/z-report.pdf`, { method: "GET" });
  }
}
