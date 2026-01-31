"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import * as React from "react";

export function PurchaseItemPicker(props: {
  disabled: boolean;
  onSubmitVariantId: (variantIdOrScan: string) => void;
}) {
  const [q, setQ] = React.useState("");

  const submit = React.useCallback(() => {
    const v = q.trim();
    if (!v) return;
    props.onSubmitVariantId(v);
    setQ("");
  }, [q, props]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={props.disabled}
          className="h-10 pl-9 "
          placeholder="Escanea o pega el ID de variante… (Enter para agregar)"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={submit}
        disabled={props.disabled || q.trim() === ""}
        className="h-10"
      >
        Agregar
      </Button>
    </div>
  );
}
