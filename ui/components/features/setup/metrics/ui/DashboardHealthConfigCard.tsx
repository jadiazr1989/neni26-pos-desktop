"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { HeartPulse } from "lucide-react";

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
import type { DashboardHealthConfigDTO } from "@/lib/modules/settings/settings.dto";

type Props = {
  value: DashboardHealthConfigDTO;
  onSubmit: (
    input: Partial<DashboardHealthConfigDTO>
  ) => Promise<DashboardHealthConfigDTO>;
  onRefresh: () => Promise<void>;
};

type FormState = Record<keyof DashboardHealthConfigDTO, string>;

function toFormState(value: DashboardHealthConfigDTO): FormState {
  return {
    wGrossMargin: String(value.wGrossMargin),
    wRefundRate: String(value.wRefundRate),
    wDiscountRate: String(value.wDiscountRate),
    wCashVariance: String(value.wCashVariance),
    wInventoryRuptures: String(value.wInventoryRuptures),
    wInventoryLowStock: String(value.wInventoryLowStock),
    wOpenOrdersAging: String(value.wOpenOrdersAging),
    wPendingAdjustments: String(value.wPendingAdjustments),

    minGrossMarginPctBpsOk: String(value.minGrossMarginPctBpsOk),
    minGrossMarginPctBpsWarn: String(value.minGrossMarginPctBpsWarn),

    maxRefundRateBpsOk: String(value.maxRefundRateBpsOk),
    maxRefundRateBpsWarn: String(value.maxRefundRateBpsWarn),

    maxDiscountRateBpsOk: String(value.maxDiscountRateBpsOk),
    maxDiscountRateBpsWarn: String(value.maxDiscountRateBpsWarn),

    cashVarianceWarnMinor: String(value.cashVarianceWarnMinor),
    cashVarianceCriticalMinor: String(value.cashVarianceCriticalMinor),

    rupturesWarnCount: String(value.rupturesWarnCount),
    rupturesCriticalCount: String(value.rupturesCriticalCount),

    lowStockWarnCount: String(value.lowStockWarnCount),
    lowStockCriticalCount: String(value.lowStockCriticalCount),

    openOrdersOver7dWarnCount: String(value.openOrdersOver7dWarnCount),
    openOrdersOver14dCriticalCount: String(value.openOrdersOver14dCriticalCount),

    pendingAdjustmentsWarnCount: String(value.pendingAdjustmentsWarnCount),
    pendingAdjustmentsCriticalCount: String(value.pendingAdjustmentsCriticalCount),
  };
}

