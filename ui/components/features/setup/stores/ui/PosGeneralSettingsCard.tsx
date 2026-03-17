"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notify } from "@/lib/notify/notify";
import type { PosGeneralSettingsDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: PosGeneralSettingsDTO;
  onSubmit: (input: Partial<PosGeneralSettingsDTO>) => Promise<PosGeneralSettingsDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = {
  storeNameOverride: string;
  defaultCurrency: "CUP" | "USD" | "EUR";
  allowNegativeStockSale: boolean;
  requireTerminalAssigned: boolean;
};

function toFormState(value: PosGeneralSettingsDTO): FormState {
  return {
    storeNameOverride: value.storeNameOverride ?? "",
    defaultCurrency: value.defaultCurrency,
    allowNegativeStockSale: value.allowNegativeStockSale,
    requireTerminalAssigned: value.requireTerminalAssigned,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function PosGeneralSettingsCard(props: Props): JSX.Element {
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

      const payload: Partial<PosGeneralSettingsDTO> = {
        storeNameOverride: form.storeNameOverride.trim() || null,
        defaultCurrency: form.defaultCurrency,
        allowNegativeStockSale: form.allowNegativeStockSale,
        requireTerminalAssigned: form.requireTerminalAssigned,
      };

      await props.onSubmit(payload);
      notify.success({
        title: "Configuración general actualizada",
        description: "Los cambios de operación general fueron guardados correctamente.",
      });
      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración general",
        description: getErrorMessage(error, "Ocurrió un error guardando la configuración general."),
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
          <Store className="size-5 text-muted-foreground" />
          <CardTitle>General</CardTitle>
        </div>
        <CardDescription>
          Ajustes globales del negocio para el comportamiento del POS.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="general-storeNameOverride">Nombre visible de la tienda</Label>
            <Input
              id="general-storeNameOverride"
              value={form.storeNameOverride}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, storeNameOverride: e.target.value }))
              }
              placeholder="Opcional"
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label>Moneda por defecto</Label>
            <Select
              value={form.defaultCurrency}
              onValueChange={(value: "CUP" | "USD" | "EUR") =>
                setForm((prev) => ({ ...prev, defaultCurrency: value }))
              }
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUP">CUP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Permitir venta con stock negativo</p>
              <p className="text-sm text-muted-foreground">
                Si está activo, el POS podrá completar ventas aunque el inventario quede por debajo de cero.
              </p>
            </div>

            <Switch
              checked={form.allowNegativeStockSale}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, allowNegativeStockSale: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Requerir terminal asignada</p>
              <p className="text-sm text-muted-foreground">
                Fuerza que el dispositivo actual tenga terminal configurada para operar.
              </p>
            </div>

            <Switch
              checked={form.requireTerminalAssigned}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, requireTerminalAssigned: checked }))
              }
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