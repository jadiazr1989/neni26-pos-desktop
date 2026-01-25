let cachedTerminalId: string | null = null;

export function setTerminalIdForRequests(id: string | null): void {
  const v = id?.trim() ?? "";
  cachedTerminalId = v.length > 5 ? v : null;
}

export function getTerminalIdForRequests(): string | null {
  return cachedTerminalId;
}
