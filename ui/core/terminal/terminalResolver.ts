// core/terminal/terminalResolver.ts
let cachedTerminalId: string | null = null;
const KEY = "x-terminal-id";

export function setTerminalIdForRequests(id: string | null): void {
  const v = id?.trim() ?? "";
  cachedTerminalId = v.length > 5 ? v : null;
}

export function getTerminalIdForRequests(): string | null {
  if (cachedTerminalId) return cachedTerminalId;
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KEY);
  const v = raw?.trim() ?? "";
  cachedTerminalId = v.length > 5 ? v : null;
  return cachedTerminalId;
}
