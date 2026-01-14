import type { ApiStatus, StationStatus } from "./types";

export function computeStationStatus(params: {
  sessionStatus: "unknown" | "authenticated" | "unauthenticated";
  terminalReady: boolean;
  apiStatus: ApiStatus;
  cashOpen: boolean;
}): StationStatus {
  const { sessionStatus, terminalReady, apiStatus, cashOpen } = params;

  if (sessionStatus === "unknown") return { label: "Loading…", tone: "muted" };
  if (sessionStatus === "unauthenticated") return { label: "Not signed in", tone: "danger" };
  if (!terminalReady) return { label: "Needs Setup", tone: "warning" };
  if (apiStatus === "offline") return { label: "Offline", tone: "danger" };
  if (!cashOpen) return { label: "Cash Closed", tone: "warning" };
  return { label: "Ready", tone: "success" };
}

export function salesBlockReason(params: {
  terminalReady: boolean;
  cashOpen: boolean;
  apiStatus: ApiStatus;
}): string | null {
  if (params.apiStatus === "offline") return "Offline";
  if (!params.terminalReady) return "Terminal required";
  if (!params.cashOpen) return "Open cash to sell";
  return null;
}

export function catalogBlockReason(params: {
  terminalReady: boolean;
  apiStatus: ApiStatus;
}): string | null {
  if (params.apiStatus === "offline") return "Offline";
  if (!params.terminalReady) return "Terminal required";
  return null;
}
