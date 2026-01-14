"use client";

import type { JSX, ReactNode } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "../types";

function formatMoneyParts(value: number): { dollars: string; cents: string } {
  const fixed = value.toFixed(2); // "12.30"
  const [dollars, cents] = fixed.split(".");
  return { dollars, cents: cents ?? "00" };
}

export function ProductMeta(props: {
  product: Product;
  rightSlot?: ReactNode; // ⭐ favorito aquí
}): JSX.Element {
  const { product, rightSlot } = props;

  const { dollars, cents } = formatMoneyParts(product.pricePerUnit);

  return (
    <div className="flex h-full flex-col">
      {/* TOP BAR: Precio + Favorite (sin solapar imagen) */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="flex items-start leading-none">
          <span className="text-2xl font-extrabold tracking-tight text-red-600">
            ${dollars}
          </span>
          <span
            className={cn(
              "ml-1 text-xs font-bold text-red-600",
              "relative -top-1" // centavos “arriba”
            )}
          >
            {cents}
          </span>
        </div>

        <div className="shrink-0">{rightSlot}</div>
      </div>

      {/* IMAGE (sin bordes redondos) */}
      <div className="mt-2 px-3">
        <div className="relative w-full border border-border bg-muted/30">
          <div className="relative aspect-[4/3] w-full">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon className="size-5 opacity-60" />
                <span className="text-[11px]">Sin imagen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-3">
        {/* Nombre */}
        <div className="text-sm font-semibold leading-snug line-clamp-2">
          {product.name}
        </div>

        {/* Descripción */}
        {product.description ? (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </div>
        ) : null}

        {/* Meta */}
        <div className="mt-1 text-[11px] text-muted-foreground">
          {product.soldBy === "MEASURE" ? "Por medida" : "Por unidad"}
          {product.optionGroups && product.optionGroups.length > 0
            ? " · Con opciones"
            : ""}
          <span className="ml-2">· {product.unit}</span>
        </div>
      </div>
    </div>
  );
}
