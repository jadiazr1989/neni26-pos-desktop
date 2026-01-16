"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/fetch";

export type TerminalDTO = {
  id: string;
  warehouseId: string;
  name: string;
  code: string | null;
  hostname: string | null;
  ipAddress: string | null;
  isActive: boolean;
};

type TerminalsListResponse = {
  terminals: TerminalDTO[];
};

export function useTerminals() {
  const [loading, setLoading] = useState<boolean>(true);
  const [terminals, setTerminals] = useState<TerminalDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const out = await apiFetch<TerminalsListResponse>("/api/v1/terminals?take=50");
      setTerminals(out.terminals ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load terminals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { loading, terminals, error, reload };
}
