// src/modules/purchases/ui/detail/PurchaseItemPickerSmart.tsx
"use client";

import { AsyncComboboxSingle, type ComboboxOption } from "@/components/shared/AsyncComboboxSingle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify/notify";
import { Search } from "lucide-react";
import * as React from "react";
import { useMyWarehouseVariantIndex, type VariantPick } from "../../hooks/useMyWarehouseVariantIndex";

type Mode = "name" | "scanner";
type ScanType = "sku" | "barcode";

export function PurchaseItemPickerSmart(props: {
  disabled: boolean;
  onPick: (v: VariantPick) => void;
}) {
  const inv = useMyWarehouseVariantIndex({ maxItems: 800, pageSize: 150 });

  const [mode, setMode] = React.useState<Mode>("name");

  // name mode
  const [value, setValue] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [visible, setVisible] = React.useState<VariantPick[]>([]);

  // scanner mode
  const [scanType, setScanType] = React.useState<ScanType>("sku");
  const [code, setCode] = React.useState("");

  const ensureLoaded = React.useCallback(async () => {
    await inv.ensureLoaded();
    setVisible(inv.searchLocal(search));
  }, [inv, search]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setVisible(inv.searchLocal(search));
    }, 150);
    return () => window.clearTimeout(t);
  }, [search, inv]);

  const options: ComboboxOption[] = React.useMemo(
    () => visible.map((x) => ({ value: x.id, label: x.label })),
    [visible],
  );

  function pickAndReset(v: VariantPick) {
    props.onPick(v);
    setValue(null);
    setSearch("");
    setCode("");
  }

  async function submitScanner() {
    const c = code.trim();
    if (!c) return;

    // asegúrate de tener inventario cargado
    await inv.ensureLoaded();

    // intenta encontrar en lo que ya cargaste
    let found = inv.findByCode(c, scanType);

    // si no está y hay más páginas, opcionalmente seguimos cargando hasta encontrar o llegar maxItems
    // (esto es útil si el código existe pero aún no se cargó en memoria)
    while (!found && inv.hasMore) {
      await inv.loadMore();
      found = inv.findByCode(c, scanType);
      if (found) break;
      // corta si ya tenemos mucho
      if (inv.items.length >= 800) break;
    }

    if (!found) {
      notify.warning({
        title: "No encontrado en este almacén",
        description: `No se encontró por ${scanType.toUpperCase()} dentro del inventario del warehouse activo.`,
      });
      return;
    }

    pickAndReset(found);
  }

  return (
    <div className="space-y-2">
      {/* switch simple */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "name" ? "secondary" : "outline"}
          onClick={() => setMode("name")}
          disabled={props.disabled}
        >
          Buscar por nombre
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "scanner" ? "secondary" : "outline"}
          onClick={() => setMode("scanner")}
          disabled={props.disabled}
        >
          Scanner (SKU/Barcode)
        </Button>
      </div>

      {mode === "name" ? (
        <AsyncComboboxSingle
          value={value}
          onChange={(id) => {
            setValue(id);
            if (!id) return;

            const picked = inv.byId.get(id) ?? null;
            if (!picked) {
              notify.error({ title: "Error", description: "Variante no encontrada en inventario." });
              return;
            }
            pickAndReset(picked);
          }}
          disabled={props.disabled}
          placeholder="Seleccionar variante del almacén…"
          searchPlaceholder="Escribe nombre / SKU…"
          emptyText="Sin resultados"
          loadState={inv.loadState}
          loadError={inv.loadError}
          items={options}
          search={search}
          setSearch={setSearch}
          ensureLoaded={ensureLoaded}
          showPill={false}
          className="w-full"
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={scanType === "sku" ? "secondary" : "outline"}
              onClick={() => setScanType("sku")}
              disabled={props.disabled}
            >
              SKU
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scanType === "barcode" ? "secondary" : "outline"}
              onClick={() => setScanType("barcode")}
              disabled={props.disabled}
            >
              Barcode
            </Button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submitScanner();
                }
              }}
              disabled={props.disabled}
              className="h-10 pl-9 "
              placeholder={`Escanea ${scanType.toUpperCase()}… (Enter)`}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void submitScanner()}
            disabled={props.disabled || !code.trim()}
            className="h-10"
          >
            Buscar
          </Button>
        </div>
      )}
    </div>
  );
}
