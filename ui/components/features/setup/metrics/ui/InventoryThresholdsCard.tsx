"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";

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
import {
  AsyncComboboxSingle,
  type ComboboxOption,
} from "@/components/shared/AsyncComboboxSingle";
import type {
  InventoryLowStockThresholdsDTO,
  InventoryLowStockThresholdsDetailsDTO,
} from "@/lib/modules/settings/settings.dto";
import {
  useMyWarehouseVariantIndex,
  type VariantPick,
} from "@/components/features/purchases/hooks/useMyWarehouseVariantIndex";

type Props = {
  value: InventoryLowStockThresholdsDTO;
  details?: InventoryLowStockThresholdsDetailsDTO | null;
  onSubmit: (
    input: Partial<InventoryLowStockThresholdsDTO>
  ) => Promise<InventoryLowStockThresholdsDTO>;
  onRefresh: () => Promise<void>;
};

type VariantThresholdItem = {
  variantId: string;
  label: string;
  sku: string | null;
  threshold: string;
};

type FormState = {
  defaultThreshold: string;
  items: VariantThresholdItem[];
};

function getVariantDisplayName(variant: {
  title?: string | null;
  productName?: string | null;
  label?: string | null;
  id: string;
}): string {
  return (
    variant.title?.trim() ||
    variant.productName?.trim() ||
    variant.label?.trim() ||
    variant.id
  );
}

