import { apiClient } from "@/lib/api/apiClient";
import type { TerminalPort } from "./terminal.port";
import type {
  CreateTerminalInput,
  CreateTerminalResponse,
  HandshakeRequest,
  HandshakeResponse,
  ListTerminalsQuery,
  ListTerminalsResponse,
  PatchTerminalInput,
  PatchTerminalResponse,
} from "./terminal.dto";

function toQuery(params?: ListTerminalsQuery): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.warehouseId) qs.set("warehouseId", params.warehouseId);
  if (typeof params.take === "number") qs.set("take", String(params.take));
  if (typeof params.skip === "number") qs.set("skip", String(params.skip));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class TerminalHttpAdapter implements TerminalPort {
  list(params?: ListTerminalsQuery): Promise<ListTerminalsResponse> {
    return apiClient.json(`/api/v1/terminals${toQuery(params)}`, { method: "GET" });
  }

  handshake(body: HandshakeRequest): Promise<HandshakeResponse> {
    return apiClient.json("/api/v1/terminals/handshake", { method: "POST", body });
  }

  create(input: CreateTerminalInput): Promise<CreateTerminalResponse> {
    return apiClient.json("/api/v1/terminals", { method: "POST", body: input });
  }

  patch(id: string, input: PatchTerminalInput): Promise<PatchTerminalResponse> {
    return apiClient.json(`/api/v1/terminals/${id}`, { method: "PATCH", body: input });
  }
}

export const terminalHttp = new TerminalHttpAdapter();
