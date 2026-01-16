"use client";

import { JSX, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/fetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CreateTerminalRequest = {
  warehouseId: string;
  code: string;
  name: string;
  hostname?: string | null;
  ipAddress?: string | null;
};

type CreatedId = { id: string };

export function CreateTerminalDialog(props: {
  defaultWarehouseId?: string | null;
  onCreated: () => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostname = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.hostname || "localhost";
  }, []);

  const [form, setForm] = useState<CreateTerminalRequest>({
    warehouseId: props.defaultWarehouseId ?? "",
    code: "POS-01",
    name: "Front Counter",
    hostname,
    ipAddress: null,
  });

  const onSubmit = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      await apiFetch<CreatedId>("/api/v1/terminals", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setOpen(false);
      props.onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create terminal failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Create terminal
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-100">Create terminal</div>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
          Close
        </Button>
      </div>

      {error && (
        <Alert className="border-red-800 bg-red-950">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        <div className="space-y-1">
          <Label className="text-zinc-200">Warehouse ID</Label>
          <Input
            value={form.warehouseId}
            onChange={(e) => setForm((p) => ({ ...p, warehouseId: e.target.value }))}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-zinc-200">Code</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-zinc-200">Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-zinc-200">Hostname</Label>
          <Input
            value={form.hostname ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, hostname: e.target.value }))}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>

        <Button onClick={() => void onSubmit()} disabled={loading}>
          {loading ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  );
}
