"use client";

import type { JSX, ReactNode } from "react";
import { Settings2 } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  description: ReactNode;
};

export function SettingsIntroCard(props: Props): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-muted-foreground" />
          <CardTitle>{props.title}</CardTitle>
        </div>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}