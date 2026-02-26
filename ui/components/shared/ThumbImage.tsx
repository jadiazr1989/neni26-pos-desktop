"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn, normalizeSrc } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  size?: number; // tamaño cuadrado en px
  className?: string;
  priority?: boolean;
};

export function ThumbImage({
  src,
  alt,
  size = 56,
  className,
  priority,
}: Props) {
  const safeSrc = normalizeSrc(src);

  const [failed, setFailed] = React.useState(false);
  const showImage = !!safeSrc && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden border bg-muted flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={safeSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageIcon className="size-5 text-muted-foreground" />
      )}
    </div>
  );
}
