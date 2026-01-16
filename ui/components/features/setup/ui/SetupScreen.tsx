"use client";

import { useRouter } from "next/navigation";
import { JSX, useMemo, useState } from "react";

import { apiFetchEnvelope } from "@/lib/api/fetch";
import type { HandshakeRequest, HandshakeResponse } from "@/lib/cash.types";

import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTerminals, type TerminalDTO } from "../hooks/useTerminals";
import { CreateTerminalDialog } from "../ui/CreateTerminalDialog";
import { TerminalList } from "../ui/TerminalList";

export function SetupScreen(): JSX.Element {
  const router = useRouter();

  const user = useSessionStore((s) => s.user);
  const role = user?.role ?? null;
  const canSetup = role === "ADMIN" || role === "MANAGER";

  const setXTerminalId = useTerminalStore((s) => s.setXTerminalId);

  const { loading, terminals, error, reload } = useTerminals();
  const [selecting, setSelecting] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);

  const defaultWarehouseId = useMemo(() => {
    return terminals[0]?.warehouseId ?? "00000000-0000-0000-0000-000000000002";
  }, [terminals]);

  const hostname = useMemo(() => {
    if (typeof window === "undefined") return "localhost";
    return window.location.hostname || "localhost";
  }, []);

  if (!canSetup) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-100 p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Forbidden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-300">Setup requires ADMIN or MANAGER.</p>
            <Button onClick={() => router.replace("/dashboard")}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSelectTerminal = async (t: TerminalDTO): Promise<void> => {
    setSelectError(null);
    setSelecting(true);
    try {
      const payload: HandshakeRequest = {
        warehouseId: t.warehouseId,
        code: t.code as string, // UI ya bloquea si no hay code
        name: t.name,
        hostname,
      };

      const out = await apiFetchEnvelope<HandshakeResponse>("/api/v1/terminals/handshake", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setXTerminalId(out.data.terminal.id);
      router.replace("/dashboard");
    } catch (e: unknown) {
      setSelectError(e instanceof Error ? e.message : "Handshake failed");
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Setup Device</CardTitle>
            <p className="text-xs text-zinc-400">
              Choose a terminal for this device. This will set the required <span className="font-mono">x-terminal-id</span>.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {(error || selectError) && (
              <Alert className="border-red-800 bg-red-950">
                <AlertDescription className="text-red-200">
                  {selectError ?? error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => void reload()} disabled={loading || selecting}>
                {loading ? "Loading…" : "Refresh"}
              </Button>

              <CreateTerminalDialog
                defaultWarehouseId={defaultWarehouseId}
                onCreated={() => void reload()}
              />
            </div>

            <TerminalList terminals={terminals} selecting={selecting} onSelect={onSelectTerminal} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
