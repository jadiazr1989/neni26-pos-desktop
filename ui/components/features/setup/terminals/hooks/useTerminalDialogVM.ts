// src/modules/terminals/ui/hooks/useTerminalDialogVM.ts
"use client";

import * as React from "react";
import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";
import type { ComboboxOption } from "@/components/shared/AsyncComboboxSingle";
import type { SubmitPayload } from "../ui/TerminalDialog"; // exportamos el type desde el dialog
import { notify } from "@/lib/notify/notify";

type Mode = "create" | "edit";

export function useTerminalDialogVM(params: {
  open: boolean;
  mode: Mode;
  initial: TerminalDTO | null;
  warehouses: WarehouseListRow[];
  loading?: boolean;
  onSubmit: (p: SubmitPayload) => Promise<void>;
  onClose: () => void;
}) {
  const disabledBase = Boolean(params.loading);

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [submitting, setSubmitting] = React.useState(false);
  const disabled = disabledBase || submitting;

  const isSystem = params.mode === "edit" && params.initial?.isSystem === true;

  React.useEffect(() => {
    if (!params.open) return;

    const t = params.initial;

    setName(t?.name ?? "");
    setCode(t?.code ?? "");
    setWarehouseId(t?.warehouseId ?? (params.warehouses[0]?.id ?? ""));
    setIsActive(t?.isActive ?? true);
  }, [params.open, params.initial, params.warehouses]);

  // Combobox options (local)
  const whOptions = React.useMemo<ComboboxOption[]>(
    () => params.warehouses.map((w) => ({ value: w.id, label: w.name })),
    [params.warehouses],
  );

  const [whSearch, setWhSearch] = React.useState("");

  const whFiltered = React.useMemo(() => {
    const q = whSearch.trim().toLowerCase();
    if (!q) return whOptions;
    return whOptions.filter((x) => x.label.toLowerCase().includes(q));
  }, [whOptions, whSearch]);

  const selectedWarehouseLabel = React.useMemo(() => {
    const id = params.mode === "edit" ? params.initial?.warehouseId : warehouseId;
    if (!id) return "—";
    return params.warehouses.find((w) => w.id === id)?.name ?? "—";
  }, [params.mode, params.initial, params.warehouses, warehouseId]);

  function validate(): { ok: true; value: SubmitPayload } | { ok: false; error: string } {
    const nameNorm = name.trim();
    if (!nameNorm) return { ok: false, error: "Nombre requerido." };

    if (params.mode === "create") {
      const wh = warehouseId.trim();
      if (!wh) return { ok: false, error: "Warehouse requerido." };

      const c = code.trim();
      if (!c) return { ok: false, error: "Código requerido." };

      return { ok: true, value: { mode: "create", warehouseId: wh, code: c, name: nameNorm } };
    }

    // EDIT
    if (!params.initial?.id) return { ok: false, error: "Terminal inválido." };

    // SYSTEM: solo name (warehouse y estado se congelan)
    if (isSystem) {
      return {
        ok: true,
        value: {
          mode: "edit",
          id: params.initial.id,
          warehouseId: params.initial.warehouseId,
          name: nameNorm,
          isActive: params.initial.isActive,
        },
      };
    }

    const wh = warehouseId.trim();
    if (!wh) return { ok: false, error: "Warehouse requerido." };

    return {
      ok: true,
      value: { mode: "edit", id: params.initial.id, warehouseId: wh, name: nameNorm, isActive },
    };
  }

  async function submit() {
    const v = validate();
    if (!v.ok) {
      notify.warning({ title: "Revisa el formulario", description: v.error });
      return;
    }

    setSubmitting(true);
    try {
      await params.onSubmit(v.value);
      params.onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    params.mode === "create" ? "Nuevo terminal" : isSystem ? "Terminal del sistema" : "Editar terminal";

  const subtitle =
    params.mode === "create"
      ? "Crea un terminal y asígnalo a un warehouse."
      : isSystem
        ? "Este terminal viene por defecto (seed). Solo se permite cambiar el nombre."
        : "Actualiza nombre/estado y reasigna el warehouse si es necesario.";

  return {
    // flags
    isSystem,
    disabled,

    // header
    title,
    subtitle,

    // form state
    name,
    setName,
    code,
    setCode,
    warehouseId,
    setWarehouseId,
    isActive,
    setIsActive,

    // combobox
    whSearch,
    setWhSearch,
    whFiltered,

    // info
    selectedWarehouseLabel,

    // actions
    submit,
  };
}
