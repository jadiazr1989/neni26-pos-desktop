import { JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GateBanner(props: {
  visible: boolean;
  title: string;
  subtitle: string;
  cta: string;
  onCta: () => void;
}): JSX.Element | null {
  if (!props.visible) return null;

  return (
    <Card className="border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10">
      <CardContent className="py-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{props.title}</p>
          <p className="text-xs text-muted-foreground">{props.subtitle}</p>
        </div>
        <Button onClick={props.onCta}>{props.cta}</Button>
      </CardContent>
    </Card>
  );
}
