'use client'

export function EmptyBlock(props: { loading: boolean; label: string }) {
  return (
    <div className="h-56 rounded-xl border border-border bg-accent/10 grid place-items-center">
      <div className="text-sm text-muted-foreground">
        {props.loading ? props.label : "Sin datos"}
      </div>
    </div>
  );
}