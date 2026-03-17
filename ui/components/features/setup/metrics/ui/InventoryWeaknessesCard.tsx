"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { TrendingDown } from "lucide-react";

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
import type { InventoryDashboardWeaknessesDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: InventoryDashboardWeaknessesDTO;
  onSubmit: (
    input: Partial<InventoryDashboardWeaknessesDTO>
  ) => Promise<InventoryDashboardWeaknessesDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = Record<keyof InventoryDashboardWeaknessesDTO, string>;

function toFormState(value: InventoryDashboardWeaknessesDTO): FormState {
  return {
    lookbackDays: String(value.lookbackDays),
    overstockThreshold: String(value.overstockThreshold),
    slowMovingSoldThreshold: String(value.slowMovingSoldThreshold),
    lowCoverDays: String(value.lowCoverDays),
    overCoverDays: String(value.overCoverDays),
  };
}

function parseForm(form: FormState): InventoryDashboardWeaknessesDTO {
  const lookbackDays = Number(form.lookbackDays);
  const overstockThreshold = Number(form.overstockThreshold);
  const slowMovingSoldThreshold = Number(form.slowMovingSoldThreshold);
  const lowCoverDays = Number(form.lowCoverDays);
  const overCoverDays = Number(form.overCoverDays);

  const values = [
    ["lookbackDays", lookbackDays],
    ["overstockThreshold", overstockThreshold],
    ["slowMovingSoldThreshold", slowMovingSoldThreshold],
    ["lowCoverDays", lowCoverDays],
    ["overCoverDays", overCoverDays],
  ] as const;

  for (const [label, value] of values) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Valor inválido para ${label}.`);
    }
  }

  return {
    lookbackDays: Math.trunc(lookbackDays),
    overstockThreshold: Math.trunc(overstockThreshold),
    slowMovingSoldThreshold: Math.trunc(slowMovingSoldThreshold),
    lowCoverDays,
    overCoverDays,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function InventoryWeaknessesCard(props: Props): JSX.Element {
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
        title: "Análisis del inventario actualizado",
        description: "La configuración se guardó correctamente.",
      });

      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración",
        description: getErrorMessage(
          error,
          "Ocurrió un error al guardar la configuración analítica del inventario."
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setForm(toFormState(props.value));
  };

  const updateField = (key: keyof InventoryDashboardWeaknessesDTO, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="size-5 text-muted-foreground" />
          <CardTitle>Análisis del inventario</CardTitle>
        </div>
        <CardDescription>
          El sistema usa estos valores para detectar problemas como productos que
          no se venden, exceso de inventario o inventario insuficiente.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="grid gap-2">
            <Label>Días de análisis</Label>
            <p className="text-xs text-muted-foreground">
              Cantidad de días que el sistema analizará para estudiar las ventas.
            </p>
            <Input
              type="number"
              min={1}
              value={form.lookbackDays}
              onChange={(e) => updateField("lookbackDays", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Cantidad para considerar sobrestock</Label>
            <p className="text-xs text-muted-foreground">
              Cantidad a partir de la cual el sistema considera que hay demasiado
              producto almacenado.
            </p>
            <Input
              type="number"
              min={0}
              value={form.overstockThreshold}
              onChange={(e) => updateField("overstockThreshold", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Ventas mínimas para rotación</Label>
            <p className="text-xs text-muted-foreground">
              Si se vende menos que este valor en el período analizado, el producto
              se considera de poca rotación.
            </p>
            <Input
              type="number"
              min={0}
              value={form.slowMovingSoldThreshold}
              onChange={(e) =>
                updateField("slowMovingSoldThreshold", e.target.value)
              }
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Días mínimos de cobertura</Label>
            <p className="text-xs text-muted-foreground">
              Si el inventario alcanza para menos días que este número, el sistema
              avisará que puede faltar producto.
            </p>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={form.lowCoverDays}
              onChange={(e) => updateField("lowCoverDays", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Días máximos de cobertura</Label>
            <p className="text-xs text-muted-foreground">
              Si el inventario alcanza para más días que este número, significa que
              hay demasiado producto guardado.
            </p>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={form.overCoverDays}
              onChange={(e) => updateField("overCoverDays", e.target.value)}
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