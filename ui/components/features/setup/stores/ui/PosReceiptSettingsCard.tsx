"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notify } from "@/lib/notify/notify";
import type { PosReceiptSettingsDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: PosReceiptSettingsDTO;
  onSubmit: (input: Partial<PosReceiptSettingsDTO>) => Promise<PosReceiptSettingsDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = {
  showStoreLogo: boolean;
  showTerminal: boolean;
  showCashier: boolean;
  footerText: string;
  paperWidth: "58mm" | "80mm";
};

function toFormState(value: PosReceiptSettingsDTO): FormState {
  return {
    showStoreLogo: value.showStoreLogo,
    showTerminal: value.showTerminal,
    showCashier: value.showCashier,
    footerText: value.footerText ?? "",
    paperWidth: value.paperWidth,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function PosReceiptSettingsCard(props: Props): JSX.Element {
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

      const payload: Partial<PosReceiptSettingsDTO> = {
        showStoreLogo: form.showStoreLogo,
        showTerminal: form.showTerminal,
        showCashier: form.showCashier,
        footerText: form.footerText.trim() || null,
        paperWidth: form.paperWidth,
      };

      await props.onSubmit(payload);
      notify.success({
        title: "Recibo actualizado",
        description: "Los cambios de presentación del recibo fueron guardados correctamente.",
      });
      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración del recibo",
        description: getErrorMessage(error, "Ocurrió un error guardando la configuración del recibo."),
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
          <Receipt className="size-5 text-muted-foreground" />
          <CardTitle>Recibo</CardTitle>
        </div>
        <CardDescription>
          Controla la información visual que se imprime o se muestra en el comprobante.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:max-w-sm">
            <Label>Ancho de papel</Label>
            <Select
              value={form.paperWidth}
              onValueChange={(value: "58mm" | "80mm") =>
                setForm((prev) => ({ ...prev, paperWidth: value }))
              }
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ancho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58mm">58mm</SelectItem>
                <SelectItem value="80mm">80mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="receipt-footerText">Texto final</Label>
          <Textarea
            id="receipt-footerText"
            value={form.footerText}
            onChange={(e) => setForm((prev) => ({ ...prev, footerText: e.target.value }))}
            placeholder="Gracias por su compra"
            rows={4}
            disabled={saving}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mostrar logo de tienda</p>
              <p className="text-sm text-muted-foreground">
                Incluye la identidad visual de la tienda en el recibo.
              </p>
            </div>

            <Switch
              checked={form.showStoreLogo}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, showStoreLogo: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mostrar terminal</p>
              <p className="text-sm text-muted-foreground">
                Añade la terminal o estación POS asociada a la venta.
              </p>
            </div>

            <Switch
              checked={form.showTerminal}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, showTerminal: checked }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mostrar cajero</p>
              <p className="text-sm text-muted-foreground">
                Incluye la referencia del usuario/cajero que realizó la operación.
              </p>
            </div>

            <Switch
              checked={form.showCashier}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, showCashier: checked }))
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