function parseForm(form: FormState): DashboardHealthConfigDTO {
  const out = {} as DashboardHealthConfigDTO;

  (Object.keys(form) as Array<keyof DashboardHealthConfigDTO>).forEach((key) => {
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

const fields: Array<{
  key: keyof DashboardHealthConfigDTO;
  label: string;
  help: string;
}> = [
  {
    key: "wGrossMargin",
    label: "Importancia de la ganancia",
    help: "Define qué tan importante es la ganancia para calcular la salud general del negocio.",
  },
  {
    key: "wRefundRate",
    label: "Importancia de las devoluciones",
    help: "Indica cuánto afectan las devoluciones al resultado general.",
  },
  {
    key: "wDiscountRate",
    label: "Importancia de los descuentos",
    help: "Controla cuánto afectan los descuentos a la salud del negocio.",
  },
  {
    key: "wCashVariance",
    label: "Importancia de diferencias en caja",
    help: "Si hay diferencias entre el dinero esperado y el contado, esto impacta el resultado.",
  },
  {
    key: "wInventoryRuptures",
    label: "Importancia de productos agotados",
    help: "Mide cuánto afectan al negocio los productos sin existencia.",
  },
  {
    key: "wInventoryLowStock",
    label: "Importancia de inventario bajo",
    help: "Mide cuánto afecta tener productos casi agotados.",
  },
  {
    key: "wOpenOrdersAging",
    label: "Importancia de pedidos abiertos mucho tiempo",
    help: "Evalúa cuánto afectan los pedidos que llevan demasiados días sin cerrarse.",
  },
  {
    key: "wPendingAdjustments",
    label: "Importancia de ajustes pendientes",
    help: "Indica cuánto afectan los ajustes de inventario que aún no se revisan.",
  },

  {
    key: "minGrossMarginPctBpsOk",
    label: "Ganancia mínima saludable (%)",
    help: "Porcentaje mínimo de ganancia para considerar que el negocio va bien.",
  },
  {
    key: "minGrossMarginPctBpsWarn",
    label: "Ganancia mínima en advertencia (%)",
    help: "Si la ganancia baja de este valor, el sistema mostrará advertencia.",
  },

  {
    key: "maxRefundRateBpsOk",
    label: "Devoluciones aceptables (%)",
    help: "Porcentaje máximo de devoluciones que todavía se considera normal.",
  },
  {
    key: "maxRefundRateBpsWarn",
    label: "Devoluciones en advertencia (%)",
    help: "Si las devoluciones superan este nivel, se mostrará advertencia.",
  },

  {
    key: "maxDiscountRateBpsOk",
    label: "Descuento máximo aceptable (%)",
    help: "Porcentaje de descuento que todavía se considera normal.",
  },
  {
    key: "maxDiscountRateBpsWarn",
    label: "Descuento alto (%)",
    help: "Si el descuento supera este valor, el sistema lo señalará como advertencia.",
  },

  {
    key: "cashVarianceWarnMinor",
    label: "Diferencia de caja (advertencia)",
    help: "Monto de diferencia en caja a partir del cual el sistema mostrará advertencia.",
  },
  {
    key: "cashVarianceCriticalMinor",
    label: "Diferencia de caja (crítico)",
    help: "Monto de diferencia en caja que se considera grave.",
  },

  {
    key: "rupturesWarnCount",
    label: "Productos agotados (advertencia)",
    help: "Cantidad de productos agotados a partir de la cual se mostrará advertencia.",
  },
  {
    key: "rupturesCriticalCount",
    label: "Productos agotados (crítico)",
    help: "Cantidad de productos agotados que se considera crítica.",
  },

  {
    key: "lowStockWarnCount",
    label: "Productos con poco inventario (advertencia)",
    help: "Cantidad de productos con inventario bajo para mostrar advertencia.",
  },
  {
    key: "lowStockCriticalCount",
    label: "Productos con poco inventario (crítico)",
    help: "Cantidad de productos con inventario bajo que se considera grave.",
  },

  {
    key: "openOrdersOver7dWarnCount",
    label: "Pedidos abiertos más de 7 días (advertencia)",
    help: "Cantidad de pedidos abiertos por más de 7 días para mostrar alerta.",
  },
  {
    key: "openOrdersOver14dCriticalCount",
    label: "Pedidos abiertos más de 14 días (crítico)",
    help: "Cantidad de pedidos abiertos por más de 14 días que se considera grave.",
  },

  {
    key: "pendingAdjustmentsWarnCount",
    label: "Ajustes pendientes (advertencia)",
    help: "Cantidad de ajustes pendientes para mostrar advertencia.",
  },
  {
    key: "pendingAdjustmentsCriticalCount",
    label: "Ajustes pendientes (crítico)",
    help: "Cantidad de ajustes pendientes que se considera crítica.",
  },
];

export function DashboardHealthConfigCard(props: Props): JSX.Element {
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
        title: "Salud del negocio actualizada",
        description: "La configuración se guardó correctamente.",
      });

      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración",
        description: getErrorMessage(
          error,
          "Ocurrió un error al guardar la configuración de salud del negocio."
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setForm(toFormState(props.value));
  };

  const updateField = (key: keyof DashboardHealthConfigDTO, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartPulse className="size-5 text-muted-foreground" />
          <CardTitle>Salud del negocio</CardTitle>
        </div>
        <CardDescription>
          Estos valores ayudan al sistema a calcular qué tan bien está
          funcionando el negocio usando ventas, inventario, devoluciones y caja.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label>{field.label}</Label>
              <p className="text-xs text-muted-foreground">{field.help}</p>
              <Input
                type="number"
                min={0}
                value={form[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
                disabled={saving}
              />
            </div>
          ))}
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