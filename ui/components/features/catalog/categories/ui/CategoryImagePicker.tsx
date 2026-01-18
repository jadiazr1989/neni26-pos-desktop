// src/modules/catalog/category/ui/CategoryImagePicker.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CategoryImagePicker(props: {
  value: File | null;
  onChange: (f: File | null) => void;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!props.value) return setPreview(null);
    const url = URL.createObjectURL(props.value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [props.value]);

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">Imagen</div>

      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            props.onChange(f);
          }}
        />

        {props.value && (
          <Button variant="secondary" onClick={() => props.onChange(null)}>
            Quitar
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border p-3 bg-muted/20">
        {preview ? (
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
              <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{props.value?.name}</div>
              <div className="text-xs text-muted-foreground">
                {(props.value?.size ?? 0) / 1024 < 1024
                  ? `${Math.round((props.value?.size ?? 0) / 1024)} KB`
                  : `${(((props.value?.size ?? 0) / 1024) / 1024).toFixed(2)} MB`}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Selecciona un archivo para ver preview.
          </div>
        )}
      </div>
    </div>
  );
}
