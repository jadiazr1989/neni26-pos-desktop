// src/components/shared/EntityAvatar.tsx
"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

export function EntityAvatar(props: {
  src?: string | null;
  alt: string;
  size?: number; // px
  className?: string;
}) {
  const size = props.size ?? 36;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-muted/30 grid place-items-center",
        props.className
      )}
      style={{ width: size, height: size }}
    >
      {props.src ? (
        <Image
          src={props.src}
          alt={props.alt}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-[10px] text-muted-foreground select-none">—</span>
      )}
    </div>
  );
}
