"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/notify/notify";
import type { CashBusinessHoursDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: CashBusinessHoursDTO;
  onSubmit: (input: Partial<CashBusinessHoursDTO>) => Promise<CashBusinessHoursDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = {
  timeZone: string;
  opensAt: string;
  closesAt: string;
  lastOpenAt: string;
  warnBeforeMinutes: string;
  allowMultipleSessionsPerDay: boolean;
};

function toFormState(value: CashBusinessHoursDTO): FormState {
  return {
    timeZone: value.timeZone ?? "",
    opensAt: value.opensAt ?? "",
    closesAt: value.closesAt ?? "",
    lastOpenAt: value.lastOpenAt ?? "",
    warnBeforeMinutes: (value.warnBeforeMinutes ?? []).join(", "),
    allowMultipleSessionsPerDay: Boolean(value.allowMultipleSessionsPerDay),
  };
}

function normalizeTimeOrNull(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^([01]?\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
    throw new Error(`Hora inválida: "${trimmed}". Usa formato HH:mm.`);
  }
  return trimmed;
}

function parseWarnBeforeMinutes(input: string): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const values = trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const n = Number(item);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error(`Valor inválido en avisos previos: "${item}".`);
      }
      return Math.trunc(n);
    });

  return Array.from(new Set(values)).sort((a, b) => b - a);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function PosCashSettingsCard(props: Props): JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(props.value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(toFormState(props.value));
  }, [props.value]);

  const dirty = useMemo(() => {
    const initial = toFormState(props.value);
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, props.value]);

  const handleSubmit = async (): Promise<void> => {
    try {
      setSaving(true);

      const payload: Partial<CashBusinessHoursDTO> = {
        timeZone: form.timeZone.trim() || null,
        opensAt: normalizeTimeOrNull(form.opensAt),
        closesAt: normalizeTimeOrNull(form.closesAt),
        lastOpenAt: form.lastOpenAt.trim() ? normalizeTimeOrNull(form.lastOpenAt) : null,
        warnBeforeMinutes: parseWarnBeforeMinutes(form.warnBeforeMinutes),
        allowMultipleSessionsPerDay: form.allowMultipleSessionsPerDay,
      };

      await props.onSubmit(payload);
      notify.success({
        title: "Configuración de caja actualizada",
        description: "Los horarios y reglas operativas de caja fueron guardados correctamente.",
      });
      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración de caja",
        description: getErrorMessage(error, "Ocurrió un error guardando la configuración de caja."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setForm(toFormState(props.value));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock3 className="size-5 text-muted-foreground" />
          <CardTitle>Caja</CardTitle>
        </div>
        <CardDescription>
          Define horario operativo, avisos de cierre y si se permiten múltiples sesiones por día.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="cash-timeZone">Zona horaria</Label>
            <Input
              id="cash-timeZone"
              value={form.timeZone}
              onChange={(e) => setForm((prev) => ({ ...prev, timeZone: e.target.value }))}
              placeholder="America/Havana"
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cash-warnBeforeMinutes">Avisos previos (minutos)</Label>
            <Input
              id="cash-warnBeforeMinutes"
              value={form.warnBeforeMinutes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, warnBeforeMinutes: e.target.value }))
              }
              placeholder="120, 60, 30"
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cash-opensAt">Abre a</Label>
            <Input
              id="cash-opensAt"
              type="time"
              value={form.opensAt}
              onChange={(e) => setForm((prev) => ({ ...prev, opensAt: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cash-closesAt">Cierra a</Label>
            <Input
              id="cash-closesAt"
              type="time"
              value={form.closesAt}
              onChange={(e) => setForm((prev) => ({ ...prev, closesAt: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cash-lastOpenAt">Última hora para abrir</Label>
            <Input
              id="cash-lastOpenAt"
              type="time"
              value={form.lastOpenAt}
              onChange={(e) => setForm((prev) => ({ ...prev, lastOpenAt: e.target.value }))}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Permitir múltiples sesiones por día</p>
            <p className="text-sm text-muted-foreground">
              Útil si manejas reaperturas, turnos o más de un cierre durante el día operativo.
            </p>
          </div>

          <Switch
            checked={form.allowMultipleSessionsPerDay}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                allowMultipleSessionsPerDay: checked,
              }))
            }
            disabled={saving}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving || !dirty}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={saving || !dirty}
          >
            Restablecer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}