function buildItemsFromDetails(
  details?: InventoryLowStockThresholdsDetailsDTO | null
): VariantThresholdItem[] {
  return (details?.items ?? [])
    .map((item) => ({
      variantId: item.variantId,
      label: item.label,
      sku: item.sku ?? item.barcode ?? null,
      threshold: String(item.threshold),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function buildItemsFromValue(
  value: InventoryLowStockThresholdsDTO,
  byId?: Map<string, VariantPick>
): VariantThresholdItem[] {
  return Object.entries(value.byVariant ?? {})
    .map(([variantId, threshold]) => {
      const found = byId?.get(variantId) ?? null;

      return {
        variantId,
        label: found ? getVariantDisplayName(found) : variantId,
        sku: found?.sku ?? found?.barcode ?? null,
        threshold: String(threshold),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function toFormState(
  value: InventoryLowStockThresholdsDTO,
  byId?: Map<string, VariantPick>,
  details?: InventoryLowStockThresholdsDetailsDTO | null
): FormState {
  const itemsFromDetails = buildItemsFromDetails(details);

  return {
    defaultThreshold: String(value.defaultThreshold ?? 0),
    items:
      itemsFromDetails.length > 0
        ? itemsFromDetails
        : buildItemsFromValue(value, byId),
  };
}

function buildPayload(form: FormState): InventoryLowStockThresholdsDTO {
  const defaultThreshold = Number(form.defaultThreshold);

  if (!Number.isFinite(defaultThreshold) || defaultThreshold < 0) {
    throw new Error("El nivel mínimo general debe ser un número válido mayor o igual a 0.");
  }

  const byVariant: Record<string, number> = {};

  for (const item of form.items) {
    const threshold = Number(item.threshold);

    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new Error(`Cantidad inválida para "${item.label}".`);
    }

    byVariant[item.variantId] = Math.trunc(threshold);
  }

  return {
    defaultThreshold: Math.trunc(defaultThreshold),
    byVariant,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function InventoryThresholdsCard(props: Props): JSX.Element {
  const inv = useMyWarehouseVariantIndex({ maxItems: 800, pageSize: 150 });

  const [form, setForm] = useState<FormState>(() =>
    toFormState(props.value, undefined, props.details)
  );
  const [saving, setSaving] = useState(false);

  const [pickerValue, setPickerValue] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerThreshold, setPickerThreshold] = useState("0");
  const [pickerVisible, setPickerVisible] = useState<VariantPick[]>([]);

  const ensureLoaded = async (): Promise<void> => {
    await inv.ensureLoaded();
    setPickerVisible(inv.searchLocal(pickerSearch));
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPickerVisible(inv.searchLocal(pickerSearch));
    }, 150);

    return () => window.clearTimeout(t);
  }, [pickerSearch, inv]);

  useEffect(() => {
    setForm(toFormState(props.value, inv.byId, props.details));
  }, [props.value, props.details, inv.byId]);

  const dirty = useMemo(() => {
    const initial = toFormState(props.value, inv.byId, props.details);
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, props.value, props.details, inv.byId]);

  const options: ComboboxOption[] = useMemo(
    () =>
      pickerVisible.map((item) => ({
        value: item.id,
        label: getVariantDisplayName(item),
        description: item.sku ?? item.barcode ?? undefined,
      })),
    [pickerVisible]
  );

  const handleAddVariant = (): void => {
    const variantId = pickerValue?.trim();
    if (!variantId) {
      notify.warning({
        title: "Selecciona un producto",
        description: "Primero debes seleccionar un producto de la lista.",
      });
      return;
    }

    const picked = inv.byId.get(variantId);
    if (!picked) {
      notify.error({
        title: "Producto no encontrado",
        description: "No se pudo encontrar el producto seleccionado.",
      });
      return;
    }

    const threshold = Number(pickerThreshold);
    if (!Number.isFinite(threshold) || threshold < 0) {
      notify.warning({
        title: "Cantidad inválida",
        description: "La cantidad mínima debe ser un número mayor o igual a 0.",
      });
      return;
    }

    const label = getVariantDisplayName(picked);

    setForm((prev) => {
      const exists = prev.items.some((item) => item.variantId === variantId);

      if (exists) {
        notify.warning({
          title: "Producto ya agregado",
          description: "Ese producto ya está en la lista. Puedes cambiar su cantidad abajo.",
        });
        return prev;
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            variantId,
            label,
            sku: picked.sku ?? picked.barcode ?? null,
            threshold: String(Math.trunc(threshold)),
          },
        ].sort((a, b) => a.label.localeCompare(b.label, "es")),
      };
    });

    setPickerValue(null);
    setPickerSearch("");
    setPickerThreshold("0");
  };

  const handleChangeItemThreshold = (variantId: string, threshold: string): void => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.variantId === variantId ? { ...item, threshold } : item
      ),
    }));
  };

  const handleRemoveItem = (variantId: string): void => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.variantId !== variantId),
    }));
  };

  const handleReset = (): void => {
    setForm(toFormState(props.value, inv.byId, props.details));
    setPickerValue(null);
    setPickerSearch("");
    setPickerThreshold("0");
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setSaving(true);

      const payload = buildPayload(form);

      await props.onSubmit(payload);

      notify.success({
        title: "Nivel mínimo de inventario actualizado",
        description: "La configuración se guardó correctamente.",
      });

      await props.onRefresh();
    } catch (error: unknown) {
      notify.error({
        title: "No se pudo guardar la configuración",
        description: getErrorMessage(
          error,
          "Ocurrió un error al guardar la configuración de inventario."
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Boxes className="size-5 text-muted-foreground" />
          <CardTitle>Nivel mínimo de inventario</CardTitle>
        </div>
        <CardDescription>
          Define cuándo un producto se considera bajo en inventario.
          <br />
          Cuando la cantidad disponible llegue a este valor o menos, el sistema mostrará una advertencia.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div className="grid gap-2 md:max-w-sm">
          <Label htmlFor="inventory-defaultThreshold">Nivel mínimo general</Label>
          <p className="text-xs text-muted-foreground">
            Cantidad mínima recomendada para todos los productos.
            <br />
            Ejemplo: si pones 5, cuando queden 5 o menos el sistema avisará.
          </p>
          <Input
            id="inventory-defaultThreshold"
            type="number"
            min={0}
            value={form.defaultThreshold}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, defaultThreshold: e.target.value }))
            }
            disabled={saving}
          />
        </div>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Productos con nivel especial</Label>
            <p className="text-xs text-muted-foreground">
              Aquí puedes poner una cantidad mínima diferente para productos específicos.
            </p>
          </div>

          <div className="grid gap-3 rounded-xl border p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto]">
              <div className="grid gap-2">
                <Label>Producto</Label>
                <AsyncComboboxSingle
                  value={pickerValue}
                  onChange={(id) => setPickerValue(id)}
                  disabled={saving}
                  placeholder="Seleccionar producto..."
                  searchPlaceholder="Escribe nombre o SKU..."
                  emptyText="Sin resultados"
                  loadState={inv.loadState}
                  loadError={inv.loadError}
                  items={options}
                  search={pickerSearch}
                  setSearch={setPickerSearch}
                  ensureLoaded={ensureLoaded}
                  showPill={false}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inventory-picker-threshold">Cantidad mínima</Label>
                <Input
                  id="inventory-picker-threshold"
                  type="number"
                  min={0}
                  value={pickerThreshold}
                  onChange={(e) => setPickerThreshold(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  disabled={saving}
                  className="w-full lg:w-auto"
                >
                  <Plus className="mr-2 size-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {form.items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No hay productos con nivel especial configurado.
            </div>
          ) : (
            <div className="grid gap-2">
              {form.items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium leading-5">
                      {item.label}
                    </div>
                    <div className="truncate text-xs text-muted-foreground leading-4">
                      {item.sku ? item.sku : "Producto con nivel especial"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-start gap-1">
                     
                      <Input
                        type="number"
                        min={0}
                        value={item.threshold}
                        onChange={(e) =>
                          handleChangeItemThreshold(item.variantId, e.target.value)
                        }
                        disabled={saving}
                        className="h-9 w-24"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.variantId)}
                      disabled={saving}
                      className="mt- h-9 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Quitar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || !dirty}
          >
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