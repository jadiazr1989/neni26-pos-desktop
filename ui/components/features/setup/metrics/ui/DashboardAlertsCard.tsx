"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify/notify";
import type { DashboardAlertsThresholdsDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: DashboardAlertsThresholdsDTO;
  onSubmit: (
    input: Partial<DashboardAlertsThresholdsDTO>
  ) => Promise<DashboardAlertsThresholdsDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = Record<keyof DashboardAlertsThresholdsDTO, string>;

function toFormState(value: DashboardAlertsThresholdsDTO): FormState {
  return {
    openSessionHoursWarn: String(value.openSessionHoursWarn),
    cashDiffMinorWarn: String(value.cashDiffMinorWarn),
    cashDiffMinorCritical: String(value.cashDiffMinorCritical),
    refundRateWarnBps: String(value.refundRateWarnBps),
    refundRateCriticalBps: String(value.refundRateCriticalBps),
    pendingAdjustmentsWarn: String(value.pendingAdjustmentsWarn),
    pendingAdjustmentsCritical: String(value.pendingAdjustmentsCritical),
    pendingAdjustmentsOverHoursWarn: String(value.pendingAdjustmentsOverHoursWarn),
    pendingAdjustmentsOverHoursCritical: String(value.pendingAdjustmentsOverHoursCritical),
    lowStockCriticalCount: String(value.lowStockCriticalCount),
  };
}

function parseForm(form: FormState): DashboardAlertsThresholdsDTO {
  const out = {} as DashboardAlertsThresholdsDTO;

  (Object.keys(form) as Array<keyof DashboardAlertsThresholdsDTO>).forEach((key) => {
    const n = Number(form[key]);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`Valor inválido para ${key}.`);
    }
    out[key] = Math.trunc(n) as never;
  });

  return out;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function DashboardAlertsCard(props: Props): JSX.Element {
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

      await props.onSubmit(parseForm(form));

      notify.success({
        title: "Alertas del negocio actualizadas",
        description: "La configuración de alertas se guardó correctamente.",
      });

      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración",
        description: getErrorMessage(
          error,
          "Ocurrió un error al guardar la configuración de alertas."
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setForm(toFormState(props.value));
  };

  const updateField = (key: keyof DashboardAlertsThresholdsDTO, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellRing className="size-5 text-muted-foreground" />
          <CardTitle>Alertas del negocio</CardTitle>
        </div>
        <CardDescription>
          Estos valores determinan cuándo el sistema debe mostrar advertencias
          para indicar que algo necesita atención en la tienda.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="grid gap-2">
            <Label>Horas máximas con la caja abierta</Label>
            <p className="text-xs text-muted-foreground">
              Cantidad de horas que una caja puede estar abierta antes de mostrar
              una advertencia.
            </p>
            <Input
              type="number"
              min={0}
              value={form.openSessionHoursWarn}
              onChange={(e) => updateField("openSessionHoursWarn", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Diferencia de efectivo (advertencia)</Label>
            <p className="text-xs text-muted-foreground">
              Si la diferencia entre el dinero contado y el esperado supera este
              valor, el sistema mostrará una alerta.
            </p>
            <Input
              type="number"
              min={0}
              value={form.cashDiffMinorWarn}
              onChange={(e) => updateField("cashDiffMinorWarn", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Diferencia de efectivo (crítico)</Label>
            <p className="text-xs text-muted-foreground">
              Si la diferencia es mayor que este valor, se considera un problema
              importante.
            </p>
            <Input
              type="number"
              min={0}
              value={form.cashDiffMinorCritical}
              onChange={(e) => updateField("cashDiffMinorCritical", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Porcentaje de devoluciones (advertencia)</Label>
            <p className="text-xs text-muted-foreground">
              Si muchas ventas terminan en devolución, el sistema avisará.
            </p>
            <Input
              type="number"
              min={0}
              value={form.refundRateWarnBps}
              onChange={(e) => updateField("refundRateWarnBps", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Porcentaje de devoluciones (crítico)</Label>
            <p className="text-xs text-muted-foreground">
              Nivel alto de devoluciones. Debe revisarse con prioridad.
            </p>
            <Input
              type="number"
              min={0}
              value={form.refundRateCriticalBps}
              onChange={(e) => updateField("refundRateCriticalBps", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Ajustes de inventario pendientes (advertencia)</Label>
            <p className="text-xs text-muted-foreground">
              Cantidad de ajustes sin revisar antes de mostrar una alerta.
            </p>
            <Input
              type="number"
              min={0}
              value={form.pendingAdjustmentsWarn}
              onChange={(e) => updateField("pendingAdjustmentsWarn", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Ajustes de inventario pendientes (crítico)</Label>
            <p className="text-xs text-muted-foreground">
              Si hay demasiados ajustes sin revisar, se considera un problema
              importante.
            </p>
            <Input
              type="number"
              min={0}
              value={form.pendingAdjustmentsCritical}
              onChange={(e) => updateField("pendingAdjustmentsCritical", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Ajustes pendientes por muchas horas (advertencia)</Label>
            <p className="text-xs text-muted-foreground">
              Horas máximas que un ajuste puede estar pendiente antes de mostrar
              una advertencia.
            </p>
            <Input
              type="number"
              min={0}
              value={form.pendingAdjustmentsOverHoursWarn}
              onChange={(e) =>
                updateField("pendingAdjustmentsOverHoursWarn", e.target.value)
              }
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Ajustes pendientes por muchas horas (crítico)</Label>
            <p className="text-xs text-muted-foreground">
              Si un ajuste lleva demasiadas horas pendiente, se considera un
              problema serio.
            </p>
            <Input
              type="number"
              min={0}
              value={form.pendingAdjustmentsOverHoursCritical}
              onChange={(e) =>
                updateField("pendingAdjustmentsOverHoursCritical", e.target.value)
              }
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Productos con inventario bajo (crítico)</Label>
            <p className="text-xs text-muted-foreground">
              Cantidad de productos con inventario bajo a partir de la cual el
              sistema mostrará una alerta crítica.
            </p>
            <Input
              type="number"
              min={0}
              value={form.lowStockCriticalCount}
              onChange={(e) => updateField("lowStockCriticalCount", e.target.value)}
              disabled={saving}
            />
          </div>
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