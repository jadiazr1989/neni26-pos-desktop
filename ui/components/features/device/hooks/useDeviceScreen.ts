// src/modules/admin/device/hooks/useDeviceScreen.ts
"use client";

import * as React from "react";
import { terminalService } from "@/lib/modules/terminals/terminal.service";
import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";
import { useTerminalStore } from "@/stores/terminal.store";
import { notify } from "@/lib/notify/notify";

type Vm = {
  terminals: TerminalDTO[];
  loading: boolean;
  error: string | null;

  xTerminalId: string | null;
  hydrated: boolean;

  selectedId: string;
  setSelectedId: (v: string) => void;

  manualId: string;
  setManualId: (v: string) => void;

  refresh: () => Promise<void>;
  assignSelected: () => Promise<void>;
  assignManual: () => Promise<void>;
  clearDeviceTerminal: () => Promise<void>;
};

export function useDeviceScreen(): Vm {
  const hydrate = useTerminalStore((s) => s.hydrate);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const setXTerminalId = useTerminalStore((s) => s.setXTerminalId);
  const clear = useTerminalStore((s) => s.clear);

  const [terminals, setTerminals] = React.useState<TerminalDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedId, setSelectedId] = React.useState("");
  const [manualId, setManualId] = React.useState("");

  React.useEffect(() => {
    void hydrate(); // idempotente
  }, [hydrate]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await terminalService.list();
      const active = res.terminals.filter((t) => t.isActive);
      setTerminals(active);

      // default selección
      if (!selectedId && active.length) setSelectedId(active[0]!.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo cargar terminales.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const assignSelected = React.useCallback(async () => {
    const id = selectedId.trim();
    if (!id) {
      notify.warning({ title: "Selecciona un terminal", description: "Debes elegir un terminal de la lista." });
      return;
    }

    setLoading(true);
    try {
      // Validar que existe y está activo
      await terminalService.handshakeById({ terminalId: id });

      await setXTerminalId(id);
      notify.success({ title: "Terminal asignado", description: "Este dispositivo ya tiene terminal configurado." });
    } catch (e: unknown) {
      notify.error({ title: "No se pudo asignar", description: e instanceof Error ? e.message : "Error desconocido" });
    } finally {
      setLoading(false);
    }
  }, [selectedId, setXTerminalId]);

  const assignManual = React.useCallback(async () => {
    const id = manualId.trim();
    if (!id) {
      notify.warning({ title: "TerminalId requerido", description: "Pega el UUID del terminal." });
      return;
    }

    setLoading(true);
    try {
      await terminalService.handshakeById({ terminalId: id });
      await setXTerminalId(id);
      setManualId("");
      notify.success({ title: "Terminal asignado", description: "Terminal validado y guardado en este dispositivo." });
    } catch (e: unknown) {
      notify.error({ title: "Terminal inválido", description: e instanceof Error ? e.message : "Error desconocido" });
    } finally {
      setLoading(false);
    }
  }, [manualId, setXTerminalId]);

  const clearDeviceTerminal = React.useCallback(async () => {
    await clear();
    notify.success({ title: "Terminal removido", description: "Este dispositivo quedó sin terminal asignado." });
  }, [clear]);

  return {
    terminals,
    loading,
    error,
    xTerminalId,
    hydrated,
    selectedId,
    setSelectedId,
    manualId,
    setManualId,
    refresh,
    assignSelected,
    assignManual,
    clearDeviceTerminal,
  };
}
