"use client";

import { useTerminalStore } from "@/stores/terminal.store";

export type DeviceTerminalStatus = {
  hydrated: boolean;
  xTerminalId: string | null;
  hasTerminal: boolean;
};

export function useDeviceTerminal(): DeviceTerminalStatus {
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  return {
    hydrated,
    xTerminalId,
    hasTerminal: Boolean(xTerminalId),
  };
}
