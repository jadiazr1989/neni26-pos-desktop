"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { HandshakeRequest, HandshakeResponse } from "@/lib/cash.types";

import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { BootLoading } from "@/components/ui/boot-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api/fetch";

type BootState = "init" | "handshaking" | "done" | "error";

type DevDefaults = {
  warehouseId: string;
  code: string;
  name: string;
  hostname: string;
  ipAddress?: string;
};

export function BootScreen() {
  const router = useRouter();

  const sessionStatus = useSessionStore((s) => s.status);
  const role = useSessionStore((s) => s.user?.role ?? null);

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrateTerminal = useTerminalStore((s) => s.hydrate);
  const setXTerminalId = useTerminalStore((s) => s.setXTerminalId);

  const [state, setState] = useState<BootState>("init");
  const [message, setMessage] = useState("Initializing device…");
  const [error, setError] = useState<string | null>(null);

  const canSetup = role === "ADMIN" || role === "MANAGER";

  const defaults = useMemo<DevDefaults>(
    () => ({
      warehouseId: "00000000-0000-0000-0000-000000000002",
      code: "POS-01",
      name: "POS 01 (Dev)",
      hostname: "localhost",
    }),
    []
  );

  // 1) hidrata terminal guardado 
  useEffect(() => {
    hydrateTerminal();
  }, [hydrateTerminal]);

  // 2) si no hay sesión -> login
  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.replace("/login");
  }, [sessionStatus, router]);

  // 3) si ya hay terminal -> POS
  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (!xTerminalId) return;
    router.replace("/pos");
  }, [sessionStatus, xTerminalId, router]);

  // 4) si hay sesión pero no terminal -> handshake
  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (xTerminalId) return; // ✅ no repitas handshake
    let mounted = true;

    const boot = async (): Promise<void> => {
      setError(null);
      setState("handshaking");
      setMessage(`Handshaking terminal: ${defaults.code}…`);

      try {
        const payload: HandshakeRequest = {
          warehouseId: defaults.warehouseId,
          code: defaults.code,
          name: defaults.name,
          hostname: defaults.hostname,
          ...(defaults.ipAddress ? { ipAddress: defaults.ipAddress } : {}),
        };

        // ✅ apiFetch devuelve json.data directo
        const dto = await apiFetch<HandshakeResponse>("/api/v1/terminals/handshake", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const id = dto?.terminal?.id ?? null;
        if (!id) throw new Error("Handshake response missing terminal.id");

        setXTerminalId(id);

        if (!mounted) return;
        setState("done");
        setMessage("Device ready. Redirecting…");
        router.replace("/pos");
      } catch (e: unknown) {
        if (!mounted) return;

        const msg = e instanceof Error ? e.message : "Boot failed";
        setState("error");
        setError(msg);

        if (canSetup) {
          setMessage("Device not configured. Go to Setup…");
          router.replace("/admin/setup");
          return;
        }

        setMessage("Device not configured. Please contact a manager to run Setup.");
      }
    };

    void boot();
    return () => {
      mounted = false;
    };
  }, [sessionStatus, xTerminalId, defaults, canSetup, router, setXTerminalId]);
  // 1) Mientras inicia o hace handshake
  if (state === "init" || state === "handshaking") {
    return <BootLoading />; // 👈 skeleton + spinner
  }

  // 2) Error real
  if (state === "error") {
    return (
      <div className="grid place-items-center">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl text-zinc-100">Boot</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-red-800 bg-red-950">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>

              {canSetup && (
                <Button
                  className="w-full"
                  onClick={() => router.replace("/admin/setup")}
                >
                  Go to Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3) En cualquier otro caso (success → redirect)
  return null;

}
