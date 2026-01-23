"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      {...props}
      position={props.position ?? "bottom-right"}
      richColors // ✅ ayuda con colores base
      closeButton
    />
  );
}
