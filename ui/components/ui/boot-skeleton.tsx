"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BootLoading() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative w-full max-w-md space-y-4 p-6">
        {/* micro feedback */}
        <div className="absolute right-6 top-6 flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="size-3 animate-spin" />
          Booting
        </div>

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    </div>
  );
}
