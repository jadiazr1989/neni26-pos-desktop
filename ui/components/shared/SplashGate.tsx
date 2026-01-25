// src/components/shared/SplashGate.tsx
"use client";

export function SplashGate(props: { title?: string; subtitle?: string }) {
  return (
    <div className="h-screen w-screen grid place-items-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <div className="text-center">
          <div className="text-base font-medium">{props.title ?? "Cargando…"}</div>
          {props.subtitle ? (
            <div className="text-sm text-muted-foreground">{props.subtitle}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
