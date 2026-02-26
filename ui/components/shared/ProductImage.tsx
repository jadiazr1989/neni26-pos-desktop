"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn, isHttpUrl } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  rounded?: "md" | "lg" | "xl";
};

const roundMap = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
} as const;

export function ProductImage({
  src,
  alt,
  className,
  priority,
  rounded = "md",
}: Props) {
 const safeSrc =
    typeof src === "string" && src.trim().length > 0 ? src.trim() : null;

  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const showImage = !!safeSrc && !failed;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-border bg-muted/30",
        roundMap[rounded],
        className
      )}
    >
      {/* Aspect ratio */}
      <div className="relative aspect-[4/3] w-full">
        {/* Skeleton */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-muted/60",
            "transition-opacity duration-300",
            loaded ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Imagen */}
        {showImage ? (
          <Image
            src={safeSrc}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover",
              "transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageIcon className="size-6 opacity-60" />
            <span className="text-[11px]">Sin imagen</span>
          </div>
        )}

        {/* Overlay suave para acabado enterprise */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10"
        />
      </div>
    </div>
  );
}
