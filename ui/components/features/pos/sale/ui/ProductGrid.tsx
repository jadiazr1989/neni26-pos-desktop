"use client";

import type { JSX } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

export function ProductGrid(props: {
  products: Product[];
  onPick: (p: Product) => void;
}): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {props.products.map((p) => (
        <ProductCard key={p.id} product={p} onPick={props.onPick} />
      ))}
    </div>
  );
}
