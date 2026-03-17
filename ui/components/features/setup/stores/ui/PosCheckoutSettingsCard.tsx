"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import type { PosCheckoutSettingsDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: PosCheckoutSettingsDTO;
  onSubmit: (input: Partial<PosCheckoutSettingsDTO>) => Promise<PosCheckoutSettingsDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = {
  allowMixedPayments: boolean;
  allowSplitPayments: boolean;
  defaultPaymentMethod: "CASH" | "CARD" | "TRANSFER" | "OTHER" | "NONE";
  requireCustomerForSale: boolean;
  autoPrintReceipt: boolean;
};

function toFormState(value: PosCheckoutSettingsDTO): FormState {
  return {
    allowMixedPayments: value.allowMixedPayments,
    allowSplitPayments: value.allowSplitPayments,
    defaultPaymentMethod: value.defaultPaymentMethod ?? "NONE",
    requireCustomerForSale: value.requireCustomerForSale,
    autoPrintReceipt: value.autoPrintReceipt,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function PosCheckoutSettingsCard(props: Props): JSX.Element {
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

      const payload: Partial<PosCheckoutSettingsDTO> = {
        allowMixedPayments: form.allowMixedPayments,
        allowSplitPayments: form.allowSplitPayments,
        defaultPaymentMethod: form.defaultPaymentMethod === "NONE" ? null : form.defaultPaymentMethod,
        requireCustomerForSale: form.requireCustomerForSale,
        autoPrintReceipt: form.autoPrintReceipt,
      };

      await props.onSubmit(payload);
      notify.success({
        title: "Checkout actualizado",
        description: "Los cambios del flujo de cobro fueron guardados correctamente.",
      });
      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración de checkout",
        description: getErrorMessage(error, "Ocurrió un error guardando la configuración de checkout."),
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
          <ShoppingCart className="size-5 text-muted-foreground" />
          <CardTitle>Checkout</CardTitle>
        </div>
        <CardDescription>
          Reglas del flujo de pago, cliente y comportamiento al finalizar la venta.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-2 md:max-w-sm">
          <Label>Método de pago por defecto</Label>
          <Select
            value={form.defaultPaymentMethod}
            onValueChange={(value: FormState["defaultPaymentMethod"]) =>
              setForm((prev) => ({ ...prev, defaultPaymentMethod: value }))
            }
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Sin valor por defecto</SelectItem>
              <SelectItem value="CASH">CASH</SelectItem>
              <SelectItem value="CARD">CARD</SelectItem>
              <SelectItem value="TRANSFER">TRANSFER</SelectItem>
              <SelectItem value="OTHER">OTHER</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Permitir pagos mixtos</p>
              <p className="text-sm text-muted-foreground">
                Habilita combinar distintos métodos de pago en una misma venta.
              </p>
            </div>

            <Switch
              checked={form.allowMixedPayments}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, allowMixedPayments: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Permitir split payments</p>
              <p className="text-sm text-muted-foreground">
                Permite dividir el monto entre múltiples pagos o entradas.
              </p>
            </div>

            <Switch
              checked={form.allowSplitPayments}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, allowSplitPayments: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Requerir cliente para la venta</p>
              <p className="text-sm text-muted-foreground">
                Si está activo, no se podrá completar la venta sin cliente asociado.
              </p>
            </div>

            <Switch
              checked={form.requireCustomerForSale}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, requireCustomerForSale: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Imprimir recibo automáticamente</p>
              <p className="text-sm text-muted-foreground">
                Intenta disparar la impresión del recibo al completar la venta.
              </p>
            </div>

            <Switch
              checked={form.autoPrintReceipt}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, autoPrintReceipt: checked }))